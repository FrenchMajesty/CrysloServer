'use strict'

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
}

module.exports = AuthController
