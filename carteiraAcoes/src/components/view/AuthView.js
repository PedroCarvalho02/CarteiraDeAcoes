import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { useAuth } from "../../context/AuthContext.js";
import { BACKEND_URL } from '@env';
// tela para autenticação (Login e Registro)
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

    // Efeito para lidar com links profundos (Deep Links-> tecnica para app moveis para que os usuarios possam ser direcionados a uma parte especifica do app ao clicar em um link
    useEffect(() => {
        const handleDeepLink = async (event) => {
            const { url } = event;
            const token = getTokenFromUrl(url);
            if (token) {
                try {
                    await loginWithToken(token); // Realiza login com token extraído da URL
                } catch (error) {
                    Alert.alert('Erro de Autenticação', error.message);
                }
            }
        };

        // -> linking( lida com links externos)
        // ->  toda vez que receber um link a funcao trata
        const subscription = Linking.addEventListener('url', handleDeepLink);

        // Verifica se há uma URL inicial se o app for aberto via link
        Linking.getInitialURL().then((url) => {
            if (url) {
                handleDeepLink({ url });
            }
        });

        // remove o subscription para evitar vazamento de memória
        return () => {
            subscription.remove();
        };
    }, []);

    //  extrair o token da URL
    const getTokenFromUrl = (url) => {
        const regex = /token=([^&]+)/;
        const match = regex.exec(url);
        return match ? match[1] : null;
    };


    // Função para login normal
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

    // Função para o registro de um novo usuário
    const Registrar = async () => {
        // Verifica se todos os campos necessários estão preenchidos
        if (!email || !senha || !nome || !cpf || !telefone || !cep) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, senha, nome, cpf, telefone, cep }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log(data.message);
                setIsLoginMode(true); // muda para modo de login
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