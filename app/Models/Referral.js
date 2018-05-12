'use strict'

const Model = use('Model')

class Referral extends Model {

	/**
	 * Get the user model that referred another user
	 * @return {User} 
	 */
	user() {
		return this.belongsTo('App/Models/User')
	}

	/**
	 * Get the user model that was referred
	 * @return {User} 
	 */
	newUser() {
		return this.belongsTo('App/Models/User','new_user_id')
	}
}

module.exports = Referral
