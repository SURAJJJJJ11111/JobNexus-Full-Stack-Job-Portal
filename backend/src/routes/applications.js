const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const prisma = require('../config/prisma');
const { protect, requireRole } = require('../middleware/auth');

// @route   POST /api/applications/:jobId
// @desc    Apply to a job
// @access  Private (seeker only)
router.post(
    '/:jobId',
    protect,
    requireRole('seeker'),
    [body('coverLetter').trim().notEmpty().withMessage('Cover letter is required')],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, message: errors.array()[0].msg });
            }

            const job = await prisma.job.findUnique({ where: { id: req.params.jobId } });
            if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
            if (job.status !== 'open') {
                return res.status(400).json({ success: false, message: 'This job is no longer accepting applications' });
            }

            // Check existing
            const existing = await prisma.application.findUnique({
                where: { jobId_applicantId: { jobId: job.id, applicantId: req.user.id } }
            });
            if (existing) {
                return res.status(400).json({ success: false, message: 'You have already applied to this job' });
            }

            const application = await prisma.application.create({
                data: {
                    jobId: job.id,
                    applicantId: req.user.id,
                    coverLetter: req.body.coverLetter,
                    resume: req.body.resume || req.user.resume || '',
                }
            });

            // Increment application count
            await prisma.job.update({
                where: { id: job.id },
                data: { applicationsCount: { increment: 1 } }
            });

            res.status(201).json({ success: true, message: 'Application submitted successfully', application: { ...application, _id: application.id } });
        } catch (error) {
            if (error.code === 'P2002') {
                return res.status(400).json({ success: false, message: 'You have already applied to this job' });
            }
            next(error);
        }
    }
);

// @route   GET /api/applications/my
// @desc    Get all applications by the logged-in seeker
// @access  Private (seeker)
router.get('/my', protect, requireRole('seeker'), async (req, res, next) => {
    try {
        const applications = await prisma.application.findMany({
            where: { applicantId: req.user.id },
            include: { job: { select: { id: true, title: true, company: true, location: true, type: true, status: true } } },
            orderBy: { createdAt: 'desc' }
        });

        const formatted = applications.map(app => ({
            ...app,
            _id: app.id,
            job: app.job ? { ...app.job, _id: app.job.id } : null
        }));

        res.json({ success: true, applications: formatted });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/applications/job/:jobId
// @desc    Get all applications for a specific job (employer only)
// @access  Private (employer)
router.get('/job/:jobId', protect, requireRole('employer'), async (req, res, next) => {
    try {
        const job = await prisma.job.findUnique({ where: { id: req.params.jobId } });
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
        if (job.employerId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const applications = await prisma.application.findMany({
            where: { jobId: job.id },
            include: {
                applicant: {
                    select: { id: true, name: true, email: true, bio: true, location: true, skills: true, resume: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const formatted = applications.map(app => ({
            ...app,
            _id: app.id,
            applicant: app.applicant ? { ...app.applicant, _id: app.applicant.id, skills: JSON.parse(app.applicant.skills || '[]') } : null
        }));

        res.json({ success: true, applications: formatted });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/applications/:id/status
// @desc    Update application status (employer)
// @access  Private (employer)
router.put('/:id/status', protect, requireRole('employer'), async (req, res, next) => {
    try {
        const { status, employerNote } = req.body;
        const application = await prisma.application.findUnique({
            where: { id: req.params.id },
            include: { job: true }
        });

        if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
        if (application.job.employerId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const updated = await prisma.application.update({
            where: { id: application.id },
            data: {
                status: status || application.status,
                employerNote: employerNote !== undefined ? employerNote : application.employerNote
            }
        });

        res.json({ success: true, message: 'Application status updated', application: { ...updated, _id: updated.id } });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
