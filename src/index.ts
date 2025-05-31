// Imports
import express from 'express'
import nunjucks from 'nunjucks'
import * as dotenv from 'dotenv'
import { session_middleware, static_middleware } from './modules/middleware.ts'
import { create_routes } from './modules/routes.ts'
import './modules/database.ts' // Import database module to initialize connection
import { db } from './modules/database.ts'

// Environment configuration
dotenv.config()
const { PORT, ORG_NAME, ORG_DESCRIPTION } = process.env

function server_init() {
  // App setup
  const app = express()
  // Template engine configuration
  nunjucks.configure('views', {
    autoescape: true,
    express: app,
    noCache: true,
    watch: true,
  })
  app.set('view engine', 'njk')

  // Use refactored middleware
  app.use(session_middleware());
  app.use(static_middleware());

  // Body parsers for POST requests
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Default to public for assets
  app.use(express.static('public'))
  // Given the above, you may create overrides of any path by
  // creating a corresponding file in the public directory.

  // Register routes
  create_routes(app);

  // Start the server after all middleware and routes are set up
  app.listen(PORT || 3000, () => {
    console.log(`Server is running on http://localhost:${PORT || 3000}`)
  })
}

// Server startup
const init = async () => {
  // Wait for database initialization
  await db.init()
  // Start the server
  server_init()
};

init()