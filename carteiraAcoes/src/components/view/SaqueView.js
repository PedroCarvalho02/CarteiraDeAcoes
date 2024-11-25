// SaqueView.js

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const SaqueView = () => {
    const { token } = useAuth();
    const [withdrawValue, setWithdrawValue] = useState('');
    const [saldo, setSaldo] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchSaldo = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('https://hog-chief-visually.ngrok-free.app/saldo', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                const data = await response.json();
                if (response.ok) {
                    setSaldo(data.saldo);
                } else {
                    Alert.alert('Erro', data.error || 'Não foi possível obter o saldo.');
                }
            } catch (error) {
                console.error('Erro ao obter saldo:', error);
                Alert.alert('Erro', 'Ocorreu um erro ao obter o saldo.');
            } finally {
                setIsLoading(false);
            }
        };

        if (token) {
            fetchSaldo();
        }
    }, [token]);

    const handleWithdraw = async () => {
        console.log('🔄 Iniciando função handleWithdraw');
        console.log('Valor do saque:', withdrawValue);
        console.log('Token:', token);
        
        const valorSaque = parseFloat(withdrawValue);
        console.log('ValorSaque parseado:', valorSaque);

        if (isNaN(valorSaque) || valorSaque <= 0) {
            Alert.alert('Erro', 'Por favor, insira um valor válido para saque.');
            return;
        }

        if (valorSaque > saldo) {
            Alert.alert('Erro', 'Saldo insuficiente para realizar o saque.');
            return;
        }

        try {
            setIsLoading(true);
            console.log('Enviando requisição de saque...');
            const response = await fetch('https://hog-chief-visually.ngrok-free.app/saque', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ valor: valorSaque }),
            });

            console.log('Requisição enviada, aguardando resposta...');
            const data = await response.json();
            console.log('Resposta da API:', data);

            if (response.ok) {
                Alert.alert('Sucesso', data.message || 'Saque realizado com sucesso!');
                setSaldo(data.saldo);
                setWithdrawValue('');
            } else {
                Alert.alert('Erro', data.error || 'Não foi possível realizar o saque.');
            }
        } catch (error) {
            console.error('⚠️ Erro ao realizar saque:', error);
            Alert.alert('Erro', 'Ocorreu um erro ao realizar o saque.');
        } finally {
            setIsLoading(false);
            console.log('🔄 Função handleWithdraw finalizada');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Saque</Text>
            {isLoading ? (
                <ActivityIndicator size="large" color="#6200ee" />
            ) : (
                <>
                    <Text style={styles.saldo}>Saldo atual: R$ {saldo.toFixed(2)}</Text>
                    <View style={styles.form}>
                        <Text style={styles.label}>Valor do Saque:</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={withdrawValue}
                            onChangeText={text => setWithdrawValue(text)}
                            placeholder="Digite o valor a sacar"
                        />
                        <Button title="Sacar" onPress={handleWithdraw} disabled={isLoading} color="#6200ee" />
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button title="Atualizar Saldo" onPress={() => {
                            setIsLoading(true);
                            setSaldo(0);
                        }} disabled={isLoading} color="#6200ee" />
                    </View>
                </>
            )}
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
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 10,
        color: '#333',
    },
    form: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        elevation: 2,
        marginTop: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 10,
        color: '#6200ee',
    },
    input: {
        height: 40,
        borderColor: '#6200ee',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    buttonContainer: {
        marginTop: 10,
    },
});

export default SaqueView;