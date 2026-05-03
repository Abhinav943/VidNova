import mongoose, { isValidObjectId } from 'mongoose';
import { Comment } from '../models/comment.model.js';
import { Like } from '../models/likes.model.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new apiError(400, 'Invalid video ID');
  }

  if (!content || content.trim() === '') {
    throw new apiError(400, 'Comment content cannot be empty.');
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user._id,
  });

  res
    .status(201)
    .json(new apiResponse(201, comment, 'Comment added successfully'));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(commentId)) {
    throw new apiError(400, 'Invalid comment ID.');
  }

  if (!content || !content.trim() === '') {
    throw new apiError(400, 'Comment content cannot be empty.');
  }

  const comment = await Comment.findById(commentId);
  if (!Comment) {
    throw new apiError('Comment not found');
  }

  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new apiError(403, 'You do not have permission to edit this comment.');
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    { $set: { content } },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new apiResponse(200, updatedComment, 'Comment updated successfully!')
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new apiError(400, 'Invalid comment ID.');
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new apiError(404, 'Comment not found.');
  }

  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new apiError(
      403,
      'You do not have permission to delete this comment.'
    );
  }

  await Comment.findByIdAndDelete(commentId);

  await Like.deleteMany({ comment: commentId });

  return res
    .status(200)
    .json(new apiResponse(200, {}, 'Comment deleted successfully!'));
});

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(videoId)) {
    throw new apiError(400, 'Invalid video ID.');
  }

  const commentsAggregate = Comment.aggregate([
    {
      $match: { video: new mongoose.Types.ObjectId(videoId) },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'ownerDetails',
        pipeline: [{ $project: { fullName: 1, username: 1, avatar: 1 } }],
      },
    },
    {
      $lookup: {
        from: 'likes',
        localField: '_id',
        foreignField: 'comment',
        as: 'likes',
      },
    },
    {
      $addFields: {
        ownerDetails: { $first: '$ownerDetails' },
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
        content: 1,
        createdAt: 1,
        ownerDetails: 1,
        likesCount: 1,
        isLiked: 1,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const comments = await Comment.aggregatePaginate(commentsAggregate, options);

  return res
    .status(200)
    .json(new apiResponse(200, comments, 'Comments fetched successfully!'));
});

export { addComment, updateComment, deleteComment, getVideoComments };
