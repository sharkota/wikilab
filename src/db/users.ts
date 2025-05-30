import mongoose from 'mongoose'
import crypto from 'crypto'

function createCryptoString(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
}

const user_schema = new mongoose.Schema({
    meta: {
        type: Object,
        required: true,
        name: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            immutable: true,
            required: true,
            default: Date.now()
        }
    },
    security:{
        password: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        rank: {
            type: String,
            required: true,
            default: 'user'
        },
        verified: {
            type: Boolean,
            required: true,
            default: true
        },
        verify_id: {
            type: String,
            required: true,
            default: () => createCryptoString(16)
        }
    },
    profile: {
        avatar: {
            type: String,
            required: true,
            default: '/image/user.png'
        },
        pronouns: {
            type: String,
            required: true,
            default: ' '
        },
        name: {
            type: String,
            required: false
        }
    }
})

export const User = mongoose.model('user', user_schema)