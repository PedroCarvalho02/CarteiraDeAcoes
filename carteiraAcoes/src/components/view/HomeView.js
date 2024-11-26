

import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

const HomeView = () => {
    const { user, token } = useAuth();
    const [saldo, setSaldo] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const fetchSaldo = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('https://hog-chief-visually.ngrok-free.app/saldo', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                setSaldo(data.saldo);
            } else {
                throw new Error(data.error || 'Erro ao obter saldo.');
            }
        } catch (error) {
            console.error('Erro ao buscar saldo:', error);
            Alert.alert('Erro', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchSaldo();
        }, [token])
    );

    if (isLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#6200ee" />
                <Text style={styles.loadingText}>Carregando saldo...</Text>
            </View>
        );
    }

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
        backgroundColor: '#f7f7f7',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#6200ee',
        marginBottom: 10,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
    },
    loadingText: {
        marginTop: 10,
        textAlign: 'center',
        color: '#555',
    },
});

export default HomeView;