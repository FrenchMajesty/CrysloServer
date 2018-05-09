'use strict'

const Model = use('Model')

class Rank extends Model {
	static boot() {
		super.boot()

		this.addTrait('SoftDelete')
	}

	/**
	 * Get all the users that have this rank
	 * @return {Array} 
	 */
	users() {
		return this.hasMany('App/Models/User')
	}
}

module.exports = Rank
