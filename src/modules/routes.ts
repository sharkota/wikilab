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
const { ORG_NAME, ORG_DESCRIPTION } = process.env

export function create_routes(app: any) {
    // GET Routes
    app.get('/', (req: express.Request, res: express.Response) => {
        res.render('main/index', { 
            title: ORG_NAME, 
            content: ORG_DESCRIPTION, 
            user: req.session.user?.meta?.name || 'Sign In' 
        })
    })

    app.get('/login', (req: express.Request, res: express.Response) => {
        if (req.session.authenticated) return res.redirect('/dash')
        res.render('user/login', { title: `Login to ${ORG_NAME}` })
    })

    app.get('/register', (req: express.Request, res: express.Response) => {
        if (req.session.authenticated) return res.redirect('/dash')
        res.render('user/register', { title: `Register for ${ORG_NAME}` })
    })

    app.get('/dash', (req: express.Request, res: express.Response) => {
        if (!req.session.authenticated) return res.redirect('/login/')
        res.render('user/dash', { 
            title: `Dashboard - ${ORG_NAME}`, 
            user: req.session.user?.meta?.name || 'User' 
        })
    })

    // POST Routes
    app.post('/register', async (req: express.Request, res: express.Response) => {
        const { user_name, user_pass, user_email } = req.body
        if (!user_name || !user_pass || !user_email)
            return res.status(400).render('register', { error: 'All fields are required' })
        try {
            if (await db.models.users.findOne({ 'meta.name': user_name }))
                return res.status(400).render('register', { error: 'Username already exists' })
            const user = await db.register(user_name, user_pass, user_email)
            if (user) return res.redirect('/login/')
            res.status(400).render('register', { error: 'Registration failed' })
        } catch (error) {
            console.error('Registration error:', error)
            res.status(500).render('register', { error: 'An error occurred during registration' })
        }
    })

    app.post('/login', async (req: express.Request, res: express.Response) => {
        const { user_name, user_pass } = req.body
        try {
            const user = await db.login(user_name, user_pass)
            if (!user)
                return res.status(401).render('login', { error: 'Invalid username or password' })
            req.session.authenticated = true
            req.session.user = user
            setTimeout(() => res.redirect('/'), 500)
        } catch (error) {
            console.error('Login error:', error)
            res.status(500).render('login', { error: 'An error occurred during login' })
        }
    })

    app.post('/logout', (req: express.Request, res: express.Response) => {
        req.session.destroy(err => {
            if (err) {
                console.error('Logout error:', err)
                return res.status(500).send('Error logging out')
            }
            res.redirect('/')
        })
    })

    app.post('/unregister', async (req: express.Request, res: express.Response) => {
        try {
            await db.models.users.deleteOne({ _id: req.session.user._id });
            req.session.destroy(err => {
                if (err) {
                    console.error('Logout error:', err)
                    return res.status(500).send('Error logging out')
                }
                res.redirect('/')
            })
        } catch (err) {
            console.error('Unregistration error:', err)
            res.status(500).send('Error unregistering user')
        }
    })

    app.post('/change_password', async (req: express.Request, res: express.Response) => {
        const { old_password, new_password } = req.body
        if (!old_password || !new_password)
            return res.status(400).send('Both old and new passwords are required')
        try {
            await db.change_password(req.session.user._id, old_password, new_password)
            req.session.authenticated = false
            req.session.user = null
            req.session.destroy(err => {
                if (err) {
                    console.error('Logout error:', err)
                    return res.status(500).send('Error logging out')
                }
                res.redirect('/login/')
            })
        } catch (error) {
            console.error('Change password error:', error)
            res.status(500).send('An error occurred while changing the password')
        }
    })
}