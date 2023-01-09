// Create functions to query the suh-dude db.
// Retreiving messages, group info from db for frontend app to hit.

const isEqual = require('lodash.isequal');
const moment = require('moment');

const mongoose = require('mongoose');
// const querystring = require('querystring');

const groupmeController = require('./groupmeController');

const Message = mongoose.model('Message');
const RandomMessage = mongoose.model('RandomMessage');

function getLastMsgID() {
	return Message.findOne().sort({ created_at: -1 });
}

async function addMessages(req, res) {
	const groupID = req.params.group_id;
	const lastMsg = await getLastMsgID();
	let lastMsgID = lastMsg.id;
	const lastMsgIDfromGroupMe = await groupmeController.lastMsgID(groupID);

	const all = [];
	// let messageCount = 0;

	// gets last messages from GroupMe that aren't in DB and uploads
	while (lastMsgIDfromGroupMe !== lastMsgID) {
		// console.log('messageCount: ', messageCount);
		const lastMessages = await groupmeController.getMessages(
			groupID,
			'',
			'',
			lastMsgID // after_id
		);

		// console.log('lastMessages: ', lastMessages);

		lastMsgID = lastMessages.slice(-1)[0].id;
		// console.log('updated lastMsgID: ', lastMsgID);

		all.push(...lastMessages);
	}

	// remove duplicates from all array
	const uniqueMessages = [...new Set(all)];

	// console.log('number of messages to insert: ', all.length);
	Message.insertMany(uniqueMessages, { ordered: false })
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
}

// add/update a random message of the day
async function randomMessage(req, res) {
	// get random message stored in DB
	const randomMessageinDB = await RandomMessage.find({});

	const agg = [{ $sample: { size: 1 } }];

	if (randomMessageinDB.length) {
		// check if date is current day, if not, update with new random message

		if (moment(randomMessageinDB[0].date).isSame(moment(), 'day')) {
			res.send(randomMessageinDB[0]);
		} else {
			Message.aggregate(agg)
				.then(data => {
					const randomMessage = Object.assign(data[0]);

					randomMessage.date = moment.now();

					RandomMessage.deleteOne({})
						.then(() => {
							RandomMessage.create(randomMessage)
								.then(() => {
									res.send(randomMessage);
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
				})
				.catch(err => {
					console.log('err:', err);
					res.send(err);
				});
		}
	} else {
		// insert random message and send back
		Message.aggregate(agg)
			.then(data => {
				const randomMessage = Object.assign(data[0]);

				randomMessage.date = moment.now();

				RandomMessage.create(randomMessage)
					.then(() => {
						res.send(randomMessage);
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
	}
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
						numMessageZeroLikes: [
							{ $match: { user_id: user.user_id } },
							{ $match: { favorited_by: { $eq: [] } } },
							{ $count: 'numMessageZeroLikes' },
						],
						topTenMessageDays: [
							{
								$match: {
									user_id: user.user_id,
								},
							},
							{
								$addFields: {
									messageDay: {
										$dateToString: {
											format: '%Y-%m-%d',
											date: {
												$toDate: {
													$multiply: ['$created_at', 1000],
												},
											},
											timezone: 'America/New_York',
										},
									},
								},
							},
							{
								$group: {
									_id: '$messageDay',
									count: {
										$sum: 1,
									},
								},
							},
							{
								$sort: {
									count: -1,
								},
							},
							{
								$limit: 10,
							},
						],
						topTenLikesReceivedDays: [
							{
								$match: {
									user_id: user.user_id,
								},
							},
							{
								$addFields: {
									messageDay: {
										$dateToString: {
											format: '%Y-%m-%d',
											date: {
												$toDate: {
													$multiply: ['$created_at', 1000],
												},
											},
											timezone: 'America/New_York',
										},
									},
								},
							},
							{
								$group: {
									_id: '$messageDay',
									count: {
										$sum: {
											$size: '$favorited_by',
										},
									},
								},
							},
							{
								$sort: {
									count: -1,
								},
							},
							{
								$limit: 10,
							},
						],
						topTenLikesGivenOutDays: [
							{
								$match: {
									favorited_by: {
										$in: [user.user_id],
									},
								},
							},
							{
								$addFields: {
									messageDay: {
										$dateToString: {
											format: '%Y-%m-%d',
											date: {
												$toDate: {
													$multiply: ['$created_at', 1000],
												},
											},
											timezone: 'America/New_York',
										},
									},
								},
							},
							{
								$group: {
									_id: '$messageDay',
									count: {
										$sum: 1,
									},
								},
							},
							{
								$sort: { count: -1 },
							},
							{
								$limit: 10,
							},
						],
					},
				},
			];

			return Message.aggregate(agg)
				.then(data => {
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
						numMessageZeroLikes:
							data[0].numMessageZeroLikes[0].numMessageZeroLikes,
						topTenMessageDays: data[0].topTenMessageDays,
						topTenLikesReceivedDays: data[0].topTenLikesReceivedDays,
						topTenLikesGivenOutDays: data[0].topTenLikesGivenOutDays,
					};
				})
				.catch(err => {
					return err;
				});
		});

		Promise.all(userPromises)
			.then(results => {
				res.send(results);
			})
			.catch(err => console.log(err));
	});
}

function getUserTopTen(req, res) {
	// get all users
	groupmeController.getGroup(18834987).then(group => {
		const users = group.members;

		const userPromises = users.map(user => {
			const agg = [
				{
					$facet: {
						topTenMessageDays: [
							{
								$match: {
									user_id: user.user_id,
								},
							},
							{
								$addFields: {
									messageDay: {
										$dateToString: {
											format: '%Y-%m-%d',
											date: {
												$toDate: {
													$multiply: ['$created_at', 1000],
												},
											},
											timezone: 'America/New_York',
										},
									},
								},
							},
							{
								$group: {
									_id: '$messageDay',
									count: {
										$sum: 1,
									},
								},
							},
							{
								$sort: {
									count: -1,
								},
							},
							{
								$limit: 10,
							},
						],
						topTenLikesReceivedDays: [
							{
								$match: {
									user_id: user.user_id,
								},
							},
							{
								$addFields: {
									messageDay: {
										$dateToString: {
											format: '%Y-%m-%d',
											date: {
												$toDate: {
													$multiply: ['$created_at', 1000],
												},
											},
											timezone: 'America/New_York',
										},
									},
								},
							},
							{
								$group: {
									_id: '$messageDay',
									count: {
										$sum: {
											$size: '$favorited_by',
										},
									},
								},
							},
							{
								$sort: {
									count: -1,
								},
							},
							{
								$limit: 10,
							},
						],
						topTenLikesGivenOutDays: [
							{
								$match: {
									favorited_by: {
										$in: [user.user_id],
									},
								},
							},
							{
								$addFields: {
									messageDay: {
										$dateToString: {
											format: '%Y-%m-%d',
											date: {
												$toDate: {
													$multiply: ['$created_at', 1000],
												},
											},
											timezone: 'America/New_York',
										},
									},
								},
							},
							{
								$group: {
									_id: '$messageDay',
									count: {
										$sum: 1,
									},
								},
							},
							{
								$sort: { count: -1 },
							},
							{
								$limit: 10,
							},
						],
					},
				},
			];

			return Message.aggregate(agg)
				.then(data => {
					return {
						...user,
						topTenMessageDays: data[0].topTenMessageDays,
						topTenLikesReceivedDays: data[0].topTenLikesReceivedDays,
						topTenLikesGivenOutDays: data[0].topTenLikesGivenOutDays,
					};
				})
				.catch(err => {
					return err;
				});
		});

		Promise.all(userPromises)
			.then(results => {
				res.send(results);
				// console.log('results: ', results);
			})
			.catch(err => console.log(err));
	});
}

function topTen(req, res) {
	const agg = [
		{
			$facet: {
				topTenMessageDays: [
					{
						$addFields: {
							messageDay: {
								$dateToString: {
									format: '%Y-%m-%d',
									date: {
										$toDate: {
											$multiply: ['$created_at', 1000],
										},
									},
									timezone: 'America/New_York',
								},
							},
						},
					},
					{
						$group: {
							_id: '$messageDay',
							count: {
								$sum: 1,
							},
						},
					},
					{
						$sort: {
							count: -1,
						},
					},
					{
						$limit: 10,
					},
				],
				topTenLikesDays: [
					{
						$addFields: {
							messageDay: {
								$dateToString: {
									format: '%Y-%m-%d',
									date: {
										$toDate: {
											$multiply: ['$created_at', 1000],
										},
									},
									timezone: 'America/New_York',
								},
							},
						},
					},
					{
						$group: {
							_id: '$messageDay',
							count: {
								$sum: {
									$size: '$favorited_by',
								},
							},
						},
					},
					{
						$sort: {
							count: -1,
						},
					},
					{
						$limit: 10,
					},
				],
			},
		},
	];
	Message.aggregate(agg)
		.then(data => {
			console.log('data: ', data);
			res.send(data);
		})
		.catch(err => {
			res.send(err);
		});
}

module.exports = {
	getLastMsgID,
	randomMessage,
	getMessages,
	addMessages,
	updateMessages,
	deleteMessages,
	getUsers,
	getUserStats,
	getUserTopTen,
	topTen,
};
