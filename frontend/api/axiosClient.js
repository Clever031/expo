import axios from 'axios';

// ⚠️ สำหรับทดสอบบนคอมพิวเตอร์ (Web) ใช้ localhost ได้เลย
// ถ้าใช้ Android Emulator ให้เปลี่ยนเป็น 'http://10.0.2.2:3000'
const BASE_URL = 'http://localhost:3000';

const axiosClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000, // 10 seconds timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosClient.interceptors.request.use(request => {
    console.log('Starting Request', JSON.stringify(request, null, 2));
    return request;
});

axiosClient.interceptors.response.use(response => {
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response;
}, error => {
    console.log('Response Error:', error);
    return Promise.reject(error);
});

export default axiosClient;
