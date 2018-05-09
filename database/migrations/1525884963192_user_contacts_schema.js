'use strict'

const Schema = use('Schema')

class UserContactsSchema extends Schema {
	up () {
		this.create('user_contacts', (table) => {
			table.increments()
		  	table.integer('we_care_contact_id').notNullable()
		  	table.integer('user_id').notNullable()
		})
	}

	down () {
		this.drop('user_contacts')
	}
}

module.exports = UserContactsSchema
