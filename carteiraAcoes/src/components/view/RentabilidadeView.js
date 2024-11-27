import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    Modal,
    TextInput,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

const RentabilidadeView = () => {
    const { token, createAlert, fetchAlerts } = useAuth();
    const [acoes, setAcoes] = useState([]);
    const [precos, setPrecos] = useState({});
    const [rentabilidadeTotal, setRentabilidadeTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [alertModalVisible, setAlertModalVisible] = useState(false);
    const [vendaModalVisible, setVendaModalVisible] = useState(false);
    const [selectedAcao, setSelectedAcao] = useState(null);
    const [targetPrice, setTargetPrice] = useState('');
    const [quantidadeVenda, setQuantidadeVenda] = useState('');

    // Hook de atualizar rentabilidade ao abrir tela
    useFocusEffect(
        useCallback(() => {
            atualizarRentabilidade();
        }, [token])
    );

 // Função para atualizar a rentabilidade das ações
    const atualizarRentabilidade = async () => {
        setIsLoading(true);
        try {
            await fetchAcoes();
            await fetchPrecos();
            calcularRentabilidade();
        } catch (error) {
            console.error('Erro ao atualizar rentabilidade:', error);
            Alert.alert('Erro', 'Não foi possível atualizar a rentabilidade.');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

// Função para buscar as ações do usuário
    const fetchAcoes = async () => {
        try {
            const response = await fetch('https://hog-chief-visually.ngrok-free.app/minhas-acoes', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                setAcoes(data.acoes);
            } else {
                throw new Error(data.error || 'Erro ao obter ações do usuário.');
            }
        } catch (error) {
            console.error('Erro ao buscar ações:', error);
            Alert.alert('Erro', error.message);
        }
    };

// Função para buscar os preços atuais das ações
    const fetchPrecos = async () => {
        try {
            if (acoes.length === 0) return;
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
            console.error('Erro ao buscar preços:', error);
            Alert.alert('Erro', error.message);
        }
    };

// Função para calcular a rentabilidade total 
    const calcularRentabilidade = () => {
        let total = 0;
        acoes.forEach(acao => {
            const precoAtual = precos[acao.simbolo] || 0;
            const lucro = (precoAtual - acao.preco_compra) * acao.quantidade;
            total += lucro;
        });
        setRentabilidadeTotal(total);
    };

// Função para abrir o modal de alerta
    const openAlertModal = (acao) => {
        setSelectedAcao(acao);
        setAlertModalVisible(true);
    };

    const closeAlertModal = () => {
        setSelectedAcao(null);
        setTargetPrice('');
        setAlertModalVisible(false);
    };

    const openVendaModal = (acao) => {
        setSelectedAcao(acao);
        setQuantidadeVenda('');
        setVendaModalVisible(true);
    };

    const closeVendaModal = () => {
        setSelectedAcao(null);
        setQuantidadeVenda('');
        setVendaModalVisible(false);
    };

 // Função para salvar um alerta 
    const saveAlert = async () => {
        if (!targetPrice || isNaN(parseFloat(targetPrice)) || parseFloat(targetPrice) <= 0) {
            Alert.alert('Erro', 'Por favor, insira um preço-alvo válido.');
            return;
        }
        try {
            await createAlert(selectedAcao.simbolo, parseFloat(targetPrice));
            Alert.alert('Sucesso', 'Alerta criado com sucesso!');
            fetchAlerts();
            closeAlertModal();
        } catch (error) {
            Alert.alert('Erro', error.message);
        }
    };

// Função para processar a venda de ações
    const handleVender = async () => {
        const quantidade = parseInt(quantidadeVenda);
        if (isNaN(quantidade) || quantidade <= 0) {
            Alert.alert('Erro', 'Por favor, insira uma quantidade válida.');
            return;
        }

        try {
            const response = await fetch('https://hog-chief-visually.ngrok-free.app/vender', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    simbolo: selectedAcao.simbolo,
                    quantidade: quantidade,
                }),
            });
            const data = await response.json();
            if (response.ok) {
                Alert.alert('Sucesso', data.message);
                atualizarRentabilidade();
                closeVendaModal();
            } else {
                throw new Error(data.error || 'Erro ao vender ações.');
            }
        } catch (error) {
            console.error('Erro ao vender ações:', error);
            Alert.alert('Erro', error.message);
        }
    };

    const renderItem = ({ item }) => {
        const precoAtual = precos[item.simbolo] || 0;
        const rentabilidade = (precoAtual - item.preco_compra) * item.quantidade;
        return (
            <View style={styles.itemContainer}>
                <View>
                    <Text style={styles.nomeAcao}>{item.simbolo} - {item.nome}</Text>
                    <Text style={styles.detalhesAcao}>Preço Atual: R$ {precoAtual.toFixed(2)}</Text>
                    <Text style={styles.detalhesAcao}>Quantidade: {item.quantidade}</Text>
                    <Text style={styles.rentabilidade}>
                        Rentabilidade: R$ {rentabilidade.toFixed(2)}
                    </Text>
                </View>
                <View style={styles.botoesContainer}>
                    <TouchableOpacity style={styles.botaoAlerta} onPress={() => openAlertModal(item)}>
                        <Text style={styles.textoBotao}>Definir Alerta</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.botaoVender} onPress={() => openVendaModal(item)}>
                        <Text style={styles.textoBotao}>Vender</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
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

            <FlatList
                data={acoes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                ListEmptyComponent={<Text style={styles.emptyText}>Você não possui ações.</Text>}
                refreshing={isRefreshing}
                onRefresh={atualizarRentabilidade}
            />
            <Modal
                animationType="slide"
                transparent={true}
                visible={alertModalVisible}
                onRequestClose={closeAlertModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Definir Alerta para {selectedAcao?.simbolo}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Preço Alvo (R$)"
                            keyboardType="numeric"
                            value={targetPrice}
                            onChangeText={setTargetPrice}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.botaoSalvar} onPress={saveAlert}>
                                <Text style={styles.textoBotao}>Salvar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.botaoCancelar} onPress={closeAlertModal}>
                                <Text style={styles.textoBotao}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={vendaModalVisible}
                onRequestClose={closeVendaModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Vender {selectedAcao?.simbolo}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Quantidade"
                            keyboardType="numeric"
                            value={quantidadeVenda}
                            onChangeText={setQuantidadeVenda}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.botaoSalvar} onPress={handleVender}>
                                <Text style={styles.textoBotao}>Vender</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.botaoCancelar} onPress={closeVendaModal}>
                                <Text style={styles.textoBotao}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        marginBottom: 10,
    },
    total: {
        fontSize: 18,
        marginBottom: 20,
    },
    itemContainer: {
        backgroundColor: '#fff',
        padding: 15,
        marginBottom: 10,
        borderRadius: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    botoesContainer: {
        flexDirection: 'column',
    },
    nomeAcao: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    detalhesAcao: {
        fontSize: 16,
        color: '#555',
    },
    rentabilidade: {
        fontSize: 16,
        color: '#008000',
    },
    botaoAlerta: {
        backgroundColor: '#6200ee',
        padding: 10,
        borderRadius: 5,
        marginBottom: 5,
    },
    botaoVender: {
        backgroundColor: '#ff3b30',
        padding: 10,
        borderRadius: 5,
    },
    textoBotao: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    loadingText: {
        marginTop: 10,
        textAlign: 'center',
        color: '#555',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#555',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        margin: 20,
        padding: 20,
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        borderBottomWidth: 1,
        borderColor: '#ccc',
        marginBottom: 20,
        paddingVertical: 5,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    botaoSalvar: {
        backgroundColor: '#6200ee',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginRight: 5,
    },
    botaoCancelar: {
        backgroundColor: '#aaa',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginLeft: 5,
    },
});

export default RentabilidadeView;