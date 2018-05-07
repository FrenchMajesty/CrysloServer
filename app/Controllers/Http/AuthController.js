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

		const code = await VerificationCode.query()
			.where({
				code: request.input('code'),
				number: request.input('number'),
			})
  			.orderBy('id', 'desc')
  			.fetch()[0]

  		if(!code) {
  			return response.status(404).json({message: 'The verification code provided is invalid.'})
  		}

  		await VerificationCode.query()
			.where({
				code: request.input('code'),
				number: request.input('number'),
			})
  			.delete()

  		return resonse.status(200).json(true)
	}
}

function getValidationMessages() {
	return {
		'email.required': 'The email is required.',
		'number.required': 'The phone number is required.',
		'number.unique': 'This phone number is already used.',
		'email.unique': 'This email is already used.',
		'email.email': 'The email is not valid.',
	}
}

module.exports = AuthController
