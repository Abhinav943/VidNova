import './config/env.js';
import connectDB from './db/index.js';
import app from './app.js';

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log('Server listening at the port: ', process.env.PORT);
    });
  })
  .catch((err) => {
    console.error('Error: MongoDB connection failed.', err);
  });
