// src/components/Menu/MenuNavigator.js

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeView from '../view/HomeView';
import AcoesView from '../view/AcoesView';
import DepositoView from '../view/DepositoView';
import SaqueView from '../view/SaqueView';
import RentabilidadeView from '../view/RentabilidadeView';
import AuthView from '../view/AuthView';
import { useAuth } from '../../context/AuthContext'; 

const Drawer = createDrawerNavigator();

const MenuNavigator = () => {
    const { autenticado, logout } = useAuth(); 

    return (
        <NavigationContainer>
            <Drawer.Navigator initialRouteName={autenticado ? "home" : "login"}>
                {autenticado ? (
                    <>
                        <Drawer.Screen name="home" component={HomeView} options={{ headerTitle: "" }} />
                        <Drawer.Screen name="acoes" component={AcoesView} options={{ headerTitle: "" }} />
                        <Drawer.Screen name="deposito" component={DepositoView} options={{ headerTitle: "" }} />
                        <Drawer.Screen name="saque" component={SaqueView} options={{ headerTitle: "" }} />
                        <Drawer.Screen name="rentabilidade" component={RentabilidadeView} options={{ headerTitle: "" }} />
                        <Drawer.Screen
                            name="logout"
                            options={{
                                headerTitle: "Logout",
                                drawerLabel: 'Sair',
                            }}
                            component={() => {
                                logout();
                                return null;
                            }}
                        />
                    </>
                ) : (
                    <Drawer.Screen name="login" component={AuthView} options={{ headerShown: false }} />
                )}
            </Drawer.Navigator>
        </NavigationContainer>
    );
};

export default MenuNavigator;