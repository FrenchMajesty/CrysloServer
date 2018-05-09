'use strict'

const Database = use('Database')

class SoftDelete {
	register (Model, customOptions = {}) {
		const defaultOptions = {}
		const options = Object.assign(defaultOptions, customOptions)

		/**
		 * Add the helper method to soft delete an entry
		 * @return {Void} 
		 */
		Model.prototype.discard = function() {
			this.deleted_at = Database.fn.now()
			this.save()
		}
	}
}

module.exports = SoftDelete
