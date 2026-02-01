const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000'; // Using localhost for this script running on PC
const client = axios.create({ baseURL: BASE_URL });

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runDemo() {
    console.log('🚀 Starting Library System Demo...\n');
    let userToken = null;
    let userId = null;
    let bookId = null;
    let transactionId = null;

    try {
        // 1. Register
        console.log('1️⃣  Registering new Member...');
        const username = `demo_user_${Date.now()}`;
        try {
            const regRes = await client.post('/register', {
                username: username,
                password: 'password123',
                role: 'member'
            });
            console.log(`   ✅ Success! Created user: ${regRes.data.user.username}`);
            userId = regRes.data.user._id;
        } catch (e) {
            console.log('   ❌ Register failed:', e.response?.data || e.message);
        }

        await sleep(1000);

        // 2. Login
        console.log('\n2️⃣  Logging in...');
        try {
            const loginRes = await client.post('/login', {
                username: username,
                password: 'password123'
            });
            console.log(`   ✅ Login Successful! Welcome ${loginRes.data.user.username}`);
        } catch (e) {
            console.log('   ❌ Login failed:', e.response?.data || e.message);
        }

        await sleep(1000);

        // 3. Admin: Add Book
        console.log('\n3️⃣  [Admin] Adding a new Book to Library...');
        try {
            const bookRes = await client.post('/books', {
                title: 'Automated Testing with Node.js',
                author: 'AI Assistant',
                quantity: 5
            });
            console.log(`   ✅ Book Added: "${bookRes.data.title}" (Qty: ${bookRes.data.quantity})`);
            bookId = bookRes.data._id;
        } catch (e) {
            console.log('   ❌ Add Book failed:', e.response?.data || e.message);
        }

        await sleep(1000);

        // 4. List Books
        console.log('\n4️⃣  Listing Books...');
        try {
            const listRes = await client.get('/books');
            const foundBook = listRes.data.find(b => b._id === bookId);
            console.log(`   ✅ Found ${listRes.data.length} books in library.`);
            if (foundBook) console.log(`   📘 Verified "${foundBook.title}" is in the list.`);
        } catch (e) {
            console.log('   ❌ List Books failed:', e.response?.data || e.message);
        }

        await sleep(1000);

        // 5. Borrow Book
        console.log('\n5️⃣  Borrowing Book...');
        try {
            const borrowRes = await client.post('/borrow', {
                user_id: userId,
                book_id: bookId
            });
            console.log(`   ✅ Borrowed successfully! Due Date: ${new Date(borrowRes.data.transaction.due_date).toLocaleDateString()}`);
            transactionId = borrowRes.data.transaction._id;
        } catch (e) {
            console.log('   ❌ Borrow failed:', e.response?.data || e.message);
        }

        await sleep(1000);

        // 6. Check History
        console.log('\n6️⃣  Checking User History...');
        try {
            const historyRes = await client.get(`/history/${userId}`);
            const myTx = historyRes.data.find(t => t._id === transactionId);
            console.log(`   ✅ History has ${historyRes.data.length} records.`);
            if (myTx) console.log(`   📜 Verified Borrow Log: Status = ${myTx.status}`);
        } catch (e) {
            console.log('   ❌ History failed:', e.response?.data || e.message);
        }

        await sleep(1000);

        // 7. Check Admin Borrowed List
        console.log('\n7️⃣  [Admin] Checking Active Loans...');
        try {
            const adminRes = await client.get('/admin/borrowed-books');
            const loan = adminRes.data.find(t => t._id === transactionId);
            if (loan) console.log(`   👀 Admin sees that ${loan.user_id.username} borrowed "${loan.book_id.title}"`);
        } catch (e) {
            console.log('   ❌ Admin Check failed:', e.response?.data || e.message);
        }

        await sleep(1000);

        // 8. Return Book
        console.log('\n8️⃣  Returning Book...');
        try {
            const returnRes = await client.post('/return', {
                transaction_id: transactionId
            });
            console.log(`   ✅ Returned successfully! Status: ${returnRes.data.transaction.status}`);
        } catch (e) {
            console.log('   ❌ Return failed:', e.response?.data || e.message);
        }

        console.log('\n✨ Demo Complete!');

    } catch (e) {
        console.error('Unexpected Error:', e);
    }
}

runDemo();
