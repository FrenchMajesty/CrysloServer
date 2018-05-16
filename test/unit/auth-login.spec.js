'use strict'

const { test, trait } = use('Test/Suite')('Auth Login')
const AuthActivity = use('App/Models/AuthActivity')
const Guardian = use('App/Models/Guardian')
const Factory = use('Factory')

trait('DatabaseTransactions')
trait('Test/ApiClient')

test('make sure that a user can login', async ({ client, assert }) => {

 	// Given I have a user account and the login credentials
 	const {id: user_id, email} = await Factory.model('App/Models/User').create()
 	const loginData = { email, password: 'secret' }

 	// When a user submit the login credentials to the API
 	const response = await client.post('login')
 		.send(loginData)
 		.accept('json')
 		.end()

 	// Then the user should be logged in and the JWT should be given
 	response.assertStatus(200)
 	assert.isOk(response.body.token, 'No JWT was returned upon login')

 	// And the authentication activity should be recorded
	const auth = await AuthActivity.query().where({user_id, action: 'LOGIN'}).first()
	assert.isOk(auth, 'No auth activity entry was recorded for this newly registered user')
})

test('make sure that a user cannot login without a password', async ({ client, assert }) => {

 	// Given I have a user account and the login credentials but no password
 	const {email} = await Factory.model('App/Models/User').create()
 	const loginData = { email, password: '' }

 	// When a user submit the login credentials to the API
 	const response = await client.post('login')
 		.send(loginData)
 		.accept('json')
 		.end()

 	// Then the request should fail validation with an error message
 	response.assertStatus(422)
 	response.assertError([{
 		message: 'The password is required.',
 		field: 'password',
 		validation: 'required',
 	}])
})

test('make sure that a user cannot login with an invalid password', async ({ client, assert }) => {

 	// Given I have a user account and the wrong login credentials
 	const {id: user_id, email} = await Factory.model('App/Models/User').create()
 	const loginData = { email, password: 'not-a-secret' }

 	// When a user submit the login credentials to the API
 	const response = await client.post('login')
 		.send(loginData)
 		.accept('json')
 		.end()

 	// Then the request should fail with an error message
 	response.assertStatus(401)
 	response.assertError([{
 		field: 'password',
 		message: 'Invalid user password',
 	}])

 	// And the authentication activity should be recorded
	const auth = await AuthActivity.query().where({user_id, action: 'ATTEMPT_LOGIN'}).first()
	assert.isOk(auth, 'No auth activity entry was recorded for this newly registered user')
})

test('make sure that a user cannot login without an email', async ({ client, assert }) => {

 	// Given I have a user account and the login credentials but no email
 	const {email} = await Factory.model('App/Models/User').create()
 	const loginData = { email: '', password: 'secret' }

 	// When a user submit the login credentials to the API
 	const response = await client.post('login')
 		.send(loginData)
 		.accept('json')
 		.end()

 	// Then the request should fail validation with an error message
 	response.assertStatus(422)
 	response.assertError([{
 		message: 'The email is required.',
 		field: 'email',
 		validation: 'required',
 	}])
})

test('make sure that a user cannot login with an incorrect email', async ({ client, assert }) => {

 	// Given I have a user account and the login credentials but an invalid email
 	const {email} = await Factory.model('App/Models/User').create()
 	const loginData = { email: 'not.my.email.NOPE', password: 'secret' }

 	// When a user submit the login credentials to the API
 	const response = await client.post('login')
 		.send(loginData)
 		.accept('json')
 		.end()

 	// Then the request should fail validation with an error message
 	response.assertStatus(422)
 	response.assertError([{
 		message: 'The email is not valid.',
 		field: 'email',
 		validation: 'email',
 	}])
})
