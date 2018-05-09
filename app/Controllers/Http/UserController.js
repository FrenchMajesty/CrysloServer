'use strict'

const User = use('App/Models/User')
const { validate } = use('Validator')

class UserController {

	/**
	 * Return the logged in user's User model
	 * @param  {Object} options.auth The Auth module
	 * @return {User}              
	 */
	async user({auth}) {
		const {id} = await auth.getUser()
		return User.query().where({id})
			.with('rank')
			.with('contacts', (query) => query.notDeleted())
			.first()
	}

	/**
	 * Return all of the users entries
	 * @return {Array} 
	 */
	index() {
		return User.query().notDeleted().fetch()
	}

	/**
	 * Handle a request to register a new user
	 * @param  {Object} options.request The HTTP request object
	 * @param  {Object} options.response The HTTP response object
	 * @return {User}                 
	 */
	async store({request, response}) {
		const validation = await validate(request.all(), {
			email: 'required|email|unique:users',
			password: 'required',
			number: 'required|max:15',
		}, getValidationMessages())

		if(validation.fails()) {
			return response.status(422).json(validation.messages())
		}

		const {email, password, number} = request.all()
		return User.create({email, passord, number})
	}

	/**
	 * Return an user's entry or throw 404 if not found
	 * @param  {Number} options.params.id The user's ID
	 * @return {User}                 
	 */
	show({response, params: {id}}) {
		return User.findOrFail(id)
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
