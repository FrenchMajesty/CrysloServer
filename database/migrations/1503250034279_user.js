'use strict'

const Schema = use('Schema')

class UserSchema extends Schema {
    up () {
        this.create('users', table => {
            table.increments()
            table.string('firstname').nullable()
            table.string('lastname').nullable()
            table.string('email').notNullable().unique()
            table.string('password').notNullable()
            table.string('number').notNullable().unique()
            table.boolean('number_verified').defaultTo(false)
            table.timestamps(true, true)
            table.timestamp('deleted_at').nullable()
        })
    }

    down () {
        this.drop('users')
    }
}

module.exports = UserSchema
