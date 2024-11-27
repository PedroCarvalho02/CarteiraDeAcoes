import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

// tela de depósito
const DepositoView = () => {
    const { token } = useAuth();
    const [depositValue, setDepositValue] = useState('');
    const [saldo, setSaldo] = useState(0); o
    const [isLoading, setIsLoading] = useState(false);

    // Função para buscar o saldo 
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

    // Hook para função fetchSaldo sempre que abre a tela
    useFocusEffect(
        useCallback(() => {
            fetchSaldo();
        }, [token])
    );

    // Função para processar o depósito 
    const handleSubmit = async () => {
        const valorNumerico = parseFloat(depositValue); // Converte o valor do depósito para número

        if (isNaN(valorNumerico) || valorNumerico <= 0) {
            Alert.alert('Erro', 'Por favor, insira um valor válido para depósito.');
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch('https://hog-chief-visually.ngrok-free.app/deposito', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ valor: valorNumerico }),
            });
            const data = await response.json();
            if (response.ok) {
                Alert.alert('Sucesso', data.message || 'Depósito realizado com sucesso!');
                setDepositValue('');
                setSaldo(data.saldo);
            } else {
                throw new Error(data.error || 'Erro ao realizar o depósito.');
            }
        } catch (error) {
            console.error('Erro ao realizar depósito:', error);
            Alert.alert('Erro', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#6200ee" /> {/* Indicador de atividade */}
                <Text style={styles.loadingText}>Processando...</Text> {/* Texto de carregamento */}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Depósito</Text>
            <Text style={styles.saldo}>Saldo Atual: R$ {saldo.toFixed(2)}</Text>

            <TextInput
                style={styles.input}
                placeholder="Valor para depósito"
                keyboardType="numeric"
                value={depositValue}
                onChangeText={text => setDepositValue(text)}
            />

            <TouchableOpacity style={styles.botao} onPress={handleSubmit}>
                <Text style={styles.textoBotao}>Realizar Depósito</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    saldo: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderColor: '#6200ee',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 20,
        backgroundColor: '#fff',
    },
    botao: {
        backgroundColor: '#6200ee',
        paddingVertical: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    textoBotao: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingText: {
        marginTop: 10,
        textAlign: 'center',
        color: '#555',
    },
});

export default DepositoView;