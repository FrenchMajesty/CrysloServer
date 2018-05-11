'use strict'

const Contact = use('App/Models/WeCareContact')
const { validate } = use('Validator')

class ContactController {

	/**
	 * Show all the WeCare contact entries
	 * @return {Array} 
	 */
	async index () {
		return Contact.query().notDeleted().fetch()
	}

	/**
	 * Return a WeCare contact entry
	 * @param  {Number} options.params.id The contact's ID
	 * @return {WeCareContact}                 
	 */
	async show({params: {id}}) {
		return Contact.findOrFail(id)
	}

  	/**
	 * Handle the request to create a new WeCare contact 
	 * @param  {Object} options.request  The HTTP request object
	 * @param  {Object} options.response The HTTP response object
	 * @param  {Object} options.auth     The Auth module
	 * @return {WeCareContact}                  
	 */
	async store({request, response, auth, params:{id}}) {
		const validation = await validate(, {
			name: 'required',
			number: 'required|max:10',
		}, getValidationMessages())

		if(validation.fails()) {
			return response.status(422).json(validation.messages())
		}

		const {name, number} = request.all()
		const {id: user_id} = await auth.getUser()

		return Contact.create({name, number, user_id})
	}

	/**
	 * Handle the request to update a user's WeCare contact 
	 * @param  {Object} options.request  The HTTP request object
	 * @param  {Object} options.response The HTTP response object
	 * @param  {Number} options.params.id The contact's ID
	 * @return {Void}                  
	 */
	async update ({request, response, params:{id}}) {
		const validation = await validate({...request.all(), id}, {
			name: 'required',
			number: 'required|max:10',
			id: 'required|exists:we_care_contacts',
		}, getValidationMessages())

		if(validation.fails()) {
			return response.status(422).json(validation.messages())
		}

		const {name, number} = request.all()
		const contact = await Contact.find(id)
		contact.merge({name, number})
		contact.save()
	}

	/**
	 * Handle the request to delete a WeCare contact
	 * @param  {Object} options.request  The HTTP request object
	 * @param  {Object} options.response The HTTP response object
	 * @return {Void}                  
	 */
	async destroy({request, response, params:{id}}) {
		const contact = await Contact.findOrFail(id)
		contact.discard()
	}
}

function getValidationMessages() {
	return {
		'name.required': 'The contact\'s name is required.',
		'number.required': 'The contact\'s phone number is required.',
		'id.required': 'Missing ID: Please select a contact to modify.',
		'number.max': 'The phone number entered is too long.',
		'id.exists': 'This contact does not or no longer exists in our database.',
	}
}

module.exports = ContactController
