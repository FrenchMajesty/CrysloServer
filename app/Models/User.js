'use strict'

const Model = use('Model')

class User extends Model {

	static boot () {
		super.boot()

		this.addHook('beforeCreate', 'User.hashPassword')
		this.addHook('beforeCreate', 'User.referralCode')
		this.addTrait('SoftDelete')
	}

	/**
	 * The fields that should not be included with a JSON response
	 * @return {Array} 
	 */
	static get hidden() {
		return ['password']
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
	 * Get the rank associated with this user
	 * @return {Rank} 
	 */
	rank() {
		return this.belongsTo('App/Models/Rank')
	}

	/**
	 * Get all the of the WeCare contacts this user has
	 * @return {Array} 
	 */
	contacts() {
		return this.hasMany('App/Models/WeCareContact')
	}

	/**
	 * Get the Guardians settings of this user
	 * @return {Guardian} 
	 */
	guardians() {
		return this.hasOne('App/Models/Guardian')
	}

	/**
	 * Get all the users that were referred by this one
	 * @return {Array} 
	 */
	referred() {
		return this.manyThrough('App/Models/Referral','newUser')
	}

	/**
	 * Get the user that referred this one
	 * @return {Array} 
	 */
	referree() {
		return this.belongsToMany('App/Models/User','new_user_id','user_id').pivotTable('referrals')
	}

	/**
	 * Get the auth activity of this user
	 * @return {Array} 
	 */
	authHistory() {
		return this.hasMany('App/Models/AuthActivity')
	}

	/**
	 * Get all the heart measurements for this user
	 * @return {Array} 
	 */
	heartData() {
		return this.hasMany('App/Models/Reading/HeartUserData')
	}

	/**
	 * Get all the breath measurements for this user
	 * @return {Array} 
	 */
	breathData() {
		return this.hasMany('App/Models/Reading/BreathUserData')
	}

	/**
	 * A relationship on tokens is required for auth to
	 * work. Since features like `refreshTokens` or
	 * `rememberToken` will be saved inside the
	 * tokens table.
	 *
	 * @method tokens
	 *
	 * @return {Object}
	 */
	tokens () {
		return this.hasMany('App/Models/Token')
	}
}

module.exports = User
