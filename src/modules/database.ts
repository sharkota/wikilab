import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../db/users.ts';

export const init = async () => {
  const uri = process.env.DB_URI;
  if (!uri) {
    console.error('DB_URI is not defined in the environment variables');
    throw new Error('DB_URI is not defined in the environment variables');
  }

  try {
    console.log('Connecting to database...');
    await mongoose.connect(uri);
    console.log('Pinged your deployment. You successfully connected to MongoDB!');
  } catch (err) {
    console.error('Database connection error:', err);
    throw err;
  }
};

// Models object
export const models = {
  users: User
};

// Register
export const register = async (user_name: string, user_pass: string, user_email: string) => {
  const new_user = await models.users.create({
    meta: {
      name: user_name,
    },
    security: {
      password: await bcrypt.hash(user_pass, 10),
      email: user_email,
    },
    profile: {
      name: user_name
    }
  });
  console.log('User registered successfully:', new_user.meta.name);
  return new_user;
};

// Login
export const login = async (user_name: string, user_pass: string) => {
  const user = await models.users.findOne({ 'meta.name': user_name });
  if (!user) {
    console.log('User not found');
    return false; // User not found
  }
  if (!user.security || !user.security.password) {
    throw new Error('User security information is missing');
  }
  const is_valid = await bcrypt.compare(user_pass, user.security.password);
  if (!is_valid) {
    console.error('Invalid password for user:', user_name);
    return false; // Invalid password
  }
  console.log('User logged in successfully:', user_name);
  return user;
};

export const db = {
  init: init,
  register: register,
  login: login,
  models: models
};