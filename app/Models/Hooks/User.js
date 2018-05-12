'use strict'

const Hash = use('Hash')
const crypto = require('crypto')

const UserHook = module.exports = {}

/**
* Hash using password as a hook.
*
* @method
*
* @param  {Object} userInstance
* @return {void}
*/
UserHook.hashPassword = async (userInstance) => {
	if (userInstance.password) {
	userInstance.password = await Hash.make(userInstance.password)
	}
}

/**
 * Create a random referral code
 *
 * @method
 * 
 * @param  {Object} userInstance 
 * @return {Void}              
 */
UserHook.referralCode = async (userInstance) => {
	if(!userInstance.referral_id) {
		userInstance.referral_id = crypto.randomBytes(3).toString('hex').toUpperCase()
	}
}