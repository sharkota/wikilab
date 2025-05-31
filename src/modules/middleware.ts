import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';

// Session middleware factory
export function session_middleware() {
  return session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_URI }),
    cookie: { sameSite: 'lax', secure: false, maxAge: 1000 * 60 * 60 * 24 },
  });
}

// Static assets middleware
export function static_middleware() {
  return express.static('public');
}
