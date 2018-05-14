'use strict'

const Schema = use('Schema')

class BreathUserDataSchema extends Schema {
	up () {
		this.create('breath_user_data', (table) => {
			table.increments()
			table.integer('user_id').notNullable()
			table.string('value').notNullable()
			table.timestamps(true, true)
		})
	}

	down () {
		this.drop('breath_user_data')
	}
}

module.exports = BreathUserDataSchema
