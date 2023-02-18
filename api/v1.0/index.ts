import express from 'express';
import userRouter from './user';

const version_1_0 = express.Router();

version_1_0.use('/user', userRouter);

version_1_0.all('/*', (req, res) => {
  res.status(404).json({
    error: 'Invalid API endpoint or request method used.'
  });
});

export default version_1_0;