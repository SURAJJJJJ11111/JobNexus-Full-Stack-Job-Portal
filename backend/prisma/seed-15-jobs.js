const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const jobsToInsert = [
    {
        title: 'Senior Frontend Developer',
        description: 'We are looking for an experienced Frontend Architect to lead our React and Vue implementations.',
        company: 'TechFlow Solutions',
        location: 'San Francisco, CA',
        locationType: 'onsite',
        type: 'full-time',
        category: 'Technology',
        experience: 'senior',
        salaryMin: 130000,
        salaryMax: 170000,
        skills: JSON.stringify(['React', 'TypeScript', 'CSS', 'Webpack']),
    },
    {
        title: 'Backend Node.js Developer',
        description: 'Join our backend infrastructure team to scale APIs handling millions of requests per minute.',
        company: 'CloudScale Inc',
        location: 'Remote',
        locationType: 'remote',
        type: 'full-time',
        category: 'Technology',
        experience: 'mid',
        salaryMin: 110000,
        salaryMax: 155000,
        skills: JSON.stringify(['Node.js', 'Express', 'Prisma', 'PostgreSQL']),
    },
    {
        title: 'Marketing Specialist',
        description: 'We need a creative marketing specialist to handle our B2B social media campaigns and outreach.',
        company: 'Global Reach Media',
        location: 'New York, NY',
        locationType: 'hybrid',
        type: 'full-time',
        category: 'Marketing',
        experience: 'mid',
        salaryMin: 70000,
        salaryMax: 95000,
        skills: JSON.stringify(['SEO', 'Content Strategy', 'HubSpot']),
    },
    {
        title: 'Graphic Designer',
        description: 'Seeking a talented designer for our branding, ad-creatives, and product mockups.',
        company: 'Creative Studios LLC',
        location: 'Remote',
        locationType: 'remote',
        type: 'freelance',
        category: 'Design',
        experience: 'entry',
        salaryMin: 50000,
        salaryMax: 80000,
        skills: JSON.stringify(['Photoshop', 'Illustrator', 'Figma']),
    },
    {
        title: 'Clinical Data Analyst',
        description: 'Work with healthcare professionals to analyze patient data, ensure HIPAA compliance, and write reports.',
        company: 'HealthMed Partners',
        location: 'Boston, MA',
        locationType: 'onsite',
        type: 'full-time',
        category: 'Healthcare',
        experience: 'mid',
        salaryMin: 95000,
        salaryMax: 125000,
        skills: JSON.stringify(['Python', 'Data Analysis', 'SQL', 'Healthcare']),
    },
    {
        title: 'Financial Auditor',
        description: 'Looking for a certified auditor to review financial statements and tax filings for our enterprise clients.',
        company: 'Apex Accounting Corp',
        location: 'Chicago, IL',
        locationType: 'hybrid',
        type: 'full-time',
        category: 'Finance',
        experience: 'senior',
        salaryMin: 120000,
        salaryMax: 160000,
        skills: JSON.stringify(['Audit', 'GAAP', 'Fintech']),
    },
    {
        title: 'High School Mathematics Teacher',
        description: 'Passionate educator needed to teach Algebra and Calculus to juniors and seniors.',
        company: 'Lincoln Public Schools',
        location: 'Austin, TX',
        locationType: 'onsite',
        type: 'contract',
        category: 'Education',
        experience: 'mid',
        salaryMin: 55000,
        salaryMax: 78000,
        skills: JSON.stringify(['Teaching', 'Curriculum Design', 'Mathematics']),
    },
    {
        title: 'B2B Sales Executive',
        description: 'Drive revenue growth by acquiring SaaS clients across North America. High commission structure.',
        company: 'SalesForce Pro',
        location: 'Remote',
        locationType: 'remote',
        type: 'full-time',
        category: 'Sales',
        experience: 'senior',
        salaryMin: 90000,
        salaryMax: 200000,
        skills: JSON.stringify(['B2B Sales', 'CRM', 'Negotiation']),
    },
    {
        title: 'Mechanical Engineer',
        description: 'Design and test consumer hardware products in our state-of-the-art laboratory.',
        company: 'NextGen Hardware',
        location: 'Seattle, WA',
        locationType: 'onsite',
        type: 'full-time',
        category: 'Engineering',
        experience: 'entry',
        salaryMin: 85000,
        salaryMax: 110000,
        skills: JSON.stringify(['CAD', 'SolidWorks', 'Prototyping']),
    },
    {
        title: 'HR Generalist',
        description: 'Manage employee relations, onboarding, and benefits administration for our fast-growing startup.',
        company: 'People First Tech',
        location: 'Denver, CO',
        locationType: 'hybrid',
        type: 'full-time',
        category: 'HR',
        experience: 'mid',
        salaryMin: 65000,
        salaryMax: 85000,
        skills: JSON.stringify(['Recruiting', 'Onboarding', 'Payroll']),
    },
    {
        title: 'Cybersecurity Analyst',
        description: 'Monitor networks for security breaches, investigate violations, and install protective software.',
        company: 'DefendIT Security',
        location: 'Remote',
        locationType: 'remote',
        type: 'full-time',
        category: 'Technology',
        experience: 'mid',
        salaryMin: 105000,
        salaryMax: 140000,
        skills: JSON.stringify(['Cybersecurity', 'SIEM', 'Network Security']),
    },
    {
        title: 'Principal Systems Architect',
        description: 'Design the macro-architecture of our entire microservice ecosystem and guide engineering teams.',
        company: 'MegaCorp Tech',
        location: 'San Jose, CA',
        locationType: 'onsite',
        type: 'full-time',
        category: 'Technology',
        experience: 'lead',
        salaryMin: 180000,
        salaryMax: 250000,
        skills: JSON.stringify(['System Design', 'Cloud Architecture', 'Leadership']),
    },
    {
        title: 'Copywriter',
        description: 'Write engaging copy for blogs, newsletters, and ad campaigns to increase conversion rates.',
        company: 'WordSmith Agency',
        location: 'Remote',
        locationType: 'remote',
        type: 'freelance',
        category: 'Marketing',
        experience: 'entry',
        salaryMin: 45000,
        salaryMax: 65000,
        skills: JSON.stringify(['Copywriting', 'SEO', 'Creative Writing']),
    },
    {
        title: 'Mobile App Developer (Flutter)',
        description: 'Develop cross-platform mobile applications for our fitness tracking hardware.',
        company: 'FitTech Insights',
        location: 'Miami, FL',
        locationType: 'hybrid',
        type: 'full-time',
        category: 'Technology',
        experience: 'mid',
        salaryMin: 100000,
        salaryMax: 135000,
        skills: JSON.stringify(['Flutter', 'Dart', 'Mobile Dev']),
    },
    {
        title: 'Data Scientist',
        description: 'Build predictive models to forecast consumer buying behaviors and integrate with our CRM.',
        company: 'DataMetrics AI',
        location: 'Remote',
        locationType: 'remote',
        type: 'full-time',
        category: 'Technology',
        experience: 'senior',
        salaryMin: 140000,
        salaryMax: 185000,
        skills: JSON.stringify(['Python', 'Machine Learning', 'TensorFlow', 'Data Science']),
    }
];

async function main() {
    console.log("Fetching Employer/Admin account...");
    const employer = await prisma.user.findUnique({
        where: { email: 'employer@demo.com' }
    });

    if (!employer) {
        console.error("employer@demo.com not found!");
        return;
    }

    console.log(`Adding 15 jobs to employer account: ${employer.name}`);

    for (const job of jobsToInsert) {
        await prisma.job.create({
            data: {
                ...job,
                employerId: employer.id
            }
        });
    }

    console.log('Successfully inserted 15 high-quality demo jobs across multiple categories!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
