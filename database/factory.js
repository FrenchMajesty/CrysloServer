'use strict'

/*
|--------------------------------------------------------------------------
| Factory
|--------------------------------------------------------------------------
|
| Factories are used to define blueprints for database tables or Lucid
| models. Later you can use these blueprints to seed your database
| with dummy data.
|
*/

const Factory = use('Factory')
const Hash = use('Hash')

const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

Factory.blueprint('App/Models/User', async (faker) => {
	return {
	 	firstname: faker.first(),
	 	lastname: faker.last(),
	 	email: faker.email(),
	 	number: faker.phone(),
	 	referral_id : faker.string({pool, length: 6}),
	 	password : await Hash.make('secret'),
	}
})

