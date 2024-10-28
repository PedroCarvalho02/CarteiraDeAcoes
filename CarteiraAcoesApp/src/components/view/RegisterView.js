import { useState } from "react"
import {View, Button, Text, TextInput } from "react-native-paper";
import axios from "axios";


const RegisterView = ({ navigation }) =>{

    const[email,setEmail] = useState('');
    const[senha,setSenha] = useState('');

    const Register= async () =>{
        try {
            const response = await axios.post('http://localhost:3000/register', { email, password });
      alert(response.data.message);
      navigation.navigate('Login')
        } catch (error) {
            alert('Erro ao registrar: ' + error.response.data.error);
        }
    }

    return (
        <View>
          <Text>Register</Text>
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
             placeholder="digite uma senha"
          />
          <Button title="registrar" onPress={Register} />
        </View>
      );
    };

    export default RegisterView;