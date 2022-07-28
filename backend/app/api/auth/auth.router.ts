import express from 'express'
import { authMiddleware } from './utils'
import * as authController from './auth.controller'

const router = express.Router()

router.post('/register', authController.register)
router.post('/login', authController.login)
router.get('/me', authMiddleware, authController.me)

export default router;
