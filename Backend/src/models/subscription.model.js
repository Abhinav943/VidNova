import Mongoose, { Schema } from 'mongoose';

const subscriptionSchema = new Schema(
  {
    subscriber: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    channel: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamp: true }
);

export const Subscription = Mongoose.model('Subscription', subscriptionSchema);
