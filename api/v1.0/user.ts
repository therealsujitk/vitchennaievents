import express from 'express';
import { User } from '../../interfaces';
import UserModal from '../../models/user';
import { badRequestError, ClientError, internalServerError, missingRequiredParameter } from '../utils/errors';

const usersRouter = express.Router();

/**
 * [POST] /api/v1.0/user/login
 * 
 * @header x-username string (required)
 * @header x-password string (required)
 * 
 * @response JSON
 *  {}
 */
usersRouter.post('/login', async (req, res) => {
  const username = req.header('x-username');
  const password = req.header('x-password');

  if (!username) {
    return missingRequiredParameter('username', res);
  }

  if (!password) {
    return missingRequiredParameter('password', res);
  }

  const user: UserModal = {
    username: username,
    password: password
  }

  try {
    res.status(200).json({
      user: await User.getUser(user)
    });
  } catch (err) {
    if (err instanceof ClientError) {
      return badRequestError(err, res);
    } else {
      return internalServerError(res);
    }
  }
});

/**
 * [POST] /api/v1.0/user/merchandise
 * 
 * @header x-username string (required)
 * @header x-password string (required)
 * 
 * @response JSON
 *  {}
 */
usersRouter.post('/merchandise', async (req, res) => {
  const username = req.header('x-username');
  const password = req.header('x-password');

  if (!username) {
    return missingRequiredParameter('username', res);
  }

  if (!password) {
    return missingRequiredParameter('password', res);
  }

  const user: UserModal = {
    username: username,
    password: password
  }

  try {
    res.status(200).json({
      merchandise: await User.getMerchandise(user)
    });
  } catch (err) {
    if (err instanceof ClientError) {
      return badRequestError(err, res);
    } else {
      return internalServerError(res);
    }
  }
});


/**
 * [POST] /api/v1.0/user/events
 * 
 * @header x-username string (required)
 * @header x-password string (required)
 * 
 * @response JSON
 *  {}
 */
usersRouter.post('/events', async (req, res) => {
  const username = req.header('x-username');
  const password = req.header('x-password');

  if (!username) {
    return missingRequiredParameter('username', res);
  }

  if (!password) {
    return missingRequiredParameter('password', res);
  }

  const user: UserModal = {
    username: username,
    password: password
  }

  try {
    res.status(200).json({
      events: await User.getEvents(user)
    });
  } catch (err) {
    if (err instanceof ClientError) {
      return badRequestError(err, res);
    } else {
      return internalServerError(res);
    }
  }
});

export default usersRouter;