import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

export const isAuthenticated = asyncHandler(async (req, res, next) => {
  const authHeader = req.header('Authorization');

  const token =
    (authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null) || req.cookies?.accessToken;

  if (!token) {
    throw new apiError(401, 'Unauthorized request');
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new apiError(401, 'Token expired');
    }
    throw new apiError(401, 'Invalid token');
  }

  if (!decodedToken?.id) {
    throw new apiError(401, 'Invalid token payload');
  }

  const user = await User.findById(decodedToken.id).select(
    '-password -refreshToken'
  );

  if (!user) {
    throw new apiError(401, 'User not found');
  }

  req.user = user;
  next();
});
