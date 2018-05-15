'use strict'

const BreathData = use('App/Models/Reading/BreathUserData')
const HeartData = use('App/Models/Reading/HeartUserData')
const moment = require('moment')

class ReadingController {

	async dataForThisMonth ({auth}) {
		const {id: user_id} = await auth.getUser()

		const thisMonth = [moment().startOf('month').format(), moment().endOf('month').format()]
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

		const organized = {}
		const averages = {}

		const data = [
			{data: breathData.rows, type: 'breath' },
			{data: heartData.rows, type: 'heart' },
		]

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
		const days = moment().daysInMonth()
		for(let i = 1; i <= days; i++) {
			emptyDates[moment().date(i).format('YYYY-MM-DD')] = []
		}

		return Object.assign(emptyDates, result)
	}
}

module.exports = ReadingController
