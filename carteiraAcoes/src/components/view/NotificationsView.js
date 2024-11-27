import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const NotificationsView = () => {
    const { alerts, fetchAlerts, deleteAlert } = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadAlerts = async () => {
            try {
                await fetchAlerts();
            } catch (error) {
                Alert.alert('Erro', 'Não foi possível carregar alertas.');
            } finally {
                setIsLoading(false);
            }
        };
        loadAlerts();
    }, []);

    const handleDelete = async (id) => {
        try {
            await deleteAlert(id);
            Alert.alert('Sucesso', 'Alerta removido com sucesso!');
        } catch (error) {
            Alert.alert('Erro', error.message);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.alertItem}>
            <View>
                <Text style={styles.simbolo}>{item.simbolo}</Text>
                <Text style={styles.precoAlvo}>Preço Alvo: R$ {item.target_price.toFixed(2)}</Text>
                <Text style={styles.status}>
                    Status: {item.triggered ? 'Disparado' : 'Ativo'}
                </Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={styles.deletar}>Deletar</Text>
            </TouchableOpacity>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#6200ee" />
                <Text style={styles.loadingText}>Carregando alertas...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={alerts}
                keyExtractor={(item) => item.id ? item.id.toString() : `${item.simbolo}_${item.target_price}`}                renderItem={renderItem}
                ListEmptyComponent={<Text style={styles.emptyText}>Você não possui alertas.</Text>}
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
    alertItem: {
        backgroundColor: '#fff',
        padding: 15,
        marginBottom: 10,
        borderRadius: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    simbolo: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    precoAlvo: {
        fontSize: 16,
        color: '#555',
    },
    status: {
        fontSize: 14,
        color: '#777',
    },
    deletar: {
        color: '#ff0000',
        fontWeight: 'bold',
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
});

export default NotificationsView;