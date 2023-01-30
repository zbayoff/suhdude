import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import _ from 'lodash';
import { fetchGroup } from './group';

const Message = mongoose.model('Message');

export interface User {
	user_id: string;
	nickname: string;
	image_url: string;
	id: string;
	muted: boolean;
	autokicked: boolean;
	roles: string[];
	name: string;
	distinctNicknames: string[];
}

interface UserStatCount extends User {
	numMessages: number;
	numLikes: number;
	numGifs: number;
	numLikedMsgs: number;
	numSelfLikes: number;
	likesToMsgs: number;
	distinctNicknames: string[];
	numDistinctNicknames: number;
	avgLikesPerMessage: number;
	numMessageZeroLikes: number;
}

interface UserStatsAggregationResponse {
	[key: string]: UserStatCount[];
}

export const getUserStats = async (req: Request, res: Response) => {
	try {
		const group = await fetchGroup();

		const userPromises = group.members.map(async user => {
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
						numGifs: [
							{
								$match: {
									user_id: user.user_id,
								},
							},
							{
								$match: {
									$and: [
										{
											'attachments.type': 'image',
										},
										{
											'attachments.url': {
												$regex: '.gif',
											},
										},
									],
								},
							},
							{
								$count: 'numGifs',
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
					},
				},
			];

			try {
				const userStatsAggregation: UserStatsAggregationResponse[] = await Message.aggregate(
					agg
				);

				return {
					...user,
					numMessages: userStatsAggregation[0].numMessages[0].numMessages,
					numGifs: userStatsAggregation[0].numGifs.length
						? userStatsAggregation[0].numGifs[0].numGifs
						: 0,
					numLikesReceived: userStatsAggregation[0].numLikes[0].numLikes,
					numLikedMsgs: userStatsAggregation[0].numLikedMsgs[0].numLikedMsgs,
					numSelfLikes: userStatsAggregation[0].numSelfLikes[0].numSelfLikes,
					likesToMsgs: Number(
						(
							userStatsAggregation[0].numLikes[0].numLikes /
							userStatsAggregation[0].numMessages[0].numMessages
						).toFixed(2)
					),
					distinctNicknames:
						userStatsAggregation[0].distinctNicknames[0].distinctNicknames,
					numDistinctNicknames:
						userStatsAggregation[0].distinctNicknames[0].distinctNicknames
							.length,
					avgLikesPerMessage: Number(
						userStatsAggregation[0].avgLikesPerMessage[0].avgLikesPerMessage.toFixed(
							2
						)
					),
					numMessageZeroLikes:
						userStatsAggregation[0].numMessageZeroLikes[0].numMessageZeroLikes,
				};
			} catch (err) {
				console.error('error fetching user stats: ', err);
				return err;
			}
		});

		try {
			const results = await Promise.all(userPromises);
			res.send(results);
		} catch (err) {
			console.log('error with a user stat: ', err);
		}
	} catch (error) {
		console.error('error: ', error);
		res.send(error);
	}
};
