'use strict'

const Model = use('Model')

class WeCareContact extends Model {	
	static boot () {
    	super.boot()
    	this.addTrait('SoftDelete')
  	}

  	/**
  	 * Get all the users who have this contact as one of their WeCare emergencies
  	 * @return {Array} 
  	 */
  	users() {
  		return this.belongsToMany('App/Models/User').pivotTable('user_contacts')
  	}
}

module.exports = WeCareContact
