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
	 * @param  {Object} options.response The response HTTP object
	 * @param  {Object} options.auth    The Auth module
	 * @return {Void}                 
	 */
	async store ({request, response, auth}) {
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

	/**
	 * Use referral bonuses of a user's to apply them to the current billing cycle
	 * @param {Object} options.response The HTTP response object
	 * @param {Object} options.auth The Auth module
	 * @return {Void} 
	 */
	async applyAsUser ({response, auth}) {
		const {id: user_id} = await auth.getUser()
		const {rows} = await Referral.query().where({user_id}).unused().fetch()

		if(rows.length == 0) {
			return response.status(401).json({message: 'You do not have any referrals bonus available to be applied.'})
		}

		// Call BrainTree method here to apply a credit to that user's account
		// then discard the referrals used
		//rows.forEach(referral => referral.credited())
		return response.send(`A credit for ${rows.length} new users has been applied to your current billing cycle!`)
	}
}

function getValidationMessages() {
	return {
		'referral_id.required': 'The referral code is required.',
		'referral_id.exists': 'The referral code entered does not exist.',
	}
}

module.exports = ReferralController
