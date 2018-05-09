'use strict'

const Model = use('Model')

class WeCareContact extends Model {	
	static boot () {
    	super.boot()
    	this.addTrait('SoftDelete')
  	}

  	/**
  	 * Get the user who has this contact as one of their WeCare emergencies
  	 * @return {Array} 
  	 */
  	users() {
  		return this.belongsTo('App/Models/User')
  	}
}

module.exports = WeCareContact
