'use strict'

const Onboarding = use('App/Models/Onboarding')
const { validate } = use('Validator')

class OnboardingController {

	/**
	 * Handle a request to report the action of a user during the Onboarding process
	 * @param  {Object} options.request  The HTTP request object
	 * @param  {Object} options.response  The HTTP response object
	 * @param  {Object} options.auth     The Auth module
	 * @return {Void}                  
	 */
	async report ({request, response, auth}) {
		const validation = await validate(request.all(), {
			action: 'required|in:THROUGH,SKIP',
		}, getValidationMessages())

		if(validation.fails()) {
			return response.status(422).json(validation.messages())
		}

		const {id} = await auth.getUser()
		Onboarding.create({
			user_id: id,
			action: request.input('action')
		})
	}
}


function getValidationMessages() {
	return {
		'required': 'The {{ field }} is required.',
		'action.in': 'The action is invalid, the value must be be through or skip.'
	}
}

module.exports = OnboardingController