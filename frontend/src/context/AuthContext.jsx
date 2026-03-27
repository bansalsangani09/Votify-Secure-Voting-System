import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');

            if (token) {
                try {
                    const storedUser = localStorage.getItem('user');
                    if (storedUser && storedUser !== "undefined") {
                        const parsedUser = JSON.parse(storedUser);
                        // Ensure _id is available for components expecting it (backward compatibility)
                        if (parsedUser.id && !parsedUser._id) {
                            parsedUser._id = parsedUser.id;
                        }
                        setUser(parsedUser);
                    }
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                } catch (e) {
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                }
            }

            setLoading(false);
        };

        checkLoggedIn();
    }, []);

    const login = async (email, password, recaptchaToken) => {
        const res = await axios.post('/api/auth/login', { email, password, recaptchaToken });

        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));

        setUser(res.data.user);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;

        return res.data;
    };

    const register = async (userData) => {
        const res = await axios.post('/api/auth/register', userData);
        return res.data;
    };

    const googleLogin = async (token) => {
        const res = await axios.post('/api/auth/google-login', { token });

        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));

        setUser(res.data.user);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;

        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, register, googleLogin, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};