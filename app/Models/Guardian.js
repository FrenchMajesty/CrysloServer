'use strict'

const Model = use('Model')

class Guardian extends Model {

	/**
	 * Return the user to whom these Guardians settings are for
	 * @return {User}
	 */
	user() {
		return this.belongsTo('App/Models/User')
	}
}

module.exports = Guardian
