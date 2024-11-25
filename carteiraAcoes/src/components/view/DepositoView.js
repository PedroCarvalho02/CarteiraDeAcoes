import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const DepositoView = () => {
    const { token } = useAuth(); // Obtém o token do contexto
    const [depositValue, setDepositValue] = useState(0);
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

        if (token) { // Certifica-se de que o token está disponível
            fetchSaldo();
        }
    }, [token]);

    const handleSubmit = async () => {
        try {
            const response = await fetch('https://hog-chief-visually.ngrok-free.app/deposito', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ valor: depositValue }),
            });
            const data = await response.json();
            if (response.ok) {
                Alert.alert('Sucesso', data.message);
                setSaldo(data.saldo);
            } else {
                Alert.alert('Erro', data.error);
            }
        } catch (error) {
            console.error('Erro ao realizar depósito:', error);
            Alert.alert('Erro', 'Não foi possível realizar o depósito.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Depósito</Text>
            <Text style={styles.saldo}>Saldo atual: R$ {saldo.toFixed(2)}</Text>
            <View style={styles.form}>
                <Text style={styles.label}>Valor do Depósito:</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={String(depositValue)}
                    onChangeText={text => setDepositValue(Number(text))}
                    required
                />
                <Button title="Depositar" onPress={handleSubmit} />
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
    },
    form: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        elevation: 2,
    },
    label: {
        fontSize: 16,
        marginBottom: 10,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 20,
    },
});

export default DepositoView;