'use strict'

const Model = use('Model')

class HeartUserData extends Model {

	/**
	 * Get the user to whom this heart data belongs to
	 * @return {User} 
	 */
	user() {
		return this.hasOne('App/Models/User')
	}
}

module.exports = HeartUserData
