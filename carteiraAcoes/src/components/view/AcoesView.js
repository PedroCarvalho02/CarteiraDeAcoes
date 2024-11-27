import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Alert,
    TouchableOpacity
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

// tela para exibir as ações
const AcoesView = ({ navigation }) => {
    const { token } = useAuth(); //usa token para autenticacao do contexto
    const [acoes, setAcoes] = useState([
        { id: '1', nome: 'Apple Inc.', simbolo: 'AAPL' },
        { id: '2', nome: 'Microsoft Corporation', simbolo: 'MSFT' },
        // Adicione mais ações conforme necessário
    ]);
    const [precos, setPrecos] = useState({});
    const [saldo, setSaldo] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Função para buscar o saldo
    const fetchSaldo = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('https://hog-chief-visually.ngrok-free.app/saldo', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                setSaldo(data.saldo);
            } else {
                throw new Error(data.error || 'Erro ao obter saldo.');
            }
        } catch (error) {
            console.error('Erro ao obter saldo:', error);
            Alert.alert('Erro', error.message); // Exibe um alerta em caso de erro
        } finally {
            setIsLoading(false); // Finaliza o estado de carregamento
        }
    };

    // Função para buscar os preços das ações
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
                precosMap[item.symbol] = item.c; //Mapeia símbolos para seus preços
            });
            setPrecos(precosMap);
        } catch (error) {
            console.error('Erro ao buscar preços das ações:', error);
            Alert.alert('Erro', error.message);
        }
    };

    // Função para iniciar os dados ao abrir a tela
    const inicializar = async () => {
        await fetchSaldo();
        await fetchPrecos();
    };

 
    // use focus ->  executa os efeitos quando a tela recebe foco
    // useCallback ->  memoriza a função para evitar de recriar cada vez que renderizar
    useFocusEffect(
        useCallback(() => {
            inicializar();
        }, [token])
    );

    // Função para compra de ação
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

    // Renderiza itens da lista de ações
    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <View>
                <Text style={styles.nomeAcao}>{item.nome}</Text>
                <Text style={styles.detalhesAcao}>
                    {item.simbolo} - ${precos[item.simbolo]?.toFixed(2) || 'Carregando...'}
                </Text>
            </View>
            <View style={styles.botoesContainer}>
                <TouchableOpacity style={styles.botaoComprar} onPress={() => handleComprar(item)}>
                    <Text style={styles.textoBotao}>Comprar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.botaoAlerta} onPress={() => handleConfigurarAlerta(item)}>
                    <Text style={styles.textoBotao}>Alerta</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    // Exibe o carregamento enquanto os dados estão sendo buscados
    if (isLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#6200ee" />
                <Text style={styles.loadingText}>Carregando...</Text>
            </View>
        );
    }

    // Renderiza a lista de ações e o saldo
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
        padding: 20,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
    },
    saldo: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2, // Sombra para Android
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
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        justifyContent: 'center',
    },
    botaoAlerta: {
        backgroundColor: '#ff9800',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        justifyContent: 'center',
        marginTop: 5,
    },
    textoBotao: {
        color: '#fff',
        fontSize: 16,
    },
    loadingText: {
        marginTop: 10,
        textAlign: 'center',
        color: '#555',
    },
    botoesContainer: {
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
});

export default AcoesView;