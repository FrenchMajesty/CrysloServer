'use strict'

const Schema = use('Schema')

class VerificationCodeSchema extends Schema {
    up () {
        this.create('verification_codes', (table) => {
            table.increments()
            table.integer('number').notNullable()
            table.string('code', 15).notNullable()
            table.string('purpose').nullable()
            table.timestamps(true, true)
            table.timestamp('deleted_at').nullable()
        })
    }

    down () {
        this.drop('verification_codes')
    }
}

module.exports = VerificationCodeSchema
