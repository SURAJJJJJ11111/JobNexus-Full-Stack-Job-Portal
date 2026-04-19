const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    console.log("Creating Admin account...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    const existingAdmin = await prisma.user.findUnique({
        where: { email: 'admin@demo.com' }
    });

    if (existingAdmin) {
        console.log("admin@demo.com already exists. Updating role to admin...");
        await prisma.user.update({
            where: { email: 'admin@demo.com' },
            data: { role: 'admin' }
        });
    } else {
        await prisma.user.create({
            data: {
                name: 'System Admin',
                email: 'admin@demo.com',
                password: hashedPassword,
                role: 'admin',
                bio: 'Platform Administrator',
            }
        });
    }

    console.log('Successfully created Ultimate Admin Account: admin@demo.com / 123456');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
