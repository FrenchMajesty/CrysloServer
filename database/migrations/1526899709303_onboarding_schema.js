'use strict'

const Schema = use('Schema')

class OnboardingSchema extends Schema {
	up () {
		this.create('onboardings', (table) => {
			table.increments()
			table.integer('user_id').notNullable().unique()
			table.string('action').notNullable()
			table.timestamps(true, true)
		})
	}

	down () {
		this.drop('onboardings')
	}
}

module.exports = OnboardingSchema
