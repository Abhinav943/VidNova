import { isValidObjectId } from 'mongoose';
import { User } from '../models/user.model.js';
import { Subscription } from '../models/subscription.model.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import mongoose from 'mongoose';

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new apiError(400, 'Invalid channel ID format.');
  }

  const channel = await User.findById(channelId);
  if (!channel) {
    throw new apiError(400, 'Channel not found.');
  }

  if (req.user?._id.toString() === channelId) {
    throw new apiError(400, 'You cannot subscribe to your own channel!');
  }

  const existingSubscription = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });
  if (existingSubscription) {
    await Subscription.findByIdAndDelete(existingSubscription?._id);

    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          { subscribed: false },
          'Unsubscribed successfully.'
        )
      );
  } else {
    const newSubscription = await Subscription.create({
      subscriber: req.user._id,
      channel: channelId,
    });

    return res
      .status(200)
      .json(
        new apiResponse(200, { subscribed: true }, 'Subscribed successfully.')
      );
  }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new apiError(400, 'Invalid channel ID format.');
  }

  const subscribers = await Subscription.aggregate([
    {
      $match: { channel: new mongoose.Types.ObjectId(channelId) },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'subscriber',
        foreignField: '_id',
        as: 'subscriberDetails',
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        subscriberDetails: { $first: '$subscriberDetails' },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new apiResponse(200, subscribers, 'Subscribers fetched successfully')
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new apiError(400, 'Invalid subscriber ID format.');
  }

  const subscribedChannels = await Subscription.aggregate([
    {
      $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'channel',
        foreignField: '_id',
        as: 'channelDetails',
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        channelDetails: { $first: '$channelDetails' },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        subscribedChannels,
        'Subscribed channels fetched successfully'
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
