'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.0/routing
|
*/

const Route = use('Route')

Route.get('/', ({ request }) => {
  return { greeting: 'Look.If you are reading this, then this is the start of something new. The foundation of the server for Cryslo...' }
})

Route.post('/login', 'AuthController.login').as('login')

Route.post('/resetpwd', 'AuthController.resetPassword').as('reset.pwd')

Route.group(() => {

	Route.post('/email', 'AuthController.validateEmail').as('validate.email')

	Route.post('/number/signup', 'AuthController.validateNumberSignUp')
		.as('validate.number.signup')

	Route.post('/number/forgotpwd', 'AuthController.validateNumberForgotPwd')
		.as('validate.number.forgotpwd')

	Route.post('/verify', 'AuthController.verifyNumber').as('verify.number')

}).prefix('/validate').formats(['json'])

Route.group(() => {

	Route.get('/user', 'UserController.user').as('user')

	Route.get('/readingData', 'ReadingController.thisMonth').as('reading.data')

	Route.post('/readingData', 'ReadingController.selectedMonth').as('select.reading.data')

	Route.get('/ref/apply/user', 'ReferralController.applyAsUser').as('ref.apply.user')

}).middleware(['auth']).formats(['json'])

Route.resource('ref', 'ReferralController')
	.apiOnly()
	.formats(['json'])

Route.resource('guardian', 'GuardianController')
	.apiOnly()
	.middleware(['auth'])
	.formats(['json'])

Route.resource('wecare', 'ContactController')
	.apiOnly()
	.middleware(['auth'])
	.middleware(new Map([ [['wecare.all'],['admin']] ]))
	.formats(['json'])

Route.resource('users', 'UserController')
	.apiOnly()
	.middleware(new Map([ [['users.update','users'],['auth']] ]))
	.middleware(new Map([ [['users.index'],['admin']] ]))
	.formats(['json'])
