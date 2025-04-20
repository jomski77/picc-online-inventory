import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/profiles';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Create multer upload middleware
export const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: function (req, file, cb) {
    // Accept only images
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
}).single('profilePicture');

export const signup = async (req, res, next) => {
  try {
    const { username, email, password, profilePicture } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return next(errorHandler(400, 'User already exists'));
    }
    
    const hashedPassword = bcryptjs.hashSync(password, 10);
    
    // Use provided profile picture URL or default
    const userProfilePicture = profilePicture || 'https://eurzpxkjndcnhmdsggvs.supabase.co/storage/v1/object/public/picc-inventory-images/default-user.png';
    
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      profilePicture: userProfilePicture
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return next(errorHandler(404, 'User not found'));
    }
    
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      return next(errorHandler(400, 'Invalid credentials'));
    }
    
    const token = jwt.sign(
      { id: validUser._id, isAdmin: validUser.isAdmin },
      process.env.JWT_SECRET || 'piccinventoryteam',
      { expiresIn: '1d' }
    );
    
    const { password: userPassword, ...userWithoutPassword } = validUser._doc;
    
    res
      .cookie('access_token', token, { httpOnly: true })
      .status(200)
      .json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

export const signout = (req, res) => {
  res.clearCookie('access_token').status(200).json({ message: 'Signout successful' });
}; 