'use strict'

const Schema = use('Schema')

class WeCareContactsSchema extends Schema {
 	up () {
    	this.create('we_care_contacts', (table) => {
	      	table.increments()
	      	table.string('name').notNullable()
	      	table.string('number').notNullable()
	      	table.integer('user_id').notNullable()
	      	table.timestamps(true, true)
            table.timestamp('deleted_at').nullable()
    	})
  	}

  	down () {
    	this.drop('we_care_contacts')
  	}
}

module.exports = WeCareContactsSchema
