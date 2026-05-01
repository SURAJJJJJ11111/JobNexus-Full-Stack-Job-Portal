const nodemailer = require('nodemailer');

const emailUser = 'crtheyeh@gmail.com';
const emailPass = 'iqvinmzkcucvdlfz';

console.log('Testing sendMail...');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: emailUser, pass: emailPass }
});

transporter.sendMail({
    from: emailUser,
    to: 'surajkr9845@gmail.com',
    subject: 'Test Email',
    text: 'If you get this, nodemailer works!'
}).then(() => {
    console.log('SUCCESS: Email sent!');
    process.exit(0);
}).catch(err => {
    console.error('FAILED:', err.message);
    process.exit(1);
});
