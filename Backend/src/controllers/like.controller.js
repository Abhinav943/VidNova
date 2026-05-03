import mongoose, { isValidObjectId } from 'mongoose';
import { Like } from '../models/likes.model.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new apiError(400, 'Invalid video ID');
  }

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(
        new apiResponse(200, { isLiked: false }, 'Video unliked successfully')
      );
  } else {
    const newLike = await Like.create({
      video: videoId,
      likedBy: req.user._id,
    });
    return res
      .status(201)
      .json(
        new apiResponse(201, { isLiked: true }, 'Video liked successfully')
      );
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new apiError(400, 'Invalid comment ID format.');
  }
  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(
        new apiResponse(200, { isLiked: false }, 'Comment unliked successfully')
      );
  } else {
    await Like.create({
      comment: commentId,
      likedBy: req.user._id,
    });
    return res
      .status(200)
      .json(
        new apiResponse(200, { isLiked: true }, 'Comment liked successfully!')
      );
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user._id),
        video: { $exists: true, $ne: null },
      },
    },
    {
      $lookup: {
        from: 'videos',
        localField: 'video',
        foreignField: '_id',
        as: 'videoDetails',
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'owner',
              foreignField: '_id',
              as: 'ownerDetails',
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
              ownerDetails: { $first: '$ownerDetails' },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        videoDetails: { $first: '$videoDetails' },
      },
    },
    {
      $replaceRoot: { newRoot: '$videoDetails' },
    },
  ]);

  return res
    .status(200)
    .json(
      new apiResponse(200, likedVideos, 'Liked videos fetched successfully!')
    );
});

export { toggleCommentLike, toggleVideoLike, getLikedVideos };
