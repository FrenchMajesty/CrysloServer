'use strict'

const VerificationCode = use ('App/Models/VerificationCode')
const AuthActivity = use ('App/Models/AuthActivity')
const User = use ('App/Models/User')
const { validate } = use('Validator')

class AuthController {

	/**
	 * Handle a request to login by a user
	 * @param  {Object} options.request The HTTP request object
	 * @param  {Object} options.auth    The Auth module
	 * @return {Token}                 
	 */
	async login({request, auth}) {
		const { email, password } = request.all()

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
	 * Handle a request to verify whether a phone number is not in use for creating 
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

		// Create a verificaton code
		const code = new VerificationCode()
		code.fill({
			number: request.input('number'),
			purpose: 'signup',
		})
		code.generateCode()
		code.save()

		return response.status(200).json(true)
	}

	/**
	 * Handle a request to verify whether an account with the given phone number 
	 * exists for resetting a forgotten password 
	 * @param  {Object} options.request  The HTTP request object
	 * @param  {Object} options.response The HTTP response object
	 * @return {Object}                  
	 */
	async validateNumberForgotPwd({request, response}) {
		const validator = await validate(request.all(), {
			number: 'required',
		}, getValidationMessages())

		if(validator.fails()) {
			return response.status(422).json(validator.messages())
		}

		// Create a verificaton code
		const {number} = request.all()
		const code = new VerificationCode()
		code.fill({number, purpose: 'forgotpwd'})
		code.generateCode()
		code.save()

		const {id} = await User.query().where({number}).first()
		return response.status(200).json({id})
	}

	/**
	 * Handle a request to check if a valid verification code was submitted
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

		// Fetch latest matching verification code
		const {code, number} = request.all()
		const codeEntry = await VerificationCode.query()
			.where({code, number})
			.notDeleted()
  			.orderBy('id', 'desc')
  			.first()

  		if(!codeEntry) {
			return response.status(422)
					.json([{message: 'The verification code provided is invalid.'}])
  		}

  		codeEntry.discard()
  		return response.status(200).json(true)
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

		const user = await User.find(id)
		user.password = request.input('password')
		user.save()

		// Record this action
		AuthActivity.create({user_id: user.id, action: 'RESET_PASSWORD'})
	}
}

function getValidationMessages() {
	return {
		'email.required': 'The email is required.',
		'number.required': 'The phone number is required.',
		'number.unique': 'This phone number is already used.',
		'email.unique': 'This email is already used.',
		'email.email': 'The email is not valid.',
		'code.required': 'The verification code is required.',
		'password.min': 'The password needs to be at least 6 characters.',
		'password.confirmed': 'The passwords do not match.',
	}
}

module.exports = AuthController
