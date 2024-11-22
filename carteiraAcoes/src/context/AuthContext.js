// src/context/AuthContext.js

import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [autenticado, setAutenticado] = useState(false);
    const [user, setUser] = useState(null);

    const login = async (email, senha) => {
        try {
            const response = await fetch('https://hog-chief-visually.ngrok-free.app/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, senha }),
            });
            const data = await response.json();
            if (response.ok) {
                setAutenticado(true);
                setUser(data.user);
                return data;
            } else {
                throw new Error(data.message || 'Login falhou');
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    
    const loginWithToken = async (token) => {
        try {
            const response = await fetch('https://hog-chief-visually.ngrok-free.app/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
    
            // Registrar o status da resposta
            console.log(`Status da Resposta: ${response.status}`);
    
            // Registrar o texto bruto da resposta
            const text = await response.text();
            console.log('Texto da Resposta:', text);
    
            // Tentar analisar o texto como JSON
            const data = JSON.parse(text);
    
            if (response.ok) {
                setAutenticado(true);
                setUser(data.user);
            } else {
                throw new Error(data.message || 'OAuth Login falhou');
            }
        } catch (error) {
            console.error('Erro em loginWithToken:', error);
            throw error;
        }
    };

    const logout = () => {
        setAutenticado(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ autenticado, user, login, loginWithToken, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};