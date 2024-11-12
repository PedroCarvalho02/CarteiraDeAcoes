import React, { createContext, useState, useContext } from 'react';

// Criar o contexto
const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
    const [autenticado, setAutenticado] = useState(false);
    const [user, setUser] = useState(null);

    const login = async (email, senha) => {
        try {
            const response = await fetch('https://f0ab-186-235-96-214.ngrok-free.app/login', {
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

    const logout = () => {
        setAutenticado(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ autenticado, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => {
    return useContext(AuthContext);
};
