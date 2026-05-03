import mongoose, { isValidObjectId } from 'mongoose';
import { Video } from '../models/video.model.js';
import { Like } from '../models/likes.model.js';
import { Subscription } from '../models/subscription.model.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from '../utils/fileUpload.js';

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/video  — paginated video feed
// ─────────────────────────────────────────────────────────────────────────────
const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, sortBy = 'createdAt', sortType = 'desc', query } = req.query;

  const sortOrder = sortType === 'asc' ? 1 : -1;

  const matchStage = { isPublished: true };
  if (query) {
    matchStage.$or = [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
    ];
  }

  const videosAggregate = Video.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'owner',
        pipeline: [
          { $project: { username: 1, avatar: 1, fullName: 1 } },
        ],
      },
    },
    {
      $lookup: {
        from: 'likes',
        localField: '_id',
        foreignField: 'video',
        as: 'likes',
      },
    },
    {
      $addFields: {
        owner: { $first: '$owner' },
        likesCount: { $size: '$likes' },
      },
    },
    {
      $project: {
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        duration: 1,
        views: 1,
        createdAt: 1,
        owner: 1,
        likesCount: 1,
      },
    },
    { $sort: { [sortBy]: sortOrder } },
  ]);

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const videos = await Video.aggregatePaginate(videosAggregate, options);

  return res
    .status(200)
    .json(new apiResponse(200, videos, 'Videos fetched successfully'));
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/video/:videoId  — single video detail
// ─────────────────────────────────────────────────────────────────────────────
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new apiError(400, 'Invalid video ID format.');
  }

  const videoAggregate = await Video.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(videoId), isPublished: true } },
    {
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'owner',
        pipeline: [
          {
            $lookup: {
              from: 'subscriptions',
              localField: '_id',
              foreignField: 'channel',
              as: 'subscribers',
            },
          },
          {
            $addFields: {
              subscribersCount: { $size: '$subscribers' },
              isSubscribed: {
                $cond: {
                  if: { $in: [req.user?._id, '$subscribers.subscriber'] },
                  then: true,
                  else: false,
                },
              },
            },
          },
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
              coverImage: 1,
              subscribersCount: 1,
              isSubscribed: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'likes',
        localField: '_id',
        foreignField: 'video',
        as: 'likes',
      },
    },
    {
      $addFields: {
        owner: { $first: '$owner' },
        likesCount: { $size: '$likes' },
        isLiked: {
          $cond: {
            if: { $in: [req.user?._id, '$likes.likedBy'] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        duration: 1,
        views: 1,
        createdAt: 1,
        owner: 1,
        likesCount: 1,
        isLiked: 1,
      },
    },
  ]);

  if (!videoAggregate?.length) {
    throw new apiError(404, 'Video not found.');
  }

  return res
    .status(200)
    .json(new apiResponse(200, videoAggregate[0], 'Video fetched successfully'));
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/video/video-upload  — upload video (requires auth)
// ─────────────────────────────────────────────────────────────────────────────
const uploadVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new apiError(400, 'Title and description are required.');
  }

  const videoLocalPath = req.files?.video?.[0]?.path;
  if (!videoLocalPath) {
    throw new apiError(400, 'No video file found.');
  }

  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  const [video, thumbnail] = await Promise.all([
    uploadOnCloudinary(videoLocalPath),
    thumbnailLocalPath ? uploadOnCloudinary(thumbnailLocalPath) : Promise.resolve(null),
  ]);

  if (!video) {
    throw new apiError(400, 'Video upload to Cloudinary failed.');
  }

  try {
    const newVideo = await Video.create({
      videoFile: video.secure_url,
      public_id: video.public_id,
      thumbnail: thumbnail?.secure_url || '',
      title,
      description,
      duration: video.duration,
      owner: req.user._id,
    });

    return res
      .status(201)
      .json(new apiResponse(201, newVideo, 'Video uploaded successfully.'));
  } catch (error) {
    console.error('DB save failed — rolling back Cloudinary upload...');
    await deleteFromCloudinary(video.public_id);
    if (thumbnail) await deleteFromCloudinary(thumbnail.public_id);

    throw new apiError(500, 'Failed to save video to database. Files cleaned up.');
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/video/:videoId/views  — increment view count
// ─────────────────────────────────────────────────────────────────────────────
const updateVideoViews = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new apiError(400, 'Invalid video ID format.');
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    { $inc: { views: 1 } },
    { new: true }
  );

  if (!video) {
    throw new apiError(404, 'Video not found.');
  }

  return res
    .status(200)
    .json(new apiResponse(200, { views: video.views }, 'View count incremented.'));
});

export { getAllVideos, getVideoById, uploadVideo, updateVideoViews };
