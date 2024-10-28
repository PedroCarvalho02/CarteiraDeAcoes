import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
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
        <View>
            <Text>Registro</Text>
            <TextInput
                label="Nome"
                value={nome}
                onChangeText={text => setNome(text)}
                mode="outlined"
                placeholder="Digite seu nome"
            />
            <TextInput
                label="CPF"
                value={cpf}
                onChangeText={text => setCpf(text)}
                mode="outlined"
                placeholder="Digite seu cpf"
            />
            <TextInput
                label="Telefone"
                value={telefone}
                onChangeText={text => setTelefone(text)}
                mode="outlined"
                placeholder="Digite seu telefone"
            />
            <TextInput
                label="CEP"
                value={cep}
                onChangeText={text => setCep(text)}
                mode="outlined"
                placeholder="Digite seu cep"
            />
            <TextInput
                label="Email"
                value={email}
                onChangeText={text => setEmail(text)}
                mode="outlined"
                placeholder="Digite um email"
            />
            <TextInput
                label="Password"
                secureTextEntry
                value={senha}
                onChangeText={text => setSenha(text)}
                mode="outlined"
                placeholder="Digite uma senha"
            />

            <Button mode="contained" onPress={Registrar}>Registrar</Button>

            {errorMessage ? <Text style={{ color: 'red' }}>{errorMessage}</Text> : null}

            <TouchableOpacity onPress={() => navigation.navigate('login')}>
                <Text style={{ color: 'blue', marginTop: 20 }}>Já tem uma conta? Faça Login</Text>
            </TouchableOpacity>
        </View>
    );
};

export default RegistroView;