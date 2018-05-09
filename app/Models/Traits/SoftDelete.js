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

		/**
		 * Find the rows that have not been discarded yet
		 * @param  {Database} query The query builder
		 * @return {Database}       
		 */
		Model.scopeNotDeleted = function(query) {
			return query.whereNull('deleted_at')
		}

		/**
		 * Find only the rows that have been discarded 
		 * @param  {Database} query The query builder
		 * @return {Database}       
		 */
		Model.scopeDiscardedOnly = function(query) {
			return query.whereNotNull('deleted_at')
		}
	}
}

module.exports = SoftDelete
