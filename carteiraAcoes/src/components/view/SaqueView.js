import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const SaqueView = () => {
    const { token } = useAuth();
    const [withdrawValue, setWithdrawValue] = useState('');
    const [saldo, setSaldo] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchSaldo();
    }, []);

    const fetchSaldo = async () => {
        if (!token) {
            console.warn('Token não disponível.');
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:3000/saldo', { // Atualize a URL conforme necessário
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Erro na resposta:', errorText);
                Alert.alert('Erro', 'Não foi possível obter o saldo.');
                return;
            }

            const data = await response.json();
            setSaldo(data.saldo);
        } catch (error) {
            console.error('Erro ao obter saldo:', error);
            Alert.alert('Erro', 'Ocorreu um erro ao obter o saldo.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleWithdraw = async () => {
        const valorSaque = parseFloat(withdrawValue);

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
            const response = await fetch('http://localhost:3000/saque', { // Atualize a URL conforme necessário
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ valor: valorSaque }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Sucesso', data.message || 'Saque realizado com sucesso!');
                setSaldo(data.saldo);
                setWithdrawValue('');
            } else {
                Alert.alert('Erro', data.error || 'Não foi possível realizar o saque.');
            }
        } catch (error) {
            console.error('Erro ao realizar saque:', error);
            Alert.alert('Erro', 'Ocorreu um erro ao realizar o saque.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Saque</Text>
            {isLoading ? (
                <ActivityIndicator size="large" color="#6200ee" />
            ) : (
                <Text style={styles.saldo}>Saldo atual: R$ {saldo.toFixed(2)}</Text>
            )}
            <View style={styles.form}>
                <Text style={styles.label}>Valor do Saque:</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={withdrawValue}
                    onChangeText={text => setWithdrawValue(text)}
                    placeholder="Digite o valor a sacar"
                />
                <Button title="Sacar" onPress={handleWithdraw} disabled={isLoading} />
            </View>
            <View style={styles.buttonContainer}>
                <Button title="Atualizar Saldo" onPress={fetchSaldo} disabled={isLoading} color="#6200ee" />
            </View>
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
        color: '#6200ee',
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