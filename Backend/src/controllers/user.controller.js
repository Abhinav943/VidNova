import emailValidator from 'email-validator';
import zxcvbn from 'zxcvbn';
import { User } from '../models/user.model.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadOnCloudinary } from '../utils/fileUpload.js';
import jwt from 'jsonwebtoken';
import mongoose, { isValidObjectId } from 'mongoose';

const generateAccessAndRefreshToken = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new apiError(404, 'User not found');
  }

  const AccessToken = user.generateAccessToken();
  const RefreshToken = user.generateRefreshToken();

  user.refreshToken = RefreshToken;
  await user.save({ validateBeforeSave: false });

  return { AccessToken, RefreshToken };
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, username } = req.body;
  if (!fullName || !email || !password || !username) {
    throw new apiError(400, 'All fields are required');
  }

  if (!emailValidator.validate(email)) {
    throw new apiError(400, 'Invalid email');
  }

  const passwordStrength = zxcvbn(password);
  if (passwordStrength.score < 3) {
    throw new apiError(400, 'Password is too weak');
  }

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new apiError(400, 'User already exists');
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;

  let coverImagePath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImagePath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new apiError(400, 'Avatar is required');
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImagePath);

  if (!avatar) {
    throw new apiError(400, 'Avatar upload failed');
  }

  const newUser = await User.create({
    fullName,
    email,
    password,
    username,
    avatar: avatar.url,
    coverImage: coverImage?.url || '',
  });

  const createdUser = await User.findById(newUser._id).select(
    '-password -refreshToken'
  );
  if (!createdUser) {
    throw new apiError(500, 'User creation failed');
  }

  const { AccessToken, RefreshToken } = await generateAccessAndRefreshToken(
    createdUser._id
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  res
    .status(201)
    .cookie('accessToken', AccessToken, options)
    .cookie('refreshToken', RefreshToken, options)
    .json(
      new apiResponse(
        201,
        { user: createdUser, AccessToken, RefreshToken },
        'User registered and logged in successfully'
      )
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!(email || username)) {
    throw new apiError(400, 'Email or username is required');
  }

  const user = await User.findOne({ $or: [{ email }, { username }] });
  if (!user) {
    throw new apiError(400, 'User not found');
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new apiError(400, 'Invalid password');
  }

  const { AccessToken, RefreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  res
    .status(200)
    .cookie('accessToken', AccessToken, options)
    .cookie('refreshToken', RefreshToken, options)
    .json(
      new apiResponse(
        200,
        { user: loggedInUser, AccessToken, RefreshToken },
        'User logged in successfully'
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new apiError(401, 'Unauthorized');
  }
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new apiResponse(200, {}, 'User logged out successfully'));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new apiError(400, 'Refresh token is required');
  }

  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  const user = await User.findById(decodedToken._id);
  if (!user) {
    throw new apiError(404, 'User not found');
  }

  if (incomingRefreshToken !== user.refreshToken) {
    throw new apiError(401, 'Invalid refresh token');
  }

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  const { AccessToken, RefreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  return res
    .status(200)
    .cookie('accessToken', AccessToken, options)
    .cookie('refreshToken', RefreshToken, options)
    .json(
      new apiResponse(
        200,
        { AccessToken, RefreshToken },
        'Access token refreshed successfully'
      )
    );
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirm } = req.body;
  if (!currentPassword || !newPassword || !confirm) {
    throw new apiError(
      400,
      'Current password, new password, and confirm are required'
    );
  }

  if (newPassword !== confirm) {
    throw new apiError(400, 'New password and confirm do not match');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new apiError(404, 'User not found');
  }
  const isCurrentPasswordValid = await user.isPasswordCorrect(currentPassword);
  if (!isCurrentPasswordValid) {
    throw new apiError(400, 'Current password is incorrect');
  }

  const passwordStrength = zxcvbn(newPassword);
  if (passwordStrength.score < 3) {
    throw new apiError(400, 'New password is too weak');
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  res
    .status(200)
    .json(new apiResponse(200, {}, 'Password changed successfully'));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new apiResponse(200, req.user, 'User fetched successfully'));
});

const changeAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, username, email } = req.body;
  if (!username || !email || !fullName) {
    throw new apiError(400, 'Username, email, and full name are required');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName: fullName,
        username: username,
        email: email,
      },
    },
    { new: true }
  );
  if (!user) {
    throw new apiError(404, 'User not found');
  }
  res
    .status(200)
    .json(new apiResponse(200, {}, 'Account details changed successfully'));
});

const UpdateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new apiError(400, 'Avatar file is required');
  }
  
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if(!avatar.url) {
    throw new apiError(500, 'Failed to upload avatar');
  }
  
  const user = await User.findByIdAndUpdate(req.user?._id, {
    $set: {
      avatar: avatar.url,
    }
  }, {new: true})
  
  if(!user) {
    throw new apiError(404, 'User not found');
  }

  res
    .status(200)
    .json(new apiResponse(200, user, 'Avatar updated successfully'));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new apiError(400, 'Cover image file is required');
  }
  
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage.url) {
    throw new apiError(500, 'Failed to upload cover image');
  }
  
  const user = await User.findByIdAndUpdate(req.user?._id, {
    $set: {
      coverImage: coverImage.url,
    }
  }, {new: true})
  
  if(!user) {
    throw new apiError(404, 'User not found');
  }

  res
    .status(200)
    .json(new apiResponse(200, user, 'Cover image updated successfully'));
});

const getUserChannelProfile = asyncHandler( async (req,res)=>{
  const {username} = req.params;
  if(!username?.trim()){
    throw new apiError(400, 'Username is required');
  }

 const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase()
      }
    },
    {
      $lookup: {
        from: 'subscriptions',
        localField: '_id',
        foreignField: 'channel',
        as: 'subscribers'
      }
    },
    {
      $lookup: {
        from: 'subscriptions',
        localField: '_id',
        foreignField: 'subscriber',
        as: 'subscribedToChannels'
      }
    },
    {
      $addFields: {
        subscribersCount: { $size: '$subscribers' },
        subscribedToChannelsCount: { $size: '$subscribedToChannels' },
        isSubscribed: {
         $cond: {
          if: { $in: [req.user?._id, '$subscribers.subscriber'] },
         then: true,
         else: false
         }
        }
      }
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        subscribedToChannelsCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      }
    }
  ])

  if(channel?.length === 0){
    throw new apiError(404, 'Channel not found');
  }

  res
    .status(200)
    .json(new apiResponse(200, channel[0], 'Channel profile fetched successfully'));
});

const updateWatchHistory = asyncHandler(async (req, res) => {
  const { videoID } = req.params;

  if (!videoID) {
    throw new apiError(400, 'Video ID is required.');
  }

  if (!isValidObjectId(videoID)) {
    throw new apiError(400, 'Invalid Video ID format. 🛑');
  }

  await User.findByIdAndUpdate(req.user._id, {
    $pull: { watchHistory: videoID },
  });

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $push: {
        watchHistory: {
          $each: [videoID],
          $position: 0,
          $slice: 100,
        },
      },
    },
    { new: true }
  );

  if (!updatedUser) {
    throw new apiError(404, 'User not found');
  }

  res
    .status(200)
    .json(
      new apiResponse(
        200,
        updatedUser.watchHistory,
        'Watch history updated! 🕒'
      )
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match:{
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup:{
        from: 'videos',
        localField: 'watchHistory',
        foreignField: '_id',
        as: 'watchHistoryVideos',
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'owner',
              foreignField: '_id',
              as: 'owner',
              pipeline: [
              {
                $project: {
                  fullName: 1,
                  username: 1,
                  avatar: 1,
                }
              },
            ]
            }
          },
          {
            $addFields: {
              owner: {
                $first: '$owner'
              }
            }
          }
        ]
      }
    }
  ])
  return res
    .status(200)
    .json(new apiResponse(200, user[0]?.watchHistoryVideos || [], 'Watch history fetched successfully'));
});


export {
  loginUser,
  registerUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  changeAccountDetails,
  UpdateAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  updateWatchHistory,
  getWatchHistory
};
