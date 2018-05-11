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


     /**
     * Format the date to be returned by the API
     * @param  {String} field Name of the field
     * @param  {Object} value moment.js instance of the date
     * @return {String}       
     */
    static castDates(field, value) {
        return value.format('YYYY-MM-DD HH:MM')
    }
}

module.exports = HeartUserData
