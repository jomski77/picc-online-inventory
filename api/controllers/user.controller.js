import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';
import bcryptjs from 'bcryptjs';

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.userId && !req.user.isAdmin) {
    return next(errorHandler(403, 'You are not allowed to update this user'));
  }
  try {
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          profilePicture: req.body.profilePicture,
          department: req.body.department,
          jobTitle: req.body.jobTitle || req.body.role, // Support both jobTitle and role during transition
        },
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return next(errorHandler(404, 'User not found'));
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.userId && !req.user.isAdmin) {
    return next(errorHandler(403, 'You are not allowed to delete this user'));
  }
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.status(200).json({ message: 'User has been deleted' });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, 'You are not allowed to see all users'));
  }
  try {
    const query = req.query.search
      ? {
          $or: [
            { username: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } },
          ],
        }
      : {};
    
    const users = await User.find(query).select('-password');
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}; 