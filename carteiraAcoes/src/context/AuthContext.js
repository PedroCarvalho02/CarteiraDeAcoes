import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

// Provedor do contexto de autenticação
export const AuthProvider = ({ children }) => {
    const [autenticado, setAutenticado] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [alerts, setAlerts] = useState([]);

    // Função para realizar o login
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
                setToken(data.token);
                await fetchAlerts();
                return data;
            } else {
                throw new Error(data.error || 'Login falhou');
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    };
// Função para realizar o login com um token 
    const loginWithToken = async (receivedToken) => {
        try {
            setToken(receivedToken);
            setAutenticado(true);
            await fetchAlerts();
        } catch (error) {
            console.error('Erro em loginWithToken:', error);
            throw error;
        }
    };

    
    const logout = () => {
        setAutenticado(false);
        setUser(null);
        setToken(null);
        setAlerts([]);
    };
// Função para buscar os alertas do usuário
    const fetchAlerts = async () => {
        if (!token) return;
        try {
            const response = await fetch('https://hog-chief-visually.ngrok-free.app/alerts', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                setAlerts(data.alerts);
            } else {
                console.error('Erro ao buscar alertas:', data.error);
            }
        } catch (error) {
            console.error('Erro ao buscar alertas:', error);
        }
    };

   
    const createAlert = async (simbolo, target_price) => {
        try {
            const response = await fetch('https://hog-chief-visually.ngrok-free.app/alerts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ simbolo, target_price }),
            });
            const data = await response.json();
            if (response.ok) {
                await fetchAlerts();
                setAlerts([...alerts, { id: data.id, simbolo, target_price, triggered: 0 }]);
                return data;
            } else {
                throw new Error(data.error || 'Erro ao criar alerta.');
            }
        } catch (error) {
            console.error('Erro ao criar alerta:', error);
            throw error;
        }
    };


    const deleteAlert = async (id) => {
        try {
            const response = await fetch(`https://hog-chief-visually.ngrok-free.app/alerts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                setAlerts(alerts.filter(alert => alert.id !== id));
                return data;
            } else {
                throw new Error(data.error || 'Erro ao remover alerta.');
            }
        } catch (error) {
            console.error('Erro ao remover alerta:', error);
            throw error;
        }
    };
// Retorna o contexto com os valores e funções disponíveis
    return (
        <AuthContext.Provider value={{
            autenticado,
            user,
            token,
            alerts,
            login,
            loginWithToken,
            logout,
            fetchAlerts,
            createAlert,
            deleteAlert,
        }}>
            {children}
        </AuthContext.Provider>
    );
};
// Hook para acessar o contexto de autenticação
export const useAuth = () => {
    return useContext(AuthContext);
};