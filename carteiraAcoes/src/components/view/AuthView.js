import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { useAuth } from "../../../context/AuthContext.js";


const AuthView = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [telefone, setTelefone] = useState('');
    const [cep, setCep] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoginMode, setIsLoginMode] = useState(true); // Estado para alternar entre login e registro
    const { login } = useAuth(); // Usando o contexto de autenticação

    const Login = async () => {
        if (!email || !senha) {
            alert('Por favor, preencha todos os campos.');
            return;
        }
        try {
            await login(email, senha);
            navigation.navigate('home'); // Navegar para a tela inicial após login bem-sucedido
        } catch (error) {
            alert('Erro ao logar: ' + error.message);
        }
    };


    const Registrar = async () => {
        try {
            const response = await fetch('https://e8a4-186-235-96-214.ngrok-free.app/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, senha, nome, cpf, telefone, cep }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log(data.message);
                setIsLoginMode(true); // Voltar para a tela de login após o registro
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

export default AuthView;
