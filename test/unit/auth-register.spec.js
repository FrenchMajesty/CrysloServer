'use strict'

const { test, trait, before } = use('Test/Suite')('Auth Register')
const Guardian = use('App/Models/Guardian')
const Factory = use('Factory')

trait('DatabaseTransactions')
trait('Test/ApiClient')

test('make sure that a user can sign up', async ({ client, assert }) => {

	// Given I have a user's information
	const {email, password, number} = await Factory.model('App/Models/User').make()
	const userData = { email, password, number }

	// When the user submit their info to the API
	const response = await client.post('/users')
		.send(userData)
		.accept('json')
		.end()

	// Then a user account should be created with default Guardian settings
	response.assertStatus(200)
	response.assertJSONSubset({email, number})

	const settings = await Guardian.query().where({user_id: response.body.id}).first()
	assert.isOk(settings, 'No guardians settings entry was found for this newly registered user')
})

test('make sure that a user cannot sign up without an email', async ({ client, assert }) => {

	// Given I have a user's information but no email
	const {password, number} = await Factory.model('App/Models/User').make()
	const userData = { password, number }

	// When the user submit their info to the API
	const response = await client.post('/users')
		.send(userData)
		.accept('json')
		.end()

	// Then the request should fail validation and an error message should be returned
	response.assertStatus(422)
	response.assertError([{
		message: 'The email is required.',
		field: 'email',
		validation: 'required',
	}])
})

test('make sure that a user cannot sign up without a password', async ({ client, assert }) => {

	// Given I have a user's information but no password
	const {email, number} = await Factory.model('App/Models/User').make()
	const userData = { email, number }

	// When the user submit their info to the API
	const response = await client.post('/users')
		.send(userData)
		.accept('json')
		.end()

	// Then the request should fail validation and an error message should be returned
	response.assertStatus(422)
	response.assertError([{
		message: 'The password is required.',
		field: 'password',
		validation: 'required',
	}])
})

test('make sure that a user cannot sign up without a phone number', async ({ client, assert }) => {

	// Given I have a user's information but no phone number
	const {email, password} = await Factory.model('App/Models/User').make()
	const userData = { email, password }

	// When the user submit their info to the API
	const response = await client.post('/users')
		.send(userData)
		.accept('json')
		.end()

	// Then the request should fail validation and an error message should be returned
	response.assertStatus(422)
	response.assertError([{
		message: 'The number is required.',
		field: 'number',
		validation: 'required',
	}])
})

test('make sure that a user cannot sign up with an incorrect email', async ({ client, assert }) => {

	// Given I have a user's information but with a made-up email
	const {password, number} = await Factory.model('App/Models/User').make()
	const userData = { email: 'notRealEmail', password, number }

	// When the user submit their info to the API
	const response = await client.post('/users')
		.send(userData)
		.accept('json')
		.end()

	// Then the request should fail validation and an error message should be returned
	response.assertStatus(422)
	response.assertError([{
		message: 'The email is not valid.',
		field: 'email',
		validation: 'email',
	}])
})

test('make sure that a user cannot sign up with the email of an existing user', async ({ client, assert }) => {

	// Given I have an existing user and a new user's information but with
	// the same email
	const existingUser = await Factory.model('App/Models/User').create()
	const {password, number} = await Factory.model('App/Models/User').make()
	const userData = { email: existingUser.email, password, number }

	// When the user submit their info to the API
	const response = await client.post('/users')
		.send(userData)
		.accept('json')
		.end()

	// Then the request should fail validation and an error code should be returned
	response.assertStatus(422)
	response.assertError([{
		message: 'This email is already used.',
		field: 'email',
		validation: 'unique',
	}])
})

test('make sure that a user cannot sign up with the phone number of an existing user', async ({ client, assert }) => {

	// Given I have an existing user and a new user's information but with the same
	// phone number
	const existingUser = await Factory.model('App/Models/User').create()
	const {email, password} = await Factory.model('App/Models/User').make()
	const userData = { email, password, number: existingUser.number }

	// When the user submit their info to the API
	const response = await client.post('/users')
		.send(userData)
		.accept('json')
		.end()

	// Then the request should fail validation and an error code should be returned
	response.assertStatus(422)
	response.assertError([{
		message: 'This number is already used.',
		field: 'number',
		validation: 'unique',
	}])
})


test('make sure that a user cannot sign up if the phone number is too long', async ({ client, assert }) => {

	// Given I have a new user's information but with a phone number longer
	// than 15 characters 
	const {email, password, number} = await Factory.model('App/Models/User').make()
	const userData = { email, password, number: '1'.repeat(16) }

	// When the user submit their info to the API
	const response = await client.post('/users')
		.send(userData)
		.accept('json')
		.end()

	// Then the request should fail validation and an error code should be returned
	response.assertStatus(422)
	response.assertError([{
		message: 'The number is too long.',
		field: 'number',
		validation: 'max',
	}])
})

