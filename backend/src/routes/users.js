const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { protect } = require('../middleware/auth');

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res, next) => {
    try {
        const { name, bio, location, skills, resume, company } = req.body;
        const updates = {};

        if (name) updates.name = name;
        if (bio !== undefined) updates.bio = bio;
        if (location !== undefined) updates.location = location;
        if (skills) {
            const skillArray = Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim());
            updates.skills = JSON.stringify(skillArray);
        }
        if (resume !== undefined) updates.resume = resume;

        if (company) {
            if (company.name !== undefined) updates.companyName = company.name;
            if (company.description !== undefined) updates.companyDescription = company.description;
            if (company.website !== undefined) updates.companyWebsite = company.website;
        }

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: updates
        });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                ...user, _id: user.id,
                skills: JSON.parse(user.skills || '[]'),
                company: {
                    name: user.companyName,
                    description: user.companyDescription,
                    website: user.companyWebsite,
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/users/save-job/:jobId
// @desc    Save / unsave a job
// @access  Private (seeker)
router.post('/save-job/:jobId', protect, async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        const jobId = req.params.jobId;

        let savedJobs = JSON.parse(user.savedJobs || '[]');
        const isSaved = savedJobs.includes(jobId);

        if (isSaved) {
            savedJobs = savedJobs.filter((id) => id !== jobId);
            await prisma.user.update({
                where: { id: user.id },
                data: { savedJobs: JSON.stringify(savedJobs) }
            });
            return res.json({ success: true, message: 'Job removed from saved', saved: false });
        } else {
            savedJobs.push(jobId);
            await prisma.user.update({
                where: { id: user.id },
                data: { savedJobs: JSON.stringify(savedJobs) }
            });
            return res.json({ success: true, message: 'Job saved successfully', saved: true });
        }
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/users/saved-jobs
// @desc    Get all saved jobs
// @access  Private
router.get('/saved-jobs', protect, async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        const savedIds = JSON.parse(user.savedJobs || '[]');

        if (savedIds.length === 0) {
            return res.json({ success: true, savedJobs: [] });
        }

        const savedJobs = await prisma.job.findMany({
            where: { id: { in: savedIds } },
            select: { id: true, title: true, company: true, location: true, type: true, status: true, createdAt: true }
        });

        // Remap ids
        const formatted = savedJobs.map(j => ({ ...j, _id: j.id }));

        res.json({ success: true, savedJobs: formatted });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/users/stats
// @desc    Get dashboard stats
// @access  Private
router.get('/stats', protect, async (req, res, next) => {
    try {
        if (req.user.role === 'employer') {
            const totalJobs = await prisma.job.count({ where: { employerId: req.user.id } });
            const openJobs = await prisma.job.count({ where: { employerId: req.user.id, status: 'open' } });
            res.json({ success: true, stats: { totalJobs, openJobs } });
        } else {
            res.json({ success: true, stats: {} });
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;
