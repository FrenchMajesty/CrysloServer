'use strict'

const Model = use('Model')

class WeCareContact extends Model {	
	static boot () {
    	super.boot()
    	this.addTrait('SoftDelete')
  	}
}

module.exports = WeCareContact
