// src/context/AuthContext.js

import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [autenticado, setAutenticado] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null); // Adicione esta linha

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
                setToken(data.token); // Armazena o token
                return data;
            } else {
                throw new Error(data.error || 'Login falhou');
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const loginWithToken = async (receivedToken) => {
        try {
            setToken(receivedToken); // Armazena o token
            setAutenticado(true);
            // Opcional: buscar dados do usuário usando o token
        } catch (error) {
            console.error('Erro em loginWithToken:', error);
            throw error;
        }
    };

    const logout = () => {
        setAutenticado(false);
        setUser(null);
        setToken(null); // Limpa o token ao fazer logout
    };

    return (
        <AuthContext.Provider value={{ autenticado, user, token, login, loginWithToken, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};