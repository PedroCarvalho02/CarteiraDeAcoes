// src/components/view/AuthView.js

import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { useAuth } from "../../context/AuthContext.js";

const AuthView = () => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [telefone, setTelefone] = useState('');
    const [cep, setCep] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoginMode, setIsLoginMode] = useState(true);
    const { login, loginWithToken } = useAuth();

    useEffect(() => {
        const handleDeepLink = async (event) => {
            const { url } = event;
            const token = getTokenFromUrl(url);
            if (token) {
                try {
                    await loginWithToken(token);
                   
                } catch (error) {
                    Alert.alert('Erro de Autenticação', error.message);
                }
            }
        };

        const subscription = Linking.addEventListener('url', handleDeepLink);

       
        Linking.getInitialURL().then((url) => {
            if (url) {
                handleDeepLink({ url });
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);

    const getTokenFromUrl = (url) => {
        const regex = /token=([^&]+)/;
        const match = regex.exec(url);
        return match ? match[1] : null;
    };

    const handleGoogleOAuth = () => {
        const authUrl = 'https://hog-chief-visually.ngrok-free.app/auth';
        Linking.openURL(authUrl);
    };

    const Login = async () => {
        if (!email || !senha) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }
        try {
            await login(email, senha);
        } catch (error) {
            Alert.alert('Erro ao logar', error.message);
        }
    };

    const Registrar = async () => {
        if (!email || !senha || !nome || !cpf || !telefone || !cep) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }

        try {
            const response = await fetch('https://hog-chief-visually.ngrok-free.app/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, senha, nome, cpf, telefone, cep }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log(data.message);
                setIsLoginMode(true);
                Alert.alert('Sucesso', 'Registro realizado com sucesso! Por favor, faça login.');
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
            <Text style={styles.title}>{isLoginMode ? 'LOGIN' : 'REGISTRO'}</Text>

            {isLoginMode ? (
                <>
                    <TextInput
                        label="Email"
                        value={email}
                        onChangeText={text => setEmail(text)}
                        mode="outlined"
                        placeholder="Digite um email"
                        style={styles.input}
                        theme={{ colors: { primary: '#6200ee' } }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TextInput
                        label="Senha"
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
                        onPress={Login}
                        style={styles.button}
                        labelStyle={styles.buttonLabel}
                    >
                        Entrar
                    </Button>
                    <Button
                        mode="outlined"
                        onPress={handleGoogleOAuth}
                        style={styles.googleButton}
                        labelStyle={styles.buttonLabel}
                    >
                        Entrar com Google
                    </Button>
                </>
            ) : (
                <>
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
                        keyboardType="numeric"
                    />
                    <TextInput
                        label="Telefone"
                        value={telefone}
                        onChangeText={text => setTelefone(text)}
                        mode="outlined"
                        placeholder="Digite seu telefone"
                        style={styles.input}
                        theme={{ colors: { primary: '#6200ee' } }}
                        keyboardType="phone-pad"
                    />
                    <TextInput
                        label="CEP"
                        value={cep}
                        onChangeText={text => setCep(text)}
                        mode="outlined"
                        placeholder="Digite seu CEP"
                        style={styles.input}
                        theme={{ colors: { primary: '#6200ee' } }}
                        keyboardType="numeric"
                    />
                    <TextInput
                        label="Email"
                        value={email}
                        onChangeText={text => setEmail(text)}
                        mode="outlined"
                        placeholder="Digite um email"
                        style={styles.input}
                        theme={{ colors: { primary: '#6200ee' } }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TextInput
                        label="Senha"
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
                </>
            )}

            {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

            <TouchableOpacity onPress={() => setIsLoginMode(!isLoginMode)}>
                <Text style={styles.link}>
                    {isLoginMode ? 'Não tem conta? Cadastre-se aqui' : 'Já tem uma conta? Faça Login'}
                </Text>
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
        marginBottom: 10,
    },
    googleButton: {
        width: '100%',
        paddingVertical: 10,
        borderRadius: 5,
        borderColor: '#6200ee',
        borderWidth: 1,
    },
    buttonLabel: {
        fontSize: 18,
        color: '#fff',
    },
    errorMessage: {
        color: 'red',
        marginTop: 10,
        textAlign: 'center',
    },
    link: {
        color: '#6200ee',
        marginTop: 20,
        fontSize: 16,
        textAlign: 'center',
    },
});

export default AuthView;