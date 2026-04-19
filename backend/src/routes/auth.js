const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const prisma = require('../config/prisma');
const { protect } = require('../middleware/auth');

const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
    '/register',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('role').isIn(['seeker', 'employer', 'admin']).withMessage('Role must be seeker, employer, or admin'),
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, message: errors.array()[0].msg });
            }

            const { name, email, password, role, resume } = req.body;

            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Email already registered' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const user = await prisma.user.create({
                data: { name, email, password: hashedPassword, role, resume: role === 'seeker' ? resume : undefined },
            });

            res.status(201).json({
                success: true,
                message: 'Registration successful',
                token: generateToken(user.id),
                user: {
                    _id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

// @route   POST /api/auth/login
// @desc    Login user & get token
// @access  Public
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, message: errors.array()[0].msg });
            }

            const { email, password } = req.body;
            const user = await prisma.user.findUnique({ where: { email } });

            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }

            // Return _id so frontend AuthContext doesn't break
            res.json({
                success: true,
                message: 'Login successful',
                token: generateToken(user.id),
                user: {
                    _id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    bio: user.bio,
                    location: user.location,
                    skills: JSON.parse(user.skills || '[]'),
                    company: {
                        name: user.companyName,
                        description: user.companyDescription,
                        website: user.companyWebsite,
                    },
                    resume: user.resume,
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

// @route   GET /api/auth/me
// @desc    Get current logged-in user
// @access  Private
router.get('/me', protect, async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        let savedJobsList = [];
        try {
            const savedIds = JSON.parse(user.savedJobs || '[]');
            if (savedIds.length > 0) {
                savedJobsList = await prisma.job.findMany({
                    where: { id: { in: savedIds } },
                    select: { id: true, title: true, company: true, location: true, type: true }
                });
            }
        } catch { }

        res.json({
            success: true,
            user: {
                ...user,
                _id: user.id,
                skills: JSON.parse(user.skills || '[]'),
                savedJobs: savedJobsList,
                company: {
                    name: user.companyName,
                    description: user.companyDescription,
                    website: user.companyWebsite,
                },
                resume: user.resume
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
