'use strict'

const Model = use('Model')

class User extends Model {
    static boot () {
        super.boot()

        /**
         * A hook to hash the user password before saving
         * it to the database.
         *
         * Look at `app/Models/Hooks/User.js` file to
         * check the hashPassword method
         */
        this.addHook('beforeCreate', 'User.hashPassword')
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
     * Get the rank associated with this user
     * @return {Rank} 
     */
    rank() {
        return this.belongsTo('App/Models/Rank')
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
