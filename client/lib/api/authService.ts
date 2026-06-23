import { apiClient } from './client';
import mockData from './mockData.json';

const STORAGE_KEY = 'envest_user_session';
const DB_KEY = 'envest_mock_db_users';
const TEMP_SIGNUP_KEY = 'envest_temp_signup';

// Initialize Mock DB in localStorage if empty
const initializeDB = () => {
    const existingDB = localStorage.getItem(DB_KEY);
    if (!existingDB) {
        localStorage.setItem(DB_KEY, JSON.stringify(mockData.users));
    }
};

initializeDB();

export const authService = {
    login: async (credentials: any) => {
        try {
            // Real API call
            const payload = {
                username: credentials.username || credentials.email,
                password: credentials.password
            };
            const response = await apiClient<any>('POST', 'login', payload);

            // Check for success based on API response structure
            if (response.code === 200 && response.status && response.data) {
                const apiUser = response.data;

                // Map API user to application User interface
                // Note: The API returns { user_id, username, email, name, image, role, token }
                // The app expects { id, email, firstName, lastName, ... }
                const user = {
                    id: apiUser.user_id,
                    email: apiUser.email,
                    firstName: apiUser.name?.split(' ')[0] || apiUser.username,
                    lastName: apiUser.name?.split(' ').slice(1).join(' ') || '',
                    phone: apiUser.phone || '', // Satisfy User interface
                    role: apiUser.role,
                    image: apiUser.image,
                    // Add other fields as necessary or leave undefined if not provided by API
                };

                // Save user session (token is already handled by interceptor)
                sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));

                return user;
            } else {
                throw new Error(response.message || 'Login failed');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            throw error;
        }
    },

    signUp: async (data: any) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // During sign up, we just hold the data in session storage temporarily
        sessionStorage.setItem(TEMP_SIGNUP_KEY, JSON.stringify(data));
        return data;
    },

    verifyOtp: async (code: string) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // Strict verification for "123456" as requested
        if (code !== '123456') {
            throw new Error('Invalid verification code');
        }
        return true;
    },

    completeProfile: async (profileData: any) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Get temp data from the signup step
        const tempData = JSON.parse(sessionStorage.getItem(TEMP_SIGNUP_KEY) || '{}');

        // Create full user object
        const newUser = {
            id: Math.random().toString(36).substr(2, 9),
            ...tempData,
            ...profileData,
            role: 'super_admin',
            permissions: mockData.users[0].permissions, // Grant default permissions
        };

        // Save new user to the Persistent Mock DB
        const users = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
        users.push(newUser);
        localStorage.setItem(DB_KEY, JSON.stringify(users));

        // Set active session and clear temp data
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
        sessionStorage.removeItem(TEMP_SIGNUP_KEY);

        return newUser;
    },

    getCurrentUser: () => {
        const data = sessionStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    },

    logout: () => {
        sessionStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('envest_auth_token'); // Clear token on logout
    }
};
