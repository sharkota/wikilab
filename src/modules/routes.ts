import express from 'express'
import { db } from './database.ts'
import * as dotenv from 'dotenv'

// Extend session type to include 'authenticated' and 'user'
declare module 'express-session' {
    interface SessionData {
        authenticated?: boolean;
        user?: any;
    }
}

dotenv.config()
const { PORT, ORG_NAME, ORG_DESCRIPTION } = process.env

export function create_routes(app) {
    // GET Routes
    app.get('/', (req: express.Request, res: express.Response) => {
        const userName = req.session.user?.meta?.name || 'Sign In';
        res.render('index', { title: ORG_NAME, content: ORG_DESCRIPTION, user: userName })
    })

    app.get('/login', (req: express.Request, res: express.Response) => {
        if (req.session.authenticated) {
            return res.redirect('/dash')
        }
        res.render('login', { title: `Login to ${ORG_NAME}` })
    })

    // POST Routes
    app.post('/login', async (req: express.Request, res: express.Response) => {
        const { user_name, user_pass } = req.body
        try {
            const user = await db.login(user_name, user_pass)
            if (user) {
                req.session.authenticated = true
                req.session.user = user
                res.redirect('/')
            } else {
                res.status(401).render('login', { error: 'Invalid username or password' })
            }
        } catch (error) {
            console.error('Login error:', error)
            res.status(500).render('login', { error: 'An error occurred during login' })
        }
    })
}