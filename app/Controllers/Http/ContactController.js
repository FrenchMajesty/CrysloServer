'use strict'

const Contact = use('App/Models/WeCareContact')
const { validate } = use('Validator')

class ContactController {

	async index () {
	}

	async store () {
	}

  	/**
	 * Handle the request to create a new WeCare contact 
	 * @param  {Object} options.request  The HTTP request object
	 * @param  {Object} options.response The HTTP response object
	 * @param  {Object} options.auth     The Auth module
	 * @return {WeCareContact}                  
	 */
	async store({request, response, auth}) {
		const validation = await validate(request.all(), {
			name: 'required',
			number: 'required|max:10',
		}, getValidationMessages())

		if(validation.fails()) {
			return response.status(403).json(validation.messages())
		}

		const {name, number} = request.all()
		const {id: user_id} = auth.getUser()

		return new Contact.create({name, number, user_id})
	}

	async edit () {
	}

	async update () {
	}

	/**
	 * Handle the request to delete a WeCare contact
	 * @param  {Object} options.request  The HTTP request object
	 * @param  {Object} options.response The HTTP response object
	 * @return {Void}                  
	 */
	async destroy({request, response}) {
		const validation = await validate(request.all(), {
			id: 'required|exists:we_care_contacts',
		}, getValidationMessages())

		if(validation.fails()) {
			return response.status(403).json(validation.messages())
		}

		const contact = await new Contact.find(request.input('id'))
		contact.delete()
	}
}

function getValidationMessages() {
	return {
		'name.required': 'The contact\'s name is required.',
		'number.required': 'The contact\'s phone number is required.',
		'number.max': 'The phone number entered is too long.',
		'id.exists': 'This contact no longer exists in our database.',
	}
}

module.exports = ContactController
