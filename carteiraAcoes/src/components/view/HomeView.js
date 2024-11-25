import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const HomeView = () => {
    const { user, token } = useAuth();
    const [saldo, setSaldo] = useState(0);

    useEffect(() => {
        const fetchSaldo = async () => {
            try {
                const response = await fetch('https://hog-chief-visually.ngrok-free.app/saldo', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (response.ok) {
                    setSaldo(data.saldo);
                } else {
                    console.error('Erro ao obter saldo:', data.error);
                }
            } catch (error) {
                console.error('Erro ao obter saldo:', error);
            }
        };

        if (token) {
            fetchSaldo();
        }
    }, [token]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bem-vindo, {user?.nome}!</Text>
            <Text style={styles.description}>Seu saldo atual é: R$ {saldo.toFixed(2)}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f7f7', // Alterado para um tom de fundo mais suave
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#6200ee', // Cor principal
        marginBottom: 10,
        textAlign: 'center', // Centraliza o texto
    },
    description: {
        fontSize: 16,
        color: '#333', // Cor do texto mais escura para contraste
        textAlign: 'center', // Centraliza o texto
    },
});

export default HomeView;