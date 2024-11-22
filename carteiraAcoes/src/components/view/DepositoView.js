import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const DepositoView = () => {
    const [depositValue, setDepositValue] = useState(0);


    const handleSubmit = (e) => {
        e.preventDefault();
        // Adicione a lógica de depósito aqui
        console.log(`Valor depositado: ${depositValue}`);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Depósito</Text>
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