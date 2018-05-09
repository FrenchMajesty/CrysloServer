'use strict'

const AuthActivity = use('App/Models/AuthActivity')
const User = use('App/Models/User')
const { validate } = use('Validator')

class UserController {

	/**
	 * Return the logged in user's User model
	 * @param  {Object} options.auth The Auth module
	 * @return {User}              
	 */
	async user({request, auth}) {
		const {id} = await auth.getUser()
		const {withRank, withContact, withAuthHistory} = request.get()
		const query = User.query().where({id})

		if(withRank) {
			query.with('rank')
		}

		if(withContact) {
			query.with('contacts', (query) => query.notDeleted())
		}

		if(withAuthHistory) {
			query.with('authHistory')	
		}

		return query.first()
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
			number: 'required|max:15|unique:users',
		}, getValidationMessages())

		if(validation.fails()) {
			return response.status(422).json(validation.messages())
		}

		const userData = request.only(['email','password','number'])
		const user = await User.create(userData)
		
		AuthActivity.create({
			user_id: user.id,
			action: 'SIGNUP'
		})

		return user
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
