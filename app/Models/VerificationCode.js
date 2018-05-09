'use strict'

const Model = use('Model')

class VerificationCode extends Model {
	static boot () {
    	super.boot()
    	this.addTrait('SoftDelete')
  	}

	/**
	 * Create a random 5 digit code to be used as the verification code
	 * @return {Void} 
	 */
	generateCode() {
		this.code = Math.floor(10000 + Math.random() * 90000);
	}
}

module.exports = VerificationCode
