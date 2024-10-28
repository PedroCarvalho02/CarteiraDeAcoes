import { View, Text,Button } from "react-native"
import { TextInput } from "react-native-paper"



export default LoginView = () => {


    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    const Login = async () => {
        try {
            const response = await axios.post('http://localhost:3000/login', { email, password });
            alert(response.data.message);
        } catch (error) {
            alert('Erro ao logar: ' + error.response.data.error);
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
                right={<TextInput.Icon icon="eye" />} />

            <Button mode="contained" onPress={Login}>
                Entrar
            </Button>

            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={{ color: 'blue', marginTop: 20 }}>Nao tem conta? Cadastre-se aqui</Text>
            </TouchableOpacity>

        </View>
    )
}