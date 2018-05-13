'use strict'

const User = use('App/Models/User')
const Referral = use('App/Models/Referral')
const { validate } = use('Validator')

class ReferralController {
	async index () {
	}

	/**
	 * Handle a request to apply a referral code for a new user signing up
	 * @param  {Object} options.request The request HTTP object
	 * @param  {Object} options.auth    The Auth module
	 * @return {Void}                 
	 */
	async store ({request, auth}) {
		const validator = await validate(request.all(), {
			referral_id: 'required|exists:users',
		}, getValidationMessages())

		if(validator.fails()) {
			return response.status(422).json(validator.messages())
		}

		const referralId = request.only(['referral_id'])
		const {id: user_id} = await User.query().select('id').where(referralId).first()
		const {id: new_user_id} = auth.getUser()

		Referral.create({user_id, new_user_id})

		// Apply referral credit to user_id's account here
	}
	async show () {
	}
	
	async update () {
	}

	async destroy () {
	}
}

function getValidationMessages() {
	return {
		'referral_id.required': 'The referral code is required.',
		'referral_id.exists': 'The referral code entered does not exist.',
	}
}

module.exports = ReferralController
