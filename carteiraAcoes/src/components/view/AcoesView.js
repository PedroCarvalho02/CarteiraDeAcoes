// src/components/view/AcoesView.js

import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

const acoes = [
    { id: '1', nome: 'Empresa A', simbolo: 'EMPA3', preco: 10.50 },
    { id: '2', nome: 'Empresa B', simbolo: 'EMPB3', preco: 15.30 },
    { id: '3', nome: 'Empresa C', simbolo: 'EMPC3', preco: 22.10 },
    // Adicione mais ações até 30
    { id: '4', nome: 'Empresa D', simbolo: 'EMPD3', preco: 18.75 },
    { id: '5', nome: 'Empresa E', simbolo: 'EMPE3', preco: 12.40 },
    { id: '6', nome: 'Empresa F', simbolo: 'EMPF3', preco: 9.60 },
    { id: '7', nome: 'Empresa G', simbolo: 'EMPG3', preco: 14.20 },
    { id: '8', nome: 'Empresa H', simbolo: 'EMPH3', preco: 16.50 },
    { id: '9', nome: 'Empresa I', simbolo: 'EMPI3', preco: 20.00 },
    { id: '10', nome: 'Empresa J', simbolo: 'EMPJ3', preco: 11.30 },
    { id: '11', nome: 'Empresa K', simbolo: 'EMPK3', preco: 19.80 },
    { id: '12', nome: 'Empresa L', simbolo: 'EMPL3', preco: 13.70 },
    { id: '13', nome: 'Empresa M', simbolo: 'EMPM3', preco: 17.25 },
    { id: '14', nome: 'Empresa N', simbolo: 'EMPN3', preco: 21.10 },
    { id: '15', nome: 'Empresa O', simbolo: 'EMPO3', preco: 23.45 },
    { id: '16', nome: 'Empresa P', simbolo: 'EMPP3', preco: 8.90 },
    { id: '17', nome: 'Empresa Q', simbolo: 'EMPQ3', preco: 25.00 },
    { id: '18', nome: 'Empresa R', simbolo: 'EMPR3', preco: 7.50 },
    { id: '19', nome: 'Empresa S', simbolo: 'EMPS3', preco: 26.30 },
    { id: '20', nome: 'Empresa T', simbolo: 'EMPT3', preco: 24.80 },
    { id: '21', nome: 'Empresa U', simbolo: 'EMPU3', preco: 5.60 },
    { id: '22', nome: 'Empresa V', simbolo: 'EMPV3', preco: 29.70 },
    { id: '23', nome: 'Empresa W', simbolo: 'EMPW3', preco: 30.00 },
    { id: '24', nome: 'Empresa X', simbolo: 'EMPX3', preco: 27.50 },
    { id: '25', nome: 'Empresa Y', simbolo: 'EMPY3', preco: 28.10 },
    { id: '26', nome: 'Empresa Z', simbolo: 'EMPZ3', preco: 28.40 },
    { id: '27', nome: 'Empresa AA', simbolo: 'EMPAE3', preco: 19.50 },
    { id: '28', nome: 'Empresa AB', simbolo: 'EMPBA3', preco: 14.80 },
    { id: '29', nome: 'Empresa AC', simbolo: 'EMPCA3', preco: 18.20 },
    { id: '30', nome: 'Empresa AD', simbolo: 'EMPDA3', preco: 16.90 },
];

const AcoesView = () => {

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <View>
                <Text style={styles.nomeAcao}>{item.nome}</Text>
                <Text style={styles.detalhesAcao}>{item.simbolo} - R$ {item.preco.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={styles.botaoComprar}>
                <Text style={styles.textoBotao}>Comprar</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={acoes}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    nomeAcao: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    detalhesAcao: {
        fontSize: 14,
        color: '#555',
    },
    botaoComprar: {
        backgroundColor: '#6200ee',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 5,
    },
    textoBotao: {
        color: '#fff',
        fontSize: 16,
    },
});

export default AcoesView;