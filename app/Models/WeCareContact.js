'use strict'

const Model = use('Model')

class WeCareContact extends Model {	
	static boot () {
    	super.boot()
    	this.addTrait('SoftDelete')
  	}

    /**
     * Add columns to be casted and treated as dates
     * @return {Array} 
     */
    static get dates() {
        return super.dates.concat(['deleted_at'])
    }

    /**
     * Format the date to be returned by the API
     * @param  {String} field Name of the field
     * @param  {Object} value moment.js instance of the date
     * @return {String}       
     */
    static castDates(field, value) {
        return `${value.fromNow(true)} ago`
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
