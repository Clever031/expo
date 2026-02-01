const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function createAdmin() {
    try {
        console.log('Creating Admin User...');
        const res = await axios.post(`${BASE_URL}/register`, {
            username: 'admin',
            password: 'password123',
            role: 'admin'
        });
        console.log('✅ Success! Admin created.');
        console.log('Username: admin');
        console.log('Password: password123');
    } catch (error) {
        if (error.response?.status === 400) {
            console.log('⚠️  User "admin" already exists. You can try logging in with password "password123"');
        } else {
            console.error('❌ Error:', error.message);
        }
    }
}

createAdmin();
