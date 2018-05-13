'use strict'

const Model = use('Model')

class Guardian extends Model {

	/**
	 * Set the default Guardians settings for this entry
	 * @return {Void} 
	 */
	generateDefault() {
		this.notify_self = true;
		this.notify_wecare = true;
		this.heart_min = 60;
		this.heart_max = 160;
		this.breath_min = 10;
		this.breath_max = 30;
	}	

	/**
	 * Return the user to whom these Guardians settings are for
	 * @return {User}
	 */
	user() {
		return this.belongsTo('App/Models/User')
	}
}

module.exports = Guardian
