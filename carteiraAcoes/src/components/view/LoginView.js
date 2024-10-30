import { View, Text, StyleSheet } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { useState } from "react";
import { TouchableOpacity } from "react-native";


export default LoginView = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    const Login = async () => {
        try {
            const response = await fetch('https://84e6-2804-14c-fc81-94aa-ed7e-2c1c-c7b1-7b38.ngrok-free.app/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, senha }),
            });
            const data = await response.json();
            alert(data.message);
            navigation.navigate('home');
        } catch (error) {
            alert('Erro ao logar: ' + error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>LOGIN</Text>

            <TextInput
                label="Email"
                value={email}
                onChangeText={text => setEmail(text)}
                style={styles.input}
                mode="outlined"
                theme={{ colors: { primary: '#6200ee' } }}
            />
            <TextInput
                label="Password"
                secureTextEntry
                value={senha}
                onChangeText={text => setSenha(text)}
                style={styles.input}
                mode="outlined"
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

            <TouchableOpacity onPress={() => navigation.navigate('register')}>
                <Text style={styles.link}>Não tem conta? Cadastre-se aqui</Text>
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
    link: {
        color: '#6200ee',
        marginTop: 20,
        fontSize: 16,
    },
});
