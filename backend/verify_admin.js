const axios = require('axios');

async function test() {
    try {
        // 1. Login
        console.log('Logging in as admin...');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@demo.com',
            password: '123456'
        });
        const token = loginRes.data.token;
        console.log('Logged in, Token:', token);

        // 2. Fetch Stats
        console.log('Fetching stats...');
        const statsRes = await axios.get('http://localhost:5000/api/admin/stats', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Stats:', statsRes.data);

        // 3. Fetch Users
        console.log('Fetching users...');
        const usersRes = await axios.get('http://localhost:5000/api/admin/users', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Users:', usersRes.data.users.length);

        // 4. Fetch Jobs
        console.log('Fetching jobs...');
        const jobsRes = await axios.get('http://localhost:5000/api/admin/jobs', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Jobs:', jobsRes.data.jobs.length);

    } catch (e) {
        console.error('API Error:', e.response?.status, e.response?.data || e.message);
    }
}
test();
