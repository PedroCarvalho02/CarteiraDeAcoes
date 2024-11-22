// App.js

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AuthView from './src/components/view/AuthView';
import MenuNavigator from './src/components/Menu/MenuNavigator';

const Stack = createStackNavigator();

const linking = {
  prefixes: ['meuapp://'],
  config: {
    screens: {
      login: 'login',
      home: 'home',
      acoes: 'acoes',
      deposito: 'deposito',
      saque: 'saque',
      rentabilidade: 'rentabilidade',
      logout: 'logout',
      // Adicione outras rotas conforme necessário
    },
  },
};

const RootNavigator = () => {
  const { autenticado } = useAuth();

  return (
    <NavigationContainer linking={linking}>
      {autenticado ? (
        <MenuNavigator />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" component={AuthView} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}