import Router from 'express';
import {
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
} from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const router = Router();
router.route('/register').post(
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
  ]),
  registerUser
);

router.route('/login').post(loginUser);
router.route('/logout').post(isAuthenticated, logoutUser);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/change-password').post(isAuthenticated, changeCurrentPassword);
router.route('/me').get(isAuthenticated, getCurrentUser);
router.route('/update-account').put(isAuthenticated, changeAccountDetails);
router.route('/update-avatar').patch(
  isAuthenticated,
  upload.single('avatar'),
  UpdateAvatar
);
router.route('/update-cover-image').patch(
  isAuthenticated,
  upload.single('coverImage'),
  updateUserCoverImage
); 
router.route('/channel/:username').get(getUserChannelProfile);
router.route('/history/:videoID').patch(isAuthenticated, updateWatchHistory);
router.route('/history').get(isAuthenticated, getWatchHistory);
export default router;
