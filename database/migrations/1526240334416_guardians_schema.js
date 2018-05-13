'use strict'

const Schema = use('Schema')

class GuardiansSchema extends Schema {
	up () {
		this.create('guardians', (table) => {
			table.increments()
			table.integer('user_id').notNullable().unique()
			table.boolean('notify_self').notNullable()
			table.boolean('notify_wecare').notNullable()
			table.integer('heart_min').notNullable()
			table.integer('heart_max').notNullable()
			table.integer('breath_min').notNullable()
			table.integer('breath_max').notNullable()
			table.timestamps()
		})
	}

	down () {
		this.drop('guardians')
	}
}

module.exports = GuardiansSchema
