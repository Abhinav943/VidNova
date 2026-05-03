import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRouter from './routes/user.router.js';
import videoRouter from './routes/video.router.js';
import subscriptionRouter from './routes/subscription.router.js';
import likeRouter from './routes/like.router.js';
import commentRouter from './routes/comment.router.js';

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.static('public'));
app.use(cookieParser());

app.use('/api/v1/users', userRouter);
app.use('/api/v1/video', videoRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/likes', likeRouter);
app.use('/api/v1/comments', commentRouter);

export default app;
