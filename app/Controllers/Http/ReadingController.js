'use strict'

const BreathData = use('App/Models/Reading/BreathUserData')
const HeartData = use('App/Models/Reading/HeartUserData')
const { validate } = use('Validator')
const moment = require('moment')

class ReadingController {

	/**
	 * Handle a request to store the reading's measurement value
	 * @param  {Object} options.request  The HTTP request object
	 * @param  {Object} options.response  The HTTP response object
	 * @param  {Object} options.auth     The Auth module
	 * @return {BreathData|HeartData}                  
	 */
	async store ({request, response, auth}) {
		const value = Number(request.input('value'))
		const validation = await validate({...request.all(), value}, {
			type: 'required|in:breath,heart',
			value: 'required|integer'
		}, getValidationMessages())

		if(validation.fails()) {
			return response.status(422).json(validation.messages())
		}

		const {type} = request.all()
		const {id: user_id} = await auth.getUser()

		switch(type) {

			case 'breath':
				return BreathData.create({user_id, value})

			case 'heart':
				return HeartData.create({user_id, value})

			default:
				return
		}
	}

	/**
	 * Get all of the reading measurements data for this month of the logged in user
	 * @param  {Object} options.auth The Auth module
	 * @return {Object}              
	 */
	async thisMonth ({auth}) {
		const {id: user_id} = await auth.getUser()
		const thisMonth = [
			moment().startOf('month').format(),
			moment().endOf('month').format()
		]
			
		// Fetch data
		const breathData = await BreathData.query()
			.select('value','created_at')
			.whereBetween('created_at', thisMonth)
			.where({user_id})
			.fetch()

		const heartData = await HeartData.query()
			.select('value','created_at')
			.whereBetween('created_at', thisMonth)
			.where({user_id})
			.fetch()

		const data = [
			{data: breathData.rows, type: 'breath' },
			{data: heartData.rows, type: 'heart' },
		]

		return this.formatData(data)
	}

	/**
	 * Get all of the reading measurements data of the logged in user for the selected month
	 * @param  {Object} options.auth The Auth module
	 * @return {Object}              
	 */
	async selectedMonth ({request, response, auth}) {
		const validation = await validate(request.all(), {
			date: 'required|date',
		}, getValidationMessages())

		if(validation.fails()) {
			return response.status(422).json(validation.messages())
		}

		const date = moment(request.input('date'), 'YYYY-MM-DD')
		const {id: user_id} = await auth.getUser()
		const thisMonth = [
			date.startOf('month').format(),
			date.endOf('month').format()
		]

		// Fetch data
		const breathData = await BreathData.query()
			.select('value','created_at')
			.whereBetween('created_at', thisMonth)
			.where({user_id})
			.fetch()

		const heartData = await HeartData.query()
			.select('value','created_at')
			.whereBetween('created_at', thisMonth)
			.where({user_id})
			.fetch()

		const data = [
			{data: breathData.rows, type: 'breath' },
			{data: heartData.rows, type: 'heart' },
		]

		return this.formatData(data, date)
	}

	/**
	 * Handles the organizating and formatting of the user measurement data to match the
	 * front-end calendar format
	 * @param  {Array} data    The list of data rows and type to organize
	 * @param  {Moment} dateArg A Moment.js date instance
	 * @return {Object}         
	 */
	formatData(data, dateArg) {
		const momentDate = typeof dateArg !== 'undefined' ? dateArg : moment()
		const organized = {}
		const averages = {}

		// Organize the datas per day
		for(const loop of data) {
			loop.data.forEach(entry => {
				const date = moment(entry.created_at).format('YYYY-MM-DD')
				entry.type = loop.type
				entry.date = date
				organized[date] ? organized[date].push(entry) : organized[date] = [entry]				
			})
		}

		// Organize the same vital data together per day
		for(const date in organized) {
			organized[date].forEach(({value, type}) => {
				averages[date] =  averages[date] ? averages[date] : {}

				// Add that entry's value to the array if it exists or set as first value
				averages[date][type] ? 
				averages[date][type].push(value) 
				: averages[date][type] = [value]
			})
		}

		// Calculate the averages of all reading per day
		for(const date in averages) {
			for(const readingType in averages[date]) {
				let typeForThatDay = averages[date][readingType]

				if(typeForThatDay) {
					const total = typeForThatDay.reduce((sum, value) => sum + value)
					averages[date][readingType] = Math.ceil(total / typeForThatDay.length)
				}
			}
		}

		// Organize the resulting averages per day and reading type
		let result = {}
		for(const date in averages) {
			result[date] = []

			for(const readingType in averages[date]) {
				const dateHasType = organized[date].some(({type}) => type == readingType)

				if(dateHasType) {
					const newEntry = { date, type: readingType, value: averages[date][readingType] }
					result[date].push(newEntry)	
				}
			}
		}

		// Populate empty dates
		const emptyDates = {}
		const days = momentDate.daysInMonth()
		for(let i = 1; i <= days; i++) {
			emptyDates[momentDate.date(i).format('YYYY-MM-DD')] = []
		}

		const final = Object.assign(emptyDates, result)
		const results = {};

		for(const date in final) {
			// Filter out dates that are in the future
			if(moment(date).unix() < moment().unix()) {
				results[date] = final[date];
			}
		}

		return results;
	}
}

function getValidationMessages() {
	return {
		'required': 'The {{ field }} is required.',
		'in': 'The {{ field }} is not one of the allowed values.',
		'integer': 'The {{ field }} is not a valid integer.',
		'date': 'The date is not valid.',
	}
}

module.exports = ReadingController
