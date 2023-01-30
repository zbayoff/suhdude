import { Request, Response, NextFunction } from 'express';

const mongoose = require('mongoose');

const Message = mongoose.model('Message');

export const getAllMessageGifs = async (req: Request, res: Response) => {
	const agg = [
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
			$group: {
				_id: '$user_id',
				name: {
					$first: '$name',
				},
				numGifs: {
					$sum: 1,
				},
			},
		},
		{
			$project: {
				_id: false,
				user_id: '$_id',
				name: '$name',
				numGifs: '$numGifs',
			},
		},
		{
			$sort: {
				numGifs: -1,
			},
		},
	];

	try {
		const data = await Message.aggregate(agg);
		console.log('data:', data);
		res.send(data);
	} catch (error) {
		console.error('error: ', error);
		res.send(error);
	}
};
