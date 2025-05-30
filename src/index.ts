// Imports
import express from 'express'
import nunjucks from 'nunjucks'
import * as dotenv from 'dotenv'
// Module imports
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
    noCache: true
  })
  app.set('view engine', 'njk')
  // Default to public for assets
  app.use(express.static('public'))
  // Given the above, you may create overrides of any path by
  // creating a corresponding file in the public directory.
  // Middleware
  app.get('/', (req: express.Request, res: express.Response) => {
    res.render('index', { title: ORG_NAME, content: ORG_DESCRIPTION })
  })

  app.listen(PORT || 3000, () => { console.log(`Server is running on http://localhost:${PORT || 3000}`) })
}

// Server startup
const init = async () => {
  // Wait for database initialization
  await db.init()
  // Start the server
  server_init()
};

init()