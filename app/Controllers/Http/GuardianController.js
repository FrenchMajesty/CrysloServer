'use strict'

const User = use('App/Models/User')
const Guardian = use('App/Models/Guardian')
const { validate, sanitize } = use('Validator')

class GuardianController {
	async index () {
	}

	async create () {
	}

	async store () {
	}

	async show () {
	}

	async edit () {
	}

	/**
	 * Handle the request of a user to update the Guardian settings
	 * @param  {Object} options.request  The request HTTP object
	 * @param  {Object} options.response The response HTTP object
	 * @param  {Object} options.auth     The Auth module
	 * @return {Void}                  
	 */
	async update ({request, response, auth}) {
		const data = sanitize(request.all(), {
			notify_self: 'to_boolean',
			notify_wecare: 'to_boolean',

			heart_min: 'to_int',
			heart_max: 'to_int',

			breath_min: 'to_int',
			breath_max: 'to_int',
		});

		const validation = await validate(data, {
			notify_self: 'required|boolean',
			notify_wecare: 'required|boolean',
			heart_min: 'required|number',
			heart_max: 'required|number',
			breath_min: 'required|number',
			breath_max: 'required|number',
		}, getValidationMessages())

		if(validation.fails()) {
			return response.status(422).json(validation.messages())
		}

		const {id: user_id} = await auth.getUser()
		const settings = await Guardian.query().where({user_id}).first()
		settings.merge(data)
		settings.save()
	}

	async destroy () {
	}
}


function getValidationMessages() {
	return {
		'notify_self.required': 'The notify settings are required.',
		'notify_wecare.required': 'The notify settings are required.',
		'heart_min.required': 'The minimum heart beat is required.',
		'heart_max.required': 'The maximum heart beat is required.',
		'breath_min.required': 'The minimum breath rate is required.',
		'breath_max.required': 'The maximum breath rate is required.',

		'heart_min.number': 'The minimum heart beat is not a number.',
		'heart_max.number': 'The maximum heart beat is not a number.',
		'breath_min.number': 'The minimum breath rate is not a number.',
		'breath_max.number': 'The maximum breath rate is not a number.',
	}
}

module.exports = GuardianController
