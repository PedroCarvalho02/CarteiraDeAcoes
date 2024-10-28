import { View, Text } from "react-native"
import { TextInput,Button } from "react-native-paper";
import axios from "axios";
import { useState } from "react"
import { TouchableOpacity } from "react-native";



export default LoginView = ({navigation}) => {


    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    const Login = async () => {
        try {
            const response = await fetch('https://84e6-2804-14c-fc81-94aa-ed7e-2c1c-c7b1-7b38.ngrok-free.app/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, senha })
            });
            const data = await response.json();
            alert(data.message);
            navigation.navigate('home');
        } catch (error) {
            alert('Erro ao logar: ' + error.message);
        }
    }

    return (
        <View>
            <Text>LOGIN</Text>
            <TextInput
                label="Email"
                value={email}
                onChangeText={text => setEmail(text)}
            />
            <TextInput
                label="Password"
                secureTextEntry
                value={senha}
                onChangeText={text => setSenha(text)}
                 />

            <Button title= "login" mode="contained" onPress={Login}>
                Entrar
            </Button>

            <TouchableOpacity onPress={() => navigation.navigate('register')}>
                <Text style={{ color: 'blue', marginTop: 20 }}>Nao tem conta? Cadastre-se aqui</Text>
            </TouchableOpacity>

        </View>
    )
}