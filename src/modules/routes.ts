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
        const user = req.session.user?.meta?.name || 'Sign In';
        res.render('index', { title: ORG_NAME, content: ORG_DESCRIPTION, user: user })
    })

    app.get('/login', (req: express.Request, res: express.Response) => {
        if (req.session.authenticated) {
            return res.redirect('/dash')
        }
        res.render('login', { title: `Login to ${ORG_NAME}` })
    })

    app.get('/register', (req: express.Request, res: express.Response) => {
        if (req.session.authenticated) {
            return res.redirect('/dash')
        }
        res.render('register', { title: `Register for ${ORG_NAME}` })
    })

    app.get('/dash', (req: express.Request, res: express.Response) => {
        if (!req.session.authenticated) {
            return res.redirect('/login/')
        }
        const user = req.session.user;
        res.render('dash', { title: `Dashboard - ${ORG_NAME}`, user: user.meta?.name || 'User' })
    })

    // POST Routes
    app.post('/register', async (req: express.Request, res: express.Response) => {
        const { user_name, user_pass, user_email } = req.body
        try {
            if (!user_name || !user_pass || !user_email) {
                return res.status(400).render('register', { error: 'All fields are required' })
            }
            // Check if user already exists
            const exists = await db.models.users.findOne({ 'meta.name': user_name })
            if (exists) {
                return res.status(400).render('register', { error: 'Username already exists' })
            }
            const user = await db.register(user_name, user_pass, user_email)
            if (user) {
                res.redirect('/login/')
            } else {
                res.status(400).render('register', { error: 'Registration failed' })
            }
        } catch (error) {
            console.error('Registration error:', error)
            res.status(500).render('register', { error: 'An error occurred during registration' })
        }
    })

    app.post('/login', async (req: express.Request, res: express.Response) => {
        const { user_name, user_pass } = req.body
        try {
            const user = await db.login(user_name, user_pass)
            if (user) {
                req.session.authenticated = true
                req.session.user = user
                // Wait for session to be set before redirecting
                setTimeout(() => {
                    res.redirect('/')
                }, 100);
            } else {
                res.status(401).render('login', { error: 'Invalid username or password' })
            }
        } catch (error) {
            console.error('Login error:', error)
            res.status(500).render('login', { error: 'An error occurred during login' })
        }
    })

    app.post('/logout', (req: express.Request, res: express.Response) => {
        req.session.destroy((err) => {
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
            req.session.destroy((err: Error | null) => {
                if (err) {
                    console.error('Logout error:', err);
                    return res.status(500).send('Error logging out');
                }
                console.log('User unregistered and logged out successfully');
                res.redirect('/');
            });
        } catch (err) {
            console.error('Unregistration error:', err);
            return res.status(500).send('Error unregistering user');
        }
    })

    app.post('/change_password', async (req: express.Request, res: express.Response) => {
        const { old_password, new_password } = req.body
        try {
            if (!old_password || !new_password) {
                return res.status(400).send('Both old and new passwords are required')
            }
            await db.change_password(req.session.user._id, old_password, new_password)
            req.session.authenticated = false
            req.session.user = null
            // Delete session to ensure user is logged out
            req.session.destroy((err: Error | null) => {
                if (err) {
                    console.error('Logout error:', err);
                    return res.status(500).send('Error logging out');
                }
                console.log('User unregistered and logged out successfully');
                res.redirect('/login/');
            });
        }
        catch (error) {
            console.error('Change password error:', error)
            res.status(500).send('An error occurred while changing the password')
        }
    })
}