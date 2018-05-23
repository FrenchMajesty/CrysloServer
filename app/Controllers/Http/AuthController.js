'use strict'

const VerificationCode = use ('App/Models/VerificationCode')
const AuthActivity = use ('App/Models/AuthActivity')
const User = use ('App/Models/User')
const Hash = use('Hash')
const { validate } = use('Validator')
const Env = use('Env')
const axios = require('axios')

class AuthController {

	/**
	 * Handle a request to login by a user
	 * @param  {Object} options.request The HTTP request object
	 * @param  {Object} options.response The HTTP response object
	 * @param  {Object} options.auth    The Auth module
	 * @return {Token}                 
	 */
	async login({request, response, auth}) {
		const validator = await validate(request.all(), {
			email: 'required|email',
			password: 'required',
		}, getValidationMessages())

		if(validator.fails()) {
			return response.status(422).json(validator.messages())
		}
		const {email, password} = request.all()
		const user = await User.query().select('id').where({email}).first()
		let attempt = null

		if(user) {
			attempt = await AuthActivity.create({user_id: user.id, action: 'ATTEMPT_LOGIN'})
		}

	    const token = await auth.attempt(email, password)

	    // if successful
	    attempt.action = 'LOGIN'
	    attempt.save()
	    return token
	}

	/**
	 * Handle a request to verify whether an email is good for use or not
	 * @param  {Object} options.request  The HTTP request object
	 * @param  {Object} options.response The HTTP response object
	 * @return {Object}                  
	 */
	async validateEmail({request, response}) {
		const validator = await validate(request.all(), {
			email: 'required|email|unique:users',
		}, getValidationMessages())

		if(validator.fails()) {
			return response.status(422).json(validator.messages())
		}

		return response.status(200).json(true)
	}

	/**
	 * Handle a request to generate a verification code for a phone number for creating 
	 * a new account
	 * @param  {Object} options.request  The HTTP request object
	 * @param  {Object} options.response The HTTP response object
	 * @return {Object}                  
	 */
	async validateNumberSignUp({request, response}) {
		const validator = await validate(request.all(), {
			number: 'required|unique:users',
		}, getValidationMessages())

		if(validator.fails()) {
			return response.status(422).json(validator.messages())
		}

		try {
			const {number} = request.all()
			const res = await this.sendVerifCode(number)

			// Create an entry
			const code = new VerificationCode()
			code.fill({
				number, 
				purpose: 'signup',
				code: 0
			})
			code.save()

			return response.status(200).json(res.data)
			
		}catch({response: {data}}) {
			return response.status(422).json(data)
		}
	}

	/**
	 * Handle a request to generate a verification code for a phone number for resetting
	 * a forgotten password 
	 * @param  {Object} options.request  The HTTP request object
	 * @param  {Object} options.response The HTTP response object
	 * @return {Object}                  
	 */
	async validateNumberForgotPwd({request, response}) {
		const validator = await validate(request.all(), {
			number: 'required|exists:users',
		}, getValidationMessages())

		if(validator.fails()) {
			return response.status(422).json(validator.messages())
		}

		try {
			const {number} = request.all()
			const res = await this.sendVerifCode(number)

			// Create an entry
			const code = new VerificationCode()
			code.fill({
				number, 
				purpose: 'forgotpwd',
				code: 0
			})
			code.save()

			return response.status(200).json(res.data)
			
		}catch({response: {data}}) {
			return response.status(422).json(data)
		}
	}

	/**
	 * Handle a request to verify the validity of a verification code sent
	 * @param  {Object} options.request  The HTTP request object
	 * @param  {Object} options.response The HTTP response object
	 * @return {Object}                  
	 */
	async verifyNumber({request, response}) {
		const validator = await validate(request.all(), {
			number: 'required',
			code: 'required',
		}, getValidationMessages())

		if(validator.fails()) {
			return response.status(422).json(validator.messages())
		}

		try {
			const {number, code} = request.all()

			// Submit the request to Twilio
			const params = `?country_code=1&phone_number=${number}&verification_code=${code}`
			const res = await axios.get(`${Env.get('TWILIO_VERIFY_URL')}/check${params}`, {
				headers: { 
					'X-Authy-API-Key': Env.get('TWILIO_VERIFY_API_KEY') 
				}
			})
		
		const codeEntry = await VerificationCode.query()
			.where({number})
			.notDeleted()
  			.orderBy('id', 'desc')
  			.first()

  		codeEntry.discard()

			return response.status(200).json(res.data)
		}catch({response: {data}}) {
			return response.status(422).json(data)
		}		
	}


	/**
	 * Handle the request for a user to reset their password to a new one after forgetting
	 * their previous password
	 * @param  {Object} options.request  The HTTP request object
	 * @param  {Object} options.response The HTTP response object
	 * @return {Void}                  
	 */
	async resetPassword({request, response}) {
		const validator = await validate(request.all(), {
			id: 'required|exists:users',
			password: 'required|min:6|confirmed',
		}, getValidationMessages())

		if(validator.fails()) {
			return response.status(422).json(validator.messages())
		}
		const {password, id} = request.all()
		const user = await User.find(id)
		user.password = await Hash.make(password)
		user.save()

		// Record this action
		AuthActivity.create({user_id: user.id, action: 'RESET_PASSWORD'})
	}

	/**
	 * Submit a request to send a verification code to the SMS dispatcher
	 * @param  {String} phone_number The phone number to text
	 * @return {Promise}              
	 */
	async sendVerifCode(phone_number) {
		const data = {
			phone_number,
			via: 'sms',
			country_code: 1,
			code_length: 5,
			locale: 'en',
		}

		return axios.post(`${Env.get('TWILIO_VERIFY_URL')}/start`, data, {
			headers: { 
				'X-Authy-API-Key': Env.get('TWILIO_VERIFY_API_KEY') 
			}
		})	
	}
}

function getValidationMessages() {
	return {
		'required': 'The {{ field }} is required.',
		'unique': 'This {{ field }} is already used.',
		'confirmed': 'The {{ field }} do not match.',
		'min': 'The {{ field }} needs to be at least 6 characters.',
		'number.required': 'The phone number is required.',
		'number.unique': 'This phone number is already used.',
		'number.exists': 'No account with this phone number was found.',
		'code.required': 'The verification code is required.',
		'email.email': 'The email is not valid.',
	}
}

module.exports = AuthController
