'use strict'

const Schema = use('Schema')

class ReferralSchema extends Schema {
	up () {
		this.create('referrals', (table) => {
			table.increments()
			table.integer('user_id').notNullable()
			table.integer('new_user_id').notNullable().unique()
			table.timestamps()
		})
	}

	down () {
		this.drop('referrals')
	}
}

module.exports = ReferralSchema
