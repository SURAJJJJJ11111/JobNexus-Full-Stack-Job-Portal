const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { protect, requireRole } = require('../middleware/auth');

// Apply to all routes
router.use(protect);
router.use(requireRole('admin'));

// @route   GET /api/admin/stats
// @desc    Get counts for admin dashboard
router.get('/stats', async (req, res, next) => {
    try {
        const usersCount = await prisma.user.count();
        const jobsCount = await prisma.job.count();
        const applicationsCount = await prisma.application.count();
        res.json({ success: true, stats: { users: usersCount, jobs: jobsCount, applications: applicationsCount } });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/admin/users
// @desc    Get all users
router.get('/users', async (req, res, next) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true },
            orderBy: { createdAt: 'desc' }
        });
        const formatted = users.map(u => ({ ...u, _id: u.id }));
        res.json({ success: true, users: formatted });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
router.delete('/users/:id', async (req, res, next) => {
    try {
        await prisma.user.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/admin/jobs
// @desc    Get all jobs
router.get('/jobs', async (req, res, next) => {
    try {
        const jobs = await prisma.job.findMany({
            include: { employer: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });
        const formatted = jobs.map(j => ({ ...j, _id: j.id }));
        res.json({ success: true, jobs: formatted });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/admin/jobs/:id
// @desc    Delete a job
router.delete('/jobs/:id', async (req, res, next) => {
    try {
        await prisma.job.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Job deleted' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
