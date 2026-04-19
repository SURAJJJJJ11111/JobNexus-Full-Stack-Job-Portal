const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const employer = await prisma.user.findUnique({
        where: { email: 'employer@demo.com' }
    });

    if (!employer) {
        console.error("employer@demo.com not found!");
        return;
    }

    await prisma.job.create({
        data: {
            title: 'Product Manager',
            description: 'We are looking for a highly skilled Product Manager to guide our new AI products from conception to launch.',
            company: employer.companyName,
            location: 'New York, NY',
            locationType: 'hybrid',
            type: 'full-time',
            category: 'Engineering',
            experience: 'mid',
            salaryMin: 110000,
            salaryMax: 150000,
            skills: JSON.stringify(['Agile', 'Scrum', 'Jira', 'Product Design']),
            employerId: employer.id
        }
    });

    await prisma.job.create({
        data: {
            title: 'UI/UX Designer',
            description: 'Join our design team to create beautiful, accessible user interfaces for our job portal platform.',
            company: employer.companyName,
            location: 'Remote',
            locationType: 'remote',
            type: 'contract',
            category: 'Design',
            experience: 'entry',
            salaryMin: 60000,
            salaryMax: 85000,
            skills: JSON.stringify(['Figma', 'Prototyping', 'User Research']),
            employerId: employer.id
        }
    });

    await prisma.job.create({
        data: {
            title: 'DevOps Engineer',
            description: 'Help us scale our infrastructure using Docker, Kubernetes, and AWS to serve millions of connections seamlessly.',
            company: employer.companyName,
            location: 'London, UK',
            locationType: 'onsite',
            type: 'full-time',
            category: 'Engineering',
            experience: 'senior',
            salaryMin: 140000,
            salaryMax: 190000,
            skills: JSON.stringify(['AWS', 'Docker', 'Kubernetes', 'CI/CD']),
            employerId: employer.id
        }
    });

    console.log('Successfully added 3 more demo jobs!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
