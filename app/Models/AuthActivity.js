'use strict'

const Model = use('Model')

class AuthActivity extends Model {

	/**
	 * Get the user account of which this auth action was performed
	 * @return {User} 
	 */
	user() {
		return this.belongsTo('App/Models/User')
	}
}

module.exports = AuthActivity
