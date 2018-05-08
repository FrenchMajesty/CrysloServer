'use strict'

const VerificationCode = use ('App/Models/VerificationCode')
const { validate } = use('Validator')

class AuthController {

	/**
	 * Handle a request to login by a user
	 * @param  {Object} options.request The HTTP request object
	 * @param  {Object} options.auth    The Auth module
	 * @return {String}                 
	 */
	async login({request, auth}) {
		const { email, password } = request.all()

		// return the JWT
	    return await auth.attempt(email, password)
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
	 * Handle a request to verify whether a phone number is good for use or not
	 * @param  {Object} options.request  The HTTP request object
	 * @param  {Object} options.response The HTTP response object
	 * @return {Object}                  
	 */
	async validateNumber({request, response}) {
		const validator = await validate(request.all(), {
			number: 'required|unique:users',
		}, getValidationMessages())

		if(validator.fails()) {
			return response.status(422).json(validator.messages())
		}

		// Create a verificaton code
		const code = new VerificationCode()
		code.number = request.input('number')
		code.generateCode()
		code.save()

		return response.status(200).json(true)
	}

	/**
	 * Handle a request to check if a valid verification code was submitted
	 * @param  {Object} options.request  The HTTP request object
	 * @param  {Object} options.response The HTTP response object
	 * @return {Object}                  
	 */
	async verifyNumber({request, response}) {
		const validator = await validate(request.all(), {
			number: 'required|unique:users',
			code: 'required',
		}, getValidationMessages())

		if(validator.fails()) {
			return response.status(422).json(validator.messages())
		}
		const {code, number} = request.all()
		const codeEntry = await VerificationCode.query()
			.where({code, number})
  			.orderBy('id', 'desc')
  			.fetch()[0]

  		if(!codeEntry) {
  			return response.status(404).json({message: 'The verification code provided is invalid.'})
  		}

		VerificationCode.query().where({code, number}).delete()

  		return response.status(200).json(true)
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
	}
}

module.exports = AuthController
