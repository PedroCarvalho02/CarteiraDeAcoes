// src/components/view/RentabilidadeView.js

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const RentabilidadeView = () => {
    const { token } = useAuth();
    const [acoes, setAcoes] = useState([]);
    const [precos, setPrecos] = useState({});
    const [rentabilidadeTotal, setRentabilidadeTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            atualizarRentabilidade();
        }, [token])
    );

    const atualizarRentabilidade = async () => {
        setIsLoading(true);
        try {
            await fetchAcoes();
            await fetchPrecos();
            calcularRentabilidade();
        } catch (error) {
            console.error('Erro ao atualizar rentabilidade:', error);
            Alert.alert('Erro', error.message);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const fetchAcoes = async () => {
        try {
            console.log('Buscando ações do usuário...');
            const response = await fetch('https://hog-chief-visually.ngrok-free.app/minhas-acoes', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao obter ações do usuário.');
            }

            const data = await response.json();
            console.log('Ações recebidas:', data.acoes);
            setAcoes(data.acoes);
        } catch (error) {
            console.error('Erro ao buscar ações:', error);
            Alert.alert('Erro', error.message);
            throw error; // Propagar o erro para ser tratado na função chamada
        }
    };

    const fetchPrecos = async () => {
        if (acoes.length === 0) {
            console.log('Nenhuma ação para buscar preços.');
            return;
        }

        const simbolos = acoes.map(acao => acao.simbolo).join(',');
        try {
            console.log(`Buscando preços para símbolos: ${simbolos}`);
            const response = await fetch(`https://hog-chief-visually.ngrok-free.app/stock-prices?symbols=${simbolos}`, {
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao obter preços das ações.');
            }

            const data = await response.json();
            console.log('Preços recebidos:', data);
            const precosMap = {};
            data.forEach(item => {
                precosMap[item.symbol] = item.c;
            });
            setPrecos(precosMap);
        } catch (error) {
            console.error('Erro ao buscar preços:', error);
            Alert.alert('Erro', error.message);
            throw error; // Propagar o erro para ser tratado na função chamada
        }
    };

    const calcularRentabilidade = () => {
        let total = 0;
        acoes.forEach(acao => {
            const precoAtual = precos[acao.simbolo] || 0;
            const lucro = (precoAtual - acao.preco_compra) * acao.quantidade;
            total += lucro;
        });
        setRentabilidadeTotal(total);
        console.log(`Rentabilidade total calculada: R$ ${total.toFixed(2)}`);
    };
    const handleVender = (acao) => {
        Alert.prompt(
            'Vender Ação',
            `Quantas ações de ${acao.simbolo} deseja vender?`,
            async (quantidade) => {
                const qty = parseInt(quantidade);
                if (isNaN(qty) || qty <= 0) {
                    Alert.alert('Erro', 'Por favor, insira uma quantidade válida.');
                    return;
                }
                if (qty > acao.quantidade) {
                    Alert.alert('Erro', 'Você não possui essa quantidade de ações para vender.');
                    return;
                }
    
                try {
                    const response = await fetch('https://hog-chief-visually.ngrok-free.app/vender', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({ simbolo: acao.simbolo, quantidade: qty }),
                    });
    
                    const data = await response.json();
    
                    if (response.ok) {
                        Alert.alert('Sucesso', `Vendida(s) ${qty} ação(ões) de ${acao.simbolo}.`);
                        // Atualizar rentabilidade e saldo
                        await atualizarRentabilidade();
                    } else {
                        Alert.alert('Erro', data.error || 'Não foi possível realizar a venda.');
                    }
                } catch (error) {
                    console.error('Erro ao vender ação:', error);
                    Alert.alert('Erro', 'Ocorreu um erro ao realizar a venda.');
                }
            }
        );
    };

    const renderItem = ({ item }) => {
        const precoAtual = precos[item.simbolo] || 0;
        const rentabilidade = (precoAtual - item.preco_compra) * item.quantidade;
    
        return (
            <View style={styles.itemContainer}>
                <View>
                    <Text style={styles.simbolo}>{item.simbolo}</Text>
                    <Text style={styles.detalhes}>Quantidade: {item.quantidade}</Text>
                    <Text style={styles.detalhes}>Preço Compra: R$ {item.preco_compra.toFixed(2)}</Text>
                    <Text style={styles.detalhes}>Preço Atual: R$ {precoAtual.toFixed(2)}</Text>
                    <Text
                        style={[
                            styles.rentabilidade,
                            rentabilidade >= 0
                                ? styles.rentabilidadePositiva
                                : styles.rentabilidadeNegativa,
                        ]}
                    >
                        Rentabilidade: R$ {rentabilidade.toFixed(2)}
                    </Text>
                </View>
                <TouchableOpacity style={styles.botaoVender} onPress={() => handleVender(item)}>
                    <Text style={styles.textoBotao}>Vender</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        atualizarRentabilidade();
    };

    if (isLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#6200ee" />
                <Text style={styles.loadingText}>Carregando rentabilidade...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Rentabilidade</Text>
            <Text style={styles.total}>
                Rentabilidade Total: R$ {rentabilidadeTotal.toFixed(2)}
            </Text>

            <TouchableOpacity style={styles.botaoAtualizar} onPress={handleRefresh}>
                <Text style={styles.textoBotaoAtualizar}>Atualizar Rentabilidade</Text>
            </TouchableOpacity>

            <FlatList
                data={acoes}
                keyExtractor={(item) => item.id.toString()} // Agora 'id' está definido
                renderItem={renderItem}
                ListEmptyComponent={<Text style={styles.emptyText}>Você não possui ações.</Text>}
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    total: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    botaoAtualizar: {
        backgroundColor: '#6200ee',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        alignSelf: 'center',
        marginBottom: 20,
    },
    botaoVender: {
        backgroundColor: '#dc3545',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    textoBotao: {
        color: '#fff',
        fontSize: 16,
    },
    textoBotaoAtualizar: {
        color: '#fff',
        fontSize: 16,
    },
    itemContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2,
    },
    simbolo: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    detalhes: {
        fontSize: 14,
        color: '#555',
    },
    rentabilidade: {
        fontSize: 16,
        marginTop: 5,
    },
    rentabilidadePositiva: {
        color: '#28a745',
    },
    rentabilidadeNegativa: {
        color: '#dc3545',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#555',
    },
    loadingText: {
        marginTop: 10,
        textAlign: 'center',
        color: '#555',
    },
});

export default RentabilidadeView;