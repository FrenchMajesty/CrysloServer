'use strict'

const User = use('App/Models/User')
const { validate } = use('Validator')

class UserController {

	/**
	 * Return the request user's User model
	 * @param  {Object} options.auth The Auth module
	 * @return {Object}              
	 */
	user({auth}) {
		return auth.getUser()
	}

	/**
	 * Return all of the users entries
	 * @return {Array} 
	 */
	index() {
		return User.all()
	}

	/**
	 * Handle a request to register a new user
	 * @param  {Object} options.request The HTTP request object
	 * @param  {Object} options.response The HTTP response object
	 * @return {Object}                 
	 */
	async store({request, response}) {
		const validation = await validate(request.all(), {
			email: 'required|email|unique:users',
			password: 'required',
			number: 'required|max:15',
		}, getValidationMessages())

		if(validation.fails()) {
			return response.status(403).json(validation.messages()[0])
		}

		const newUser = new User()
		newUser.email = request.input('email')
		newUser.password = request.input('password')
		newUser.number = request.input('number')
		await newUser.save()

		return newUser
	}

	/**
	 * Return an user's entry or throw 404 if not found
	 * @param  {Number} options.params.id The user's ID
	 * @return {Object}                 
	 */
	show({response, params: {id}}) {
		const user = User.findOrFail(id)
		return user
	}

	update() {

	}

	destroy() {

	}
}

function getValidationMessages() {
	return {
		'email.required': 'The email is required.',
		'password.required': 'The password is required.',
		'number.required': 'The phone number is required.',
		'number.unique': 'This phone number is already used.',
		'email.email': 'The email is not valid.',
		'email.unique': 'This email is already used.',
		'number.max': 'The phone number is too long.',
	}
}

module.exports = UserController
