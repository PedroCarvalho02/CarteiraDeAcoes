import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { useNavigation } from '@react-navigation/native';

const RegistroView = () => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [telefone, setTelefone] = useState('');
    const [cep, setCep] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const navigation = useNavigation();

    const Registrar = async () => {
        try {
            const response = await fetch('https://84e6-2804-14c-fc81-94aa-ed7e-2c1c-c7b1-7b38.ngrok-free.app/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    senha,
                    nome,
                    cpf,
                    telefone,
                    cep,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log(data.message);
                navigation.navigate('login');
            } else {
                setErrorMessage(data.error || 'Erro ao registrar: ' + (data.details || data.message));
            }
        } catch (error) {
            console.log("Erro completo:", error);
            setErrorMessage(error.message || 'Erro ao registrar.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Registro</Text>
            <TextInput
                label="Nome"
                value={nome}
                onChangeText={text => setNome(text)}
                mode="outlined"
                placeholder="Digite seu nome"
                style={styles.input}
                theme={{ colors: { primary: '#6200ee' } }}
            />
            <TextInput
                label="CPF"
                value={cpf}
                onChangeText={text => setCpf(text)}
                mode="outlined"
                placeholder="Digite seu CPF"
                style={styles.input}
                theme={{ colors: { primary: '#6200ee' } }}
            />
            <TextInput
                label="Telefone"
                value={telefone}
                onChangeText={text => setTelefone(text)}
                mode="outlined"
                placeholder="Digite seu telefone"
                style={styles.input}
                theme={{ colors: { primary: '#6200ee' } }}
            />
            <TextInput
                label="CEP"
                value={cep}
                onChangeText={text => setCep(text)}
                mode="outlined"
                placeholder="Digite seu CEP"
                style={styles.input}
                theme={{ colors: { primary: '#6200ee' } }}
            />
            <TextInput
                label="Email"
                value={email}
                onChangeText={text => setEmail(text)}
                mode="outlined"
                placeholder="Digite um email"
                style={styles.input}
                theme={{ colors: { primary: '#6200ee' } }}
            />
            <TextInput
                label="Password"
                secureTextEntry
                value={senha}
                onChangeText={text => setSenha(text)}
                mode="outlined"
                placeholder="Digite uma senha"
                style={styles.input}
                theme={{ colors: { primary: '#6200ee' } }}
            />

            <Button
                mode="contained"
                onPress={Registrar}
                style={styles.button}
                labelStyle={styles.buttonLabel}
            >
                Registrar
            </Button>

            {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

            <TouchableOpacity onPress={() => navigation.navigate('login')}>
                <Text style={styles.link}>Já tem uma conta? Faça Login</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f7f7f7',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 40,
        color: '#6200ee',
    },
    input: {
        width: '100%',
        marginBottom: 20,
        backgroundColor: '#fff',
    },
    button: {
        width: '100%',
        paddingVertical: 10,
        borderRadius: 5,
        backgroundColor: '#6200ee',
    },
    buttonLabel: {
        fontSize: 18,
        color: '#fff',
    },
    errorMessage: {
        color: 'red',
        marginTop: 10,
    },
    link: {
        color: '#6200ee',
        marginTop: 20,
        fontSize: 16,
    },
});

export default RegistroView;
