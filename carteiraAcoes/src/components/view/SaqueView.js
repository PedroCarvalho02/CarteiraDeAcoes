import { View,Text } from "react-native"
import React, { useState } from 'react';
import { TextInput, Button, StyleSheet } from 'react-native';

export default SaqueView = () =>{

    const [withdrawValue, setWithdrawValue] = useState(0);

const handleWithdraw = (e) => {
    e.preventDefault();
    
    console.log(`Valor sacado: ${withdrawValue}`);
};
    return(
        <View style={styles.form}>
        <Text style={styles.label}>Valor do Saque:</Text>
        <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={String(withdrawValue)}
            onChangeText={text => setWithdrawValue(Number(text))}
            required
        />
        <Button title="Sacar" onPress={handleWithdraw} />
    </View>
    )
}




const styles = StyleSheet.create({
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