import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';
import { setServers } from 'node:dns/promises';
setServers(['1.1.1.1', '8.8.8.8']);

const connectDB = async () => {
  try {
    console.log(process.env.MONGO_URI);
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`
    );
    console.log(
      `\nMongoDB connected !! Database Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log('Error connecting MongoDB', error);
    process.exit(1);
  }
};

export default connectDB;
