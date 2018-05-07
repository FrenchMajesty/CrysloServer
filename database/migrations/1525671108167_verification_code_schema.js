'use strict'

const Schema = use('Schema')

class VerificationCodeSchema extends Schema {
  up () {
    this.create('verification_codes', (table) => {
      table.increments()
      table.integer('number').notNullable()
      table.string('code', 15).notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('verification_codes')
  }
}

module.exports = VerificationCodeSchema
