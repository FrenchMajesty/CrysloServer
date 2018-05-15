'use strict'

const Schema = use('Schema')

class HeartUserDataSchema extends Schema {
	up () {
		this.create('heart_user_data', (table) => {
			table.increments()
			table.integer('user_id').notNullable()
			table.integer('value').notNullable()
			table.timestamps(true, true)
		})
	}

	down () {
		this.drop('heart_user_data')
	}
}

module.exports = HeartUserDataSchema
