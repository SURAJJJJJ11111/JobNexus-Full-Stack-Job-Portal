const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const prisma = require('../config/prisma');
const { protect, requireRole } = require('../middleware/auth');

// @route   GET /api/jobs
// @desc    Get all jobs with filters & pagination
// @access  Public
router.get('/', async (req, res, next) => {
    try {
        const {
            search, category, type, locationType, experience,
            location, page = 1, limit = 10, sort = '-createdAt',
        } = req.query;

        const where = { status: 'open' };

        if (search) {
            where.OR = [
                { title: { contains: search } },
                { company: { contains: search } },
                { description: { contains: search } }
            ];
        }
        if (category) where.category = category;
        if (type) where.type = type;
        if (locationType) where.locationType = locationType;
        if (experience) where.experience = experience;
        if (location) where.location = { contains: location };

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await prisma.job.count({ where });
        const jobs = await prisma.job.findMany({
            where,
            include: {
                employer: { select: { name: true, companyName: true } }
            },
            orderBy: { createdAt: sort === '-createdAt' ? 'desc' : 'asc' },
            skip,
            take: parseInt(limit),
        });

        // Format to map _id and employer formatting
        const formattedJobs = jobs.map(j => ({
            ...j,
            _id: j.id,
            requirements: JSON.parse(j.requirements || '[]'),
            skills: JSON.parse(j.skills || '[]'),
            salary: {
                min: j.salaryMin, max: j.salaryMax,
                currency: j.salaryCurrency, period: j.salaryPeriod
            }
        }));

        res.json({
            success: true,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            jobs: formattedJobs,
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/jobs/:id
// @desc    Get single job by ID
// @access  Public
router.get('/:id', async (req, res, next) => {
    try {
        const job = await prisma.job.findUnique({
            where: { id: req.params.id },
            include: { employer: { select: { name: true, email: true, location: true } } }
        });

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Increment views
        const updated = await prisma.job.update({
            where: { id: job.id },
            data: { views: { increment: 1 } },
            include: { employer: { select: { name: true, email: true, location: true } } }
        });

        const formatted = {
            ...updated,
            _id: updated.id,
            requirements: JSON.parse(updated.requirements || '[]'),
            skills: JSON.parse(updated.skills || '[]'),
            salary: {
                min: updated.salaryMin, max: updated.salaryMax,
                currency: updated.salaryCurrency, period: updated.salaryPeriod
            }
        };

        res.json({ success: true, job: formatted });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/jobs
// @desc    Create a new job posting
// @access  Private (employer only)
router.post(
    '/',
    protect,
    requireRole('employer'),
    [
        body('title').trim().notEmpty().withMessage('Job title is required'),
        body('company').trim().notEmpty().withMessage('Company name is required'),
        body('description').trim().notEmpty().withMessage('Description is required'),
        body('location').trim().notEmpty().withMessage('Location is required'),
        body('category').notEmpty().withMessage('Category is required'),
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, message: errors.array()[0].msg });
            }

            const { salary, requirements, skills, ...rest } = req.body;

            const jobData = {
                ...rest,
                employerId: req.user.id,
                salaryMin: salary?.min || null,
                salaryMax: salary?.max || null,
                salaryCurrency: salary?.currency || 'USD',
                salaryPeriod: salary?.period || 'yearly',
                requirements: JSON.stringify(requirements || []),
                skills: JSON.stringify(skills || [])
            };

            const job = await prisma.job.create({ data: jobData });
            res.status(201).json({ success: true, message: 'Job posted successfully', job: { ...job, _id: job.id } });
        } catch (error) {
            next(error);
        }
    }
);

// @route   PUT /api/jobs/:id
// @desc    Update a job posting
// @access  Private (employer)
router.put('/:id', protect, requireRole('employer'), async (req, res, next) => {
    try {
        const job = await prisma.job.findUnique({ where: { id: req.params.id } });
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
        if (job.employerId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this job' });
        }

        const { salary, requirements, skills, ...rest } = req.body;

        const updateData = { ...rest };
        if (salary) {
            updateData.salaryMin = salary.min;
            updateData.salaryMax = salary.max;
            updateData.salaryCurrency = salary.currency;
        }
        if (requirements) updateData.requirements = JSON.stringify(requirements);
        if (skills) updateData.skills = JSON.stringify(skills);

        const updated = await prisma.job.update({
            where: { id: req.params.id },
            data: updateData
        });

        res.json({ success: true, message: 'Job updated successfully', job: { ...updated, _id: updated.id } });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete a job
// @access  Private (employer)
router.delete('/:id', protect, requireRole('employer'), async (req, res, next) => {
    try {
        const job = await prisma.job.findUnique({ where: { id: req.params.id } });
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
        if (job.employerId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this job' });
        }

        await prisma.job.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Job deleted successfully' });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/jobs/employer/my-jobs
// @desc    Get jobs posted by the logged-in employer
// @access  Private (employer)
router.get('/employer/my-jobs', protect, requireRole('employer'), async (req, res, next) => {
    try {
        const jobs = await prisma.job.findMany({
            where: { employerId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });

        const formatted = jobs.map(j => ({
            ...j,
            _id: j.id,
            requirements: JSON.parse(j.requirements || '[]'),
            skills: JSON.parse(j.skills || '[]'),
        }));

        res.json({ success: true, jobs: formatted });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
