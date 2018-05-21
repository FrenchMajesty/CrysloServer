'use strict'

const Model = use('Model')

class Onboarding extends Model {

	/**
	 * Get the user model to whom this Onboarding record belongs to
	 * @return {User} 
	 */
	user() {
		return this.belongsTo('App/Models/User')
	}
}

module.exports = Onboarding
