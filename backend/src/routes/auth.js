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

// @route   POST /api/auth/forgot-password
// @desc    Generate a password reset token and (optionally) email it
// @access  Public
router.post('/forgot-password',
    [body('email').isEmail().withMessage('Valid email is required')],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, message: errors.array()[0].msg });
            }

            const { email } = req.body;
            const user = await prisma.user.findUnique({ where: { email } });

            // Always respond with success to prevent email enumeration attacks
            if (!user) {
                return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
            }

            // Generate a secure random token
            const crypto = require('crypto');
            const rawToken = crypto.randomBytes(32).toString('hex');
            const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
            const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

            await prisma.user.update({
                where: { email },
                data: { resetToken: hashedToken, resetTokenExpiry: expiry }
            });

            const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${rawToken}`;

            // Try to send email if SMTP is configured
            if (process.env.SMTP_USER && process.env.SMTP_PASS) {
                try {
                    const nodemailer = require('nodemailer');
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
                    });
                    await transporter.sendMail({
                        from: `"JobNexus" <${process.env.SMTP_USER}>`,
                        to: email,
                        subject: 'Reset your JobNexus password',
                        html: `
                            <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;">
                                <h2 style="color:#2563eb;">Reset Your Password</h2>
                                <p>Hi ${user.name},</p>
                                <p>You requested a password reset for your JobNexus account. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
                                <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:600;margin:16px 0;">
                                    Reset Password
                                </a>
                                <p style="color:#64748b;font-size:0.85em;">If you didn't request this, you can safely ignore this email.</p>
                                <p style="color:#64748b;font-size:0.75em;">Or paste this link: ${resetUrl}</p>
                            </div>
                        `
                    });
                    return res.json({ success: true, message: 'Reset link sent to your email.' });
                } catch (emailErr) {
                    // Log full error so Render logs show the actual SMTP failure reason
                    console.error('SMTP error:', emailErr.message, emailErr.code || '');
                }
            }

            // Fallback when SMTP is not configured or failed:
            // Always return the link so the frontend can display it directly.
            // Once SMTP_USER + SMTP_PASS are set on Render, the email branch
            // returns early and this line is never reached.
            return res.json({
                success: true,
                message: 'Reset link generated. Copy the link below (email delivery not configured).',
                resetUrl,
            });
        } catch (error) {
            next(error);
        }
    }
);

// @route   POST /api/auth/reset-password/:token
// @desc    Validate reset token and update password
// @access  Public
router.post('/reset-password/:token',
    [body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, message: errors.array()[0].msg });
            }

            const crypto = require('crypto');
            const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

            const user = await prisma.user.findFirst({
                where: {
                    resetToken: hashedToken,
                    resetTokenExpiry: { gt: new Date() }
                }
            });

            if (!user) {
                return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired.' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);

            await prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null }
            });

            res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;

