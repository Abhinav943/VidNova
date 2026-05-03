import { Router } from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import {
  getAllVideos,
  getVideoById,
  uploadVideo,
  updateVideoViews,
} from '../controllers/video.controller.js';

const router = Router();

// Public routes
router.route('/').get(getAllVideos);
router.route('/:videoId').get(getVideoById);
router.route('/:videoId/views').patch(updateVideoViews);

// Protected routes
router.route('/video-upload').post(
  isAuthenticated,
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  uploadVideo
);

export default router;
