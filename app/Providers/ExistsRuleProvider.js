const { ServiceProvider } = require('@adonisjs/fold')

class ExistsRuleProvider extends ServiceProvider {
    async existsFn (data, field, message, args, get) {
        const value = get(data, field)
        if (!value) {
            return // skip validation if value isn't defined
        }
            const Database = use('Database')
            const [table, column] = args
            const row = await Database.table(table).where(column ? column : field, value).first();
            if (!row) {
                throw message
            }
    }

    boot () {
        const Validator = use('Validator')
        Validator.extend('exists', this.existsFn.bind(this))
    }
}

module.exports = ExistsRuleProvider