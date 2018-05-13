'use strict'

const AuthActivity = use('App/Models/AuthActivity')
const User = use('App/Models/User')
const { validate } = use('Validator')

class UserController {

	/**
	 * Return the logged in user's User model
	 * @param {Object} options.request The HTTP Request object
	 * @param  {Object} options.auth The Auth module
	 * @return {User}              
	 */
	async user({request, auth}) {
		const {id} = await auth.getUser()
		const query = User.query().where({id})

		if(request.input('withRank',false)) {
			query.with('rank')
		}

		if(request.input('withContact',false)) {
			query.with('contacts', (query) => query.notDeleted())
		}

		if(request.input('withReferred',false)) {
			query.with('referred')
		}

		if(request.input('withReferree',false)) {
			query.with('referree')
		}

		if(request.input('withAuthHistory',false)) {
			query.with('authHistory')
		}

		if(request.input('withHeartData',false)) {
			query.with('heartData')
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
	 * @param {Object} options.auth The Auth module
	 * @return {User}                 
	 */
	async store({request, response, auth}) {
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

		// Generate JWT Token
		const {token} = await auth.generate(user)
		user.token = token

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

	/**
	 * Handle a request to update an user's profile
	 * @param  {Object} options.request The HTTP request object
	 * @param  {Object} options.response The HTTP response object
	 * @param {Object} options.auth The Auth module
	 * @return {Void}                 
	 */
	async update({request, response, auth}) {
		const validation = await validate(request.all(), {
			email: 'required|email',
			firstname: 'required|max:50',
			lastname: 'required|max:50',
		}, getValidationMessages())

		if(validation.fails()) {
			return response.status(422).json(validation.messages())
		}

		const {id} = await auth.getUser()
		const user = await User.find(id)

		// Verify that the email isn't in use by another user
		const {email} = request.all()
		const search = await User.query().whereNot({id}).where({email}).first()

		if(search) {
			return response.status(422).json([{message: 'This email address is already used.'}])
		}

		const userData = request.only(['email','firstname','lastname'])
		user.merge(userData)
		user.save()
	}

	destroy() {

	}
}

function getValidationMessages() {
	return {
		'required': 'The {{ field }} is required.',
		'unique': 'This {{ field }} is already used.',
		'max': 'The {{ field }} is too long.',
		'email.email': 'The email is not valid.',
	}
}

module.exports = UserController
