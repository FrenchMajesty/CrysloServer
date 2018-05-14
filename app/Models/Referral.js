'use strict'

const Database = use('Database')
const Model = use('Model')

class Referral extends Model {

	static boot() {
		super.boot()
	}

	/**
	 * Filter the query to only fetch referral entries that haven't been credited yet
	 * @param  {Database} query Query builder
	 * @return {Database}       
	 */
	static scopeUnused(query) {
		return query.whereNull('credit_applied_at')
	}

	/**
	 * Filter the query to only fetch referral entries that have been credited
	 * @param  {Database} query Query builder
	 * @return {Database}       
	 */
	static scopeCredited(query) {
		return query.whereNotNull('credit_applied_at')
	}

	/**
	 * Mark the current referral action as `used and applied` to the referring user's billing 
	 * cycle 
	 * @return {Void} 
	 */
	credited() {
		this.credit_applied_at = Database.fn.now()
		this.save()
	}

	/**
	 * Get the user model that referred another user
	 * @return {User} 
	 */
	user() {
		return this.belongsTo('App/Models/User')
	}

	/**
	 * Get the user model that was referred
	 * @return {User} 
	 */
	newUser() {
		return this.belongsTo('App/Models/User','new_user_id')
	}
}

module.exports = Referral
