import { Router } from 'express';
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from '../controllers/subscription.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(isAuthenticated);

router.route('/c/:channelId').post(toggleSubscription);
router.route('/c/:channelId').get(getUserChannelSubscribers);
router.route('/u/:subscriberId').get(getSubscribedChannels);

export default router;
