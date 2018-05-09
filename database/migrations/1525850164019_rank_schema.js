'use strict'

const Schema = use('Schema')

class RankSchema extends Schema {
	up () {
		this.create('ranks', (table) => {
			table.increments()
			table.integer('level').notNullable()
			table.string('title').notNullable()
			table.timestamps()
		})
	}

	down () {
		this.drop('ranks')
	}
}

module.exports = RankSchema
