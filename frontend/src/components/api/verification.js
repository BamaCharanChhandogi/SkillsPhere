import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';

export const verifyEmailAPI = async (token) => {
    try {
        const response = await axios.get(`${USER_API_END_POINT}/verify/${token}`, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error('Verification failed');
    }
};      