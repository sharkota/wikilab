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
};

//register('admin', 'slop', 'soy@slop.com');

export const db = {
  init: init
};