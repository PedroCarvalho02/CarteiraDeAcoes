// src/components/view/AcoesView.js

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';

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

                const response = await fetch('https://hog-chief-visually.ngrok-free.app/saldo', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Erro ao obter saldo.');
                }

                const data = await response.json();
                setSaldo(data.saldo);
            } catch (error) {
                console.error('Erro ao obter saldo:', error);
                Alert.alert('Erro', 'Não foi possível obter o saldo.');
            }
        };

        const fetchPrecos = async () => {
            try {
                const symbols = acoes.map(acao => acao.simbolo).join(',');
                const response = await fetch(`https://hog-chief-visually.ngrok-free.app/stock-prices?symbols=${symbols}`, {
                    headers: {
                        'Accept': 'application/json',
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Erro ao obter preços das ações.');
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

        const inicializar = async () => {
            await fetchSaldo();
            await fetchPrecos();
            setIsLoading(false);
        };

        inicializar();
    }, [token]);

    const acoes = [
        { id: '1', nome: 'Apple Inc.', simbolo: 'AAPL' },
        { id: '2', nome: 'Microsoft Corporation', simbolo: 'MSFT' },
        // ... outras ações
    ];

    const handleComprar = async (acao) => {
        Alert.prompt(
            'Comprar Ação',
            `Quantas ações de ${acao.nome} (${acao.simbolo}) deseja comprar?`,
            async (quantidade) => {
                const qty = parseInt(quantidade);
                if (isNaN(qty) || qty <= 0) {
                    Alert.alert('Erro', 'Por favor, insira uma quantidade válida.');
                    return;
                }

                try {
                    const response = await fetch('https://hog-chief-visually.ngrok-free.app/comprar', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({ simbolo: acao.simbolo, quantidade: qty }),
                    });

                    const data = await response.json();

                    if (response.ok) {
                        Alert.alert('Sucesso', `Comprada(s) ${qty} ação(ões) de ${acao.nome}.`);
                        // Atualizar saldo após compra
                        setSaldo(data.saldo);
                    } else {
                        Alert.alert('Erro', data.error || 'Não foi possível realizar a compra.');
                    }
                } catch (error) {
                    console.error('Erro ao comprar ação:', error);
                    Alert.alert('Erro', 'Ocorreu um erro ao realizar a compra.');
                }
            }
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <View>
                <Text style={styles.nomeAcao}>{item.nome}</Text>
                <Text style={styles.detalhesAcao}>
                    {item.simbolo} - ${precos[item.simbolo]?.toFixed(2) || 'Carregando...'}
                </Text>
            </View>
            <TouchableOpacity style={styles.botaoComprar} onPress={() => handleComprar(item)}>
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
        paddingHorizontal: 20,
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