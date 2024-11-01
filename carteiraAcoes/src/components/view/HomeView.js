import { StyleSheet, View, Text } from "react-native";

export default HomeView = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bem-vindo à sua Carteira de Ações!</Text>
            <Text style={styles.description}>Acesse o menu ao lado para ver as funcionalidades.</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f7f7', // Alterado para um tom de fundo mais suave
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#6200ee', // Cor principal
        marginBottom: 10,
        textAlign: 'center', // Centraliza o texto
    },
    description: {
        fontSize: 16,
        color: '#333', // Cor do texto mais escura para contraste
        textAlign: 'center', // Centraliza o texto
    },
});
