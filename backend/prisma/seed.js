const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Clear existing data
    await prisma.application.deleteMany();
    await prisma.job.deleteMany();
    await prisma.user.deleteMany();

    // 1. Create Employer
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('123456', salt);

    const employer = await prisma.user.create({
        data: {
            name: 'Acme Corp HR',
            email: 'employer@demo.com',
            password,
            role: 'employer',
            companyName: 'Acme Corporation',
            companyDescription: 'Leading tech innovator in the modern world.',
            location: 'San Francisco, CA',
        }
    });

    // 2. Create Seeker
    const seeker = await prisma.user.create({
        data: {
            name: 'John Doe',
            email: 'seeker@demo.com',
            password,
            role: 'seeker',
            bio: 'Passionate software engineer looking for new challenges.',
            skills: JSON.stringify(['React', 'Node.js', 'TypeScript', 'Prisma']),
            location: 'New York, NY',
            resume: 'https://example.com/resume.pdf'
        }
    });

    // 3. Create Jobs
    const job1 = await prisma.job.create({
        data: {
            title: 'Senior Frontend React Developer',
            description: 'We are looking for an experienced React developer to build modern premium UI interfaces using Framer Motion and Vite.',
            company: employer.companyName,
            location: 'Remote',
            locationType: 'remote',
            type: 'full-time',
            category: 'Engineering',
            experience: 'senior',
            salaryMin: 120000,
            salaryMax: 160000,
            skills: JSON.stringify(['React', 'TypeScript', 'Framer Motion']),
            employerId: employer.id
        }
    });

    const job2 = await prisma.job.create({
        data: {
            title: 'Backend Node.js Engineer',
            description: 'Join our backend team to scale our microservices architecture. Experience with Express, Prisma, and APIs is required.',
            company: employer.companyName,
            location: 'San Francisco, CA',
            locationType: 'onsite',
            type: 'full-time',
            category: 'Engineering',
            experience: 'mid',
            salaryMin: 100000,
            salaryMax: 140000,
            employerId: employer.id
        }
    });

    // 4. Create an Application
    await prisma.application.create({
        data: {
            jobId: job1.id,
            applicantId: seeker.id,
            coverLetter: 'I am highly interested in this role. I have 5 years of React experience and have built multiple high-performance apps.',
            resume: seeker.resume,
            status: 'pending'
        }
    });

    // Update job application count
    await prisma.job.update({
        where: { id: job1.id },
        data: { applicationsCount: 1 }
    });

    console.log('Seeding complete! You can now log in with employer@demo.com or seeker@demo.com (Password: 123456)');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
