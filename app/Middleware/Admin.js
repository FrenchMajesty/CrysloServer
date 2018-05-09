'use strict'

const Rank = use('App/Models/Rank')

class Admin {
	async handle ({ request, response, auth }, next) {
		const {rank_id: rId} = await auth.getUser()
		const rank = await Rank.find(rId)

		if(rank.level < 4) {
			return response.status(403).json({message: 'You are not authorized to view this page.'})
		}

		await next()
	}

	async wsHandle ({ request }, next) {
		// call next to advance the request
		await next()
	}
}

module.exports = Admin
