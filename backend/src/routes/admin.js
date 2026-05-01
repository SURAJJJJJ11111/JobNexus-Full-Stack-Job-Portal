const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { protect, requireRole } = require('../middleware/auth');

// Apply to all routes
router.use(protect);
router.use(requireRole('admin'));

// @route   GET /api/admin/stats
// @desc    Rich stats for admin dashboard (role breakdown, trends, top companies, funnel)
router.get('/stats', async (req, res, next) => {
    try {
        // Basic counts
        const [usersCount, jobsCount, applicationsCount] = await Promise.all([
            prisma.user.count(),
            prisma.job.count(),
            prisma.application.count(),
        ]);

        // Role breakdown
        const [seekersCount, employersCount] = await Promise.all([
            prisma.user.count({ where: { role: 'seeker' } }),
            prisma.user.count({ where: { role: 'employer' } }),
        ]);

        // Jobs posted per day — last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const recentJobs = await prisma.job.findMany({
            where: { createdAt: { gte: sevenDaysAgo } },
            select: { createdAt: true },
        });

        const jobsPerDay = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
            const count = recentJobs.filter(j => {
                const jd = new Date(j.createdAt);
                return jd.getDate() === d.getDate() && jd.getMonth() === d.getMonth();
            }).length;
            jobsPerDay.push({ label, count });
        }

        // Most active companies (by job count)
        const allJobs = await prisma.job.findMany({ select: { company: true, applicationsCount: true } });
        const companyMap = {};
        allJobs.forEach(j => {
            if (!companyMap[j.company]) companyMap[j.company] = { jobs: 0, applications: 0 };
            companyMap[j.company].jobs += 1;
            companyMap[j.company].applications += (j.applicationsCount || 0);
        });
        const topCompanies = Object.entries(companyMap)
            .map(([name, d]) => ({ name, ...d }))
            .sort((a, b) => b.jobs - a.jobs)
            .slice(0, 5);

        // Application status funnel
        const appStatuses = await prisma.application.groupBy({
            by: ['status'],
            _count: { status: true },
        });
        const funnel = appStatuses.map(s => ({ status: s.status, count: s._count.status }));

        // New users this week
        const newUsersThisWeek = await prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } });

        res.json({
            success: true,
            stats: {
                users: usersCount,
                jobs: jobsCount,
                applications: applicationsCount,
                seekers: seekersCount,
                employers: employersCount,
                newUsersThisWeek,
                jobsPerDay,
                topCompanies,
                funnel,
            }
        });
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
