import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

const SaqueView = () => {
    const { token } = useAuth();
    const [withdrawValue, setWithdrawValue] = useState('');
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

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao obter saldo.');
            }

            const data = await response.json();
            setSaldo(data.saldo);
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

    const handleSaque = async () => {
        const valorNumerico = parseFloat(withdrawValue);

        if (isNaN(valorNumerico) || valorNumerico <= 0) {
            Alert.alert('Erro', 'Por favor, insira um valor válido para saque.');
            return;
        }

        if (valorNumerico > saldo) {
            Alert.alert('Erro', 'Saldo insuficiente para realizar o saque.');
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch('https://hog-chief-visually.ngrok-free.app/saque', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ valor: valorNumerico }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao realizar o saque.');
            }

            Alert.alert('Sucesso', data.message || 'Saque realizado com sucesso!');
            setWithdrawValue('');
            setSaldo(data.saldo); // Atualiza o saldo localmente
        } catch (error) {
            console.error('Erro ao realizar saque:', error);
            Alert.alert('Erro', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#6200ee" />
                <Text style={styles.loadingText}>Processando...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Saque</Text>
            <Text style={styles.saldo}>Saldo Atual: R$ {saldo.toFixed(2)}</Text>

            <TextInput
                style={styles.input}
                placeholder="Valor para saque"
                keyboardType="numeric"
                value={withdrawValue}
                onChangeText={setWithdrawValue}
            />

            <TouchableOpacity style={styles.botao} onPress={handleSaque}>
                <Text style={styles.textoBotao}>Realizar Saque</Text>
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

export default SaqueView;