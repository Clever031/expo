import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '../api/axiosClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);

    // Check if user is logged in
    useEffect(() => {
        isLoggedIn();
    }, []);

    const isLoggedIn = async () => {
        try {
            setIsLoading(true);
            let userInfo = await AsyncStorage.getItem('user');
            userInfo = JSON.parse(userInfo);

            if (userInfo) {
                setUser(userInfo);
            }
            setIsLoading(false);
        } catch (e) {
            console.log(`isLoggedIn error ${e}`);
            setIsLoading(false);
        }
    };

    const register = async (username, password, role) => {
        setIsLoading(true);
        try {
            await axiosClient.post('/register', {
                username,
                password,
                role
            });
            setIsLoading(false);
            return { success: true };
        } catch (e) {
            setIsLoading(false);
            return {
                success: false,
                error: e.response?.data?.error || 'Registration failed'
            };
        }
    };

    const login = async (username, password) => {
        setIsLoading(true);
        try {
            const response = await axiosClient.post('/login', {
                username,
                password
            });

            const userInfo = response.data.user;
            setUser(userInfo);
            await AsyncStorage.setItem('user', JSON.stringify(userInfo));

            setIsLoading(false);
            return { success: true };
        } catch (e) {
            console.log('Login Error in Context:', e);
            if (e.response) {
                console.log('Error Data:', e.response.data);
                console.log('Error Status:', e.response.status);
            } else if (e.request) {
                console.log('Error Request:', e.request);
            } else {
                console.log('Error Message:', e.message);
            }
            setIsLoading(false);
            return {
                success: false,
                error: e.response?.data?.error || e.message || 'Login failed'
            };
        }
    };

    const logout = async () => {
        setIsLoading(true);
        setUser(null);
        await AsyncStorage.removeItem('user');
        setIsLoading(false);
    };

    return (
        <AuthContext.Provider
            value={{
                isLoading,
                user,
                register,
                login,
                logout
            }}>
            {children}
        </AuthContext.Provider>
    );
};
