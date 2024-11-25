// src/components/view/AcoesView.js

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const acoes = [
    { id: '1', nome: 'Apple Inc.', simbolo: 'AAPL' },
    { id: '2', nome: 'Microsoft Corporation', simbolo: 'MSFT' },
    { id: '3', nome: 'Amazon.com, Inc.', simbolo: 'AMZN' },
    { id: '4', nome: 'Alphabet Inc.', simbolo: 'GOOGL' },
    { id: '5', nome: 'Meta Platforms, Inc.', simbolo: 'META' },
    { id: '6', nome: 'Tesla, Inc.', simbolo: 'TSLA' },
    { id: '7', nome: 'NVIDIA Corporation', simbolo: 'NVDA' },
    { id: '8', nome: 'Johnson & Johnson', simbolo: 'JNJ' },
    { id: '9', nome: 'Visa Inc.', simbolo: 'V' },
    { id: '10', nome: 'Walmart Inc.', simbolo: 'WMT' },
    { id: '11', nome: 'Procter & Gamble Company', simbolo: 'PG' },
    { id: '12', nome: 'JPMorgan Chase & Co.', simbolo: 'JPM' },
    { id: '13', nome: 'UnitedHealth Group Incorporated', simbolo: 'UNH' },
    { id: '14', nome: 'Home Depot, Inc.', simbolo: 'HD' },
    { id: '15', nome: 'Mastercard Incorporated', simbolo: 'MA' },
    { id: '16', nome: 'Bank of America Corporation', simbolo: 'BAC' },
    { id: '17', nome: 'Walt Disney Company', simbolo: 'DIS' },
    { id: '18', nome: 'PayPal Holdings, Inc.', simbolo: 'PYPL' },
    { id: '19', nome: 'Intel Corporation', simbolo: 'INTC' },
    { id: '20', nome: 'Netflix, Inc.', simbolo: 'NFLX' },
    { id: '21', nome: 'Cisco Systems, Inc.', simbolo: 'CSCO' },
    { id: '22', nome: 'PepsiCo, Inc.', simbolo: 'PEP' },
    { id: '23', nome: 'Coca-Cola Company', simbolo: 'KO' },
    { id: '24', nome: 'Adobe Inc.', simbolo: 'ADBE' },
    { id: '25', nome: 'Oracle Corporation', simbolo: 'ORCL' },
    { id: '26', nome: 'Salesforce.com, Inc.', simbolo: 'CRM' },
    { id: '27', nome: 'Broadcom Inc.', simbolo: 'AVGO' },
    { id: '28', nome: 'Qualcomm Incorporated', simbolo: 'QCOM' },
];

const AcoesView = () => {
    const { token } = useAuth();
    const [saldo, setSaldo] = useState(0);
    const [precos, setPrecos] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSaldo = async () => {
            try {
                if (!token) {
                    console.warn('Token não disponível.');
                    setIsLoading(false);
                    return;
                }

                console.log('Token:', token);
                const response = await fetch('https://hog-chief-visually.ngrok-free.app/saldo', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                console.log('Status da resposta:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Erro na resposta:', errorText);
                    Alert.alert('Erro', 'Não foi possível obter o saldo.');
                    setIsLoading(false);
                    return;
                }

                const data = await response.json();
                setSaldo(data.saldo);
            } catch (error) {
                console.error('Erro ao obter saldo:', error);
                Alert.alert('Erro', 'Ocorreu um erro ao obter o saldo.');
            } finally {
                setIsLoading(false);
            }
        };

        const fetchPrecos = async () => {
            if (!token) {
                console.warn('Token não disponível para buscar preços.');
                return;
            }

            const symbols = acoes.map(acao => acao.simbolo).join(',');
            try {
                const response = await fetch(`https://hog-chief-visually.ngrok-free.app/stock-prices?symbols=${symbols}`, {
                    headers: {
                        'Accept': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Erro HTTP! status: ${response.status}`);
                }

                const contentType = response.headers.get('Content-Type');
                if (!contentType || !contentType.includes('application/json')) {
                    const text = await response.text();
                    console.error('Resposta inesperada da API:', text);
                    throw new TypeError("Esperava JSON, mas recebeu " + contentType);
                }

                const data = await response.json();
                const precosMap = {};
                data.forEach(item => {
                    precosMap[item.symbol] = item.c;
                });
                setPrecos(precosMap);
            } catch (error) {
                console.error('Erro ao buscar preços das ações:', error);
                Alert.alert('Erro', 'Não foi possível obter os preços das ações.');
            }
        };

        fetchSaldo();
        fetchPrecos();
    }, [token]);

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <View>
                <Text style={styles.nomeAcao}>{item.nome}</Text>
                <Text style={styles.detalhesAcao}>
                    {item.simbolo} - ${precos[item.simbolo]?.toFixed(2) || 'Carregando...'}
                </Text>
            </View>
            <TouchableOpacity style={styles.botaoComprar}>
                <Text style={styles.textoBotao}>Comprar</Text>
            </TouchableOpacity>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.container}>
                <Text style={styles.saldo}>Carregando saldo...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.saldo}>Saldo atual: R$ {saldo.toFixed(2)}</Text>
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
        paddingTop: 10,
    },
    saldo: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
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