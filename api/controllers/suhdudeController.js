// Create functions to query the suh-dude db.
// Retreiving messages, group info from db for frontend app to hit.

const async = require('async');
const isEqual = require('lodash.isequal');

const mongoose = require('mongoose');
const querystring = require('querystring');

const groupmeController = require('./groupmeController');

const Message = mongoose.model('Message');

function getLastMsgID() {
	return Message.findOne().sort({ created_at: -1 });
}

async function addMessages(req, res) {
	const groupID = req.params.group_id;
	const lastMsg = await getLastMsgID();
	let lastMsgID = lastMsg.id;
	const lastMsgIDfromGroupMe = await groupmeController.lastMsgID(groupID);
	// const totalMessageCount = await groupmeController.totalMessageCountHandler(
	// 	groupID
	// );

	// console.log('lastMsgIDfromGroupMe', lastMsgIDfromGroupMe);
	// console.log('lastMsgID in DB', lastMsgID);

	const all = [];
	// let messageCount = 0;

	// gets last messages from GroupMe that aren't in DB and uploads
	while (lastMsgIDfromGroupMe !== lastMsgID) {
		// console.log('Getting messages from lastID: ', lastMsgID);
		// console.log('messageCount: ', messageCount);
		const lastMessages = await groupmeController.getMessages(
			groupID,
			'',
			'',
			lastMsgID // after_id
		);

		// console.log('lastMsgID: ', lastMsgID);

		lastMsgID = lastMessages.slice(-1)[0].id;
		// console.log('updated lastMsgID: ', lastMsgID);

		all.push(...lastMessages);
	}

	// console.log('number of messages to insert: ', all.length);
	// console.log('all: ', all);

	Message.insertMany(all, { ordered: false })
		.then(data => {
			res.send(data);
		})
		.catch(err => {
			res.send(err);
		});
}

async function deleteMessages(req, res) {
	const { limit } = req.query;

	console.log('limit: ', limit);

	Message.find({})
		.limit(Number(limit))
		.sort({ created_at: -1 })
		.then(data => {
			// res.send(data);
			Message.bulkWrite(
				data.map(obj => {
					return {
						deleteMany: {
							filter: { id: obj.id },
						},
					};
				})
			)
				.then(response => {
					res.send(response);
				})
				.catch(err => {
					res.send(err);
				});
		})
		.catch(err => {
			res.send(err);
		});
}

// update messages (favorited_by) in DB
async function updateMessages(req, res) {
	const numMsgstoRefresh = req.query.num;
	const groupID = req.params.group_id;

	// Message.find({}, { favorited_by: 1, id: 1 })
	// find last N messages in DB and return the favorited_id array an id.
	Message.find({})
		.limit(Number(numMsgstoRefresh))
		.sort({ created_at: -1 })
		.then(async messages => {
			let earliestMsgID = messages[0].id + 1;
			console.log('earliestMsgID: ', earliestMsgID);

			let messageCount = 0;
			const groupMeMessages = [];
			// get messages from GroupMe with `earliestMsgID` as after_id
			// console.log(Number(numMsgstoRefresh));
			while (messageCount < Number(numMsgstoRefresh)) {
				const lastMessages = await groupmeController.getMessages(
					groupID,
					earliestMsgID, // before_id
					'',
					'',
					100
				);

				earliestMsgID = lastMessages.slice(-1)[0].id;

				// console.log('earliestMsgID: ', earliestMsgID);

				groupMeMessages.push(...lastMessages);

				messageCount += 100;
			}

			let updating = false;
			const objMessages = JSON.parse(JSON.stringify(messages));

			const updatedMessages = objMessages.map((message, index) => {
				if (
					!isEqual(groupMeMessages[index].favorited_by, message.favorited_by) &&
					isEqual(groupMeMessages[index].id, message.id)
				) {
					// newFavoritedArray
					updating = true;
					message.favorited_by.splice(
						0,
						message.favorited_by.length,
						...groupMeMessages[index].favorited_by
					);
				}

				return message;
			});

			if (updating) {
				Message.bulkWrite(
					updatedMessages.map(obj => {
						return {
							updateOne: {
								filter: { id: obj.id },
								update: { $set: { favorited_by: obj.favorited_by } },
							},
						};
					})
				)
					.then(response => {
						res.send(response);
					})
					.catch(err => {
						res.send(err);
					});
			} else {
				res.send('no need to update');
			}
		})
		.catch(err => res.send(err));

	// const lastMsgInDB = await getLastMsgID();
	// const lastMsgIDinGroupMe = await groupmeController.lastMsgID(groupID);

	// console.log('lastMsgIDinGroupMe: ', lastMsgIDinGroupMe);
	// const lastMsgIDinGroupMePlusOne = lastMsgIDinGroupMe + 1;
	// console.log('lastMsgIDinGroupMePlusOne: ', lastMsgIDinGroupMePlusOne);

	// const lastMessageInGroupME = await groupmeController.getMessages(
	// 	groupID,
	// 	lastMsgIDinGroupMePlusOne,
	// 	'',
	// 	'',
	// 	1
	// );

	// console.log('lastMessageInGroupME: ', lastMessageInGroupME);

	// console.log('lastMsgInDB: ', lastMsgInDB);
	// const lastMsgID = lastMsgInDB.id;

	// check if lastMsg is truly the last message i

	// const messageBeforeLast = await groupmeController.getMessages(
	// 	groupID,
	// 	'',
	// 	'',
	// 	lastMsgID, // after_id
	// 	1
	// );
	// console.log('messageBeforeLast: ', messageBeforeLast);
	// const messageBeforeLastID = messageBeforeLast[0].id;

	// const messageCount = 0;

	// const all = [];

	// gets last messages from GroupMe that aren't in DB and uploads
	// while (messageCount < Number(numMsgstoRefresh)) {
	// 	const lastMessages = await groupmeController.getMessages(
	// 		groupID,
	// 		messageBeforeLastID, // before_id
	// 		'',
	// 		'',
	// 		100
	// 	);

	// 	lastMsgID = lastMessages[0].id;

	// 	all.push(...lastMessages);

	// 	messageCount += 100;
	// }
}

function getMessages(req, res) {
	const {
		fromTS,
		toTS,
		beforeTS,
		userIDs,
		favoritedBy,
		text,
		limit,
		sort,
		favorited,
		count,
		detailMessageID,
		skip,
		detailMessage,
		dashboard,
	} = req.query;

	console.log('skip: ', Number(skip));

	const query = {};
	const match = {}; // for aggregate by favorited
	let newLimit = null;
	let newSort = null;

	console.log('fromTS: ', fromTS);
	console.log('toTS: ', toTS);

	if (beforeTS) {
		query.created_at = {
			$lt: Number(beforeTS),
		};
	} else if (fromTS && toTS) {
		query.created_at = {
			$gte: Number(fromTS),
			$lte: Number(toTS),
		};
	} else if (fromTS) {
		query.created_at = {
			$gt: Number(fromTS),
		};
	} else if (toTS) {
		query.created_at = {
			$lte: Number(toTS),
		};
	}

	if (userIDs) {
		console.log(userIDs);
		if (!userIDs.includes('all')) {
			query.user_id = { $in: userIDs };
			match.user_id = { $in: userIDs };
		}
	}

	if (favoritedBy) {
		query.favorited_by = favoritedBy;
	}

	if (text && String(text)) {
		query.$text = { $search: String(text) };
	}

	if (limit) {
		newLimit = Number(limit);
	}

	if (sort) {
		if (sort === 'asc') {
			newSort = { created_at: 1 };
		} else if (sort === 'desc') {
			newSort = { created_at: -1 };
		}
	}

	if (favorited !== 'false') {
		match.created_at = {
			$gte: Number(fromTS),
			$lte: Number(toTS),
		};

		const agg = [
			{
				$sort: {
					created_at: -1,
				},
			},
			{
				$match: match,
			},
			{
				$addFields: {
					favoritedCount: {
						$size: {
							$ifNull: ['$favorited_by', []],
						},
					},
				},
			},
			{
				$sort: {
					favoritedCount: -1,
					created_at: -1,
				},
			},
			{
				$match: {
					favoritedCount: { $gt: 0 },
				},
			},
			{
				$skip: Number(skip),
			},

			{
				$limit: newLimit,
			},
		];

		Message.aggregate(agg)
			.then(data => {
				// console.log(data);
				res.send(data);
			})
			.catch(err => {
				console.log('err:', err);
				res.send(err);
			});
	} else if (dashboard !== 'false') {
		const agg = [
			{
				$match: {
					created_at: {
						$gte: Number(fromTS),
						$lte: Number(toTS),
					},
				},
			},
			{
				$project: {
					_id: null,
					created_at: 1,
				},
			},
			{
				$sort: {
					created_at: 1,
				},
			},
		];

		Message.aggregate(agg)
			.then(data => {
				res.send(data);
			})
			.catch(err => {
				res.send(err);
			});

		// Message.find(query)
		// 	.limit(newLimit)
		// 	.sort(newSort)
		// 	.then(data => {
		// 		// console.log();
		// 		res.send(data);
		// 	})
		// 	.catch(err => {
		// 		console.log('err:', err);
		// 		res.send(err);
		// 	});
	} else if (detailMessage !== 'false') {
		const detailMessages = [];

		const beforeIDAgg = [
			{
				$match: {
					id: { $lte: detailMessageID },
				},
			},
			{
				$sort: {
					created_at: -1,
				},
			},
			{
				$limit: newLimit,
			},
			{
				$sort: {
					created_at: 1,
				},
			},
		];

		const afterIDAgg = [
			{
				$match: {
					id: { $gt: detailMessageID },
				},
			},
			{
				$sort: {
					created_at: 1,
				},
			},
			{
				$limit: newLimit,
			},
			{
				$sort: {
					created_at: 1,
				},
			},
		];

		Message.aggregate(beforeIDAgg)
			.then(data => {
				detailMessages.push(...data);

				Message.aggregate(afterIDAgg)
					.then(moreData => {
						detailMessages.push(...moreData);

						res.send(detailMessages);
					})
					.catch(err => {
						console.log('err:', err);
						res.send(err);
					});
			})
			.catch(err => {
				console.log('err:', err);
				res.send(err);
			});
	} else {
		if (beforeTS) {
			match.created_at = {
				$lt: Number(beforeTS),
			};
		} else {
			match.created_at = {
				$lte: Number(toTS),
			};
		}

		if (text && String(text)) {
			match.$text = { $search: String(text) };
		}

		const agg = [
			{
				$match: match,
			},
			{
				$sort: {
					created_at: -1,
				},
			},
			{
				$limit: newLimit,
			},
			{
				$sort: {
					created_at: 1,
				},
			},
		];

		Message.aggregate(agg)
			.then(data => {
				res.send(data);
			})
			.catch(err => {
				console.log('err:', err);
				res.send(err);
			});
	}
}

function getUsers(req, res) {
	// get all users
	groupmeController.getGroup(18834987).then(group => {
		const users = group.members;

		const userPromises = users.map(user => {
			const agg = [
				{
					$match: {
						user_id: user.user_id,
					},
				},
				{
					$group: {
						_id: null,
						distinctNicknames: {
							$addToSet: '$name',
						},
					},
				},
			];

			return Message.aggregate(agg)
				.then(data => {
					return {
						...user,
						distinctNicknames: data[0].distinctNicknames,
					};
				})
				.catch(err => {
					return err;
				});
		});

		Promise.all(userPromises)
			.then(results => {
				console.log('results: ', results);
				res.send(results);
			})
			.catch(err => console.log(err));

		// console.log('userStats: ', userStats);
	});
}

function getUserStats(req, res) {
	// get all users
	groupmeController.getGroup(18834987).then(group => {
		const users = group.members;

		const userPromises = users.map(user => {
			const agg = [
				{
					$facet: {
						numMessages: [
							{
								$match: {
									user_id: user.user_id,
								},
							},
							{
								$count: 'numMessages',
							},
						],
						numLikes: [
							{
								$match: {
									user_id: user.user_id,
								},
							},
							{
								$group: {
									_id: null,
									numLikes: {
										$sum: {
											$size: '$favorited_by',
										},
									},
								},
							},
						],
						numLikedMsgs: [
							{
								$match: {
									favorited_by: {
										$in: [user.user_id],
									},
								},
							},
							{
								$count: 'numLikedMsgs',
							},
						],
						numSelfLikes: [
							{ $match: { user_id: user.user_id } },
							{
								$group: {
									_id: null,
									numSelfLikes: {
										$sum: {
											$cond: [{ $in: [user.user_id, '$favorited_by'] }, 1, 0],
										},
									},
								},
							},
						],
						distinctNicknames: [
							{
								$match: {
									user_id: user.user_id,
								},
							},
							{
								$group: {
									_id: null,
									distinctNicknames: {
										$addToSet: '$name',
									},
								},
							},
						],
						avgLikesPerMessage: [
							{ $match: { user_id: user.user_id } },
							{ $match: { favorited_by: { $ne: [] } } },
							{
								$project: {
									numLikes: {
										$sum: { $size: '$favorited_by' },
									},
								},
							},
							{
								$group: {
									_id: null,
									avgLikesPerMessage: { $avg: { $sum: '$numLikes' } },
								},
							},
						],
					},
				},
			];

			return Message.aggregate(agg)
				.then(data => {
					// console.log('data: ', data);

					return {
						...user,
						numMessages: data[0].numMessages[0].numMessages,
						numLikesReceived: data[0].numLikes[0].numLikes,
						numLikedMsgs: data[0].numLikedMsgs[0].numLikedMsgs,
						numSelfLikes: data[0].numSelfLikes[0].numSelfLikes,
						likesToMsgs: Number(
							(
								data[0].numLikes[0].numLikes /
								data[0].numMessages[0].numMessages
							).toFixed(2)
						),
						distinctNicknames: data[0].distinctNicknames[0].distinctNicknames,
						numdistinctNicknames:
							data[0].distinctNicknames[0].distinctNicknames.length,
						avgLikesPerMessage: Number(
							data[0].avgLikesPerMessage[0].avgLikesPerMessage.toFixed(2)
						),
						// numLikes: data[0].numLikes[0].numLikes,
					};
				})
				.catch(err => {
					return err;
				});

			// return Message.find({ user_id: user.user_id })
			// 	.count()
			// 	.then(data => {
			// 		console.log('data: ', data);
			// 		return { ...user, numMessages: data };
			// 	})
			// 	.catch(err => {
			// 		return err;
			// 	});
		});

		Promise.all(userPromises)
			.then(results => {
				res.send(results);
				// console.log('results: ', results);
			})
			.catch(err => console.log(err));

		// console.log('userStats: ', userStats);
	});

	// for each user, get a list of stats
}

// getUserStats();

module.exports = {
	getLastMsgID,
	getMessages,
	addMessages,
	updateMessages,
	deleteMessages,
	getUsers,
	getUserStats,
};
