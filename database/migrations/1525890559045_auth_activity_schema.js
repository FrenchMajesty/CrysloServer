'use strict'

const Schema = use('Schema')

class AuthActivitySchema extends Schema {
	up () {
		this.create('auth_activities', (table) => {
			table.increments()
			table.integer('user_id').notNullable()
			table.string('action').notNullable()
			table.timestamps(true, true)
		})
	}

	down () {
		this.drop('auth_activities')
	}
}

module.exports = AuthActivitySchema
