// src/components/Menu/MenuNavigator.js

import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeView from '../view/HomeView';
import AcoesView from '../view/AcoesView';
import DepositoView from '../view/DepositoView';
import SaqueView from '../view/SaqueView';
import RentabilidadeView from '../view/RentabilidadeView';
import Logout from '../view/Logout';

const Drawer = createDrawerNavigator();

const MenuNavigator = () => {
    return (
        <Drawer.Navigator initialRouteName="home">
            <Drawer.Screen
                name="home"
                component={HomeView}
                options={{ headerTitle: 'Home' }}
            />
            <Drawer.Screen
                name="acoes"
                component={AcoesView}
                options={{ headerTitle: 'Ações' }}
            />
            <Drawer.Screen
                name="deposito"
                component={DepositoView}
                options={{ headerTitle: 'Depósito' }}
            />
            <Drawer.Screen
                name="saque"
                component={SaqueView}
                options={{ headerTitle: 'Saque' }}
            />
            <Drawer.Screen
                name="rentabilidade"
                component={RentabilidadeView}
                options={{ headerTitle: 'Rentabilidade' }}
            />
            <Drawer.Screen
                name="logout"
                component={Logout}
                options={{
                    headerTitle: 'Logout',
                    drawerLabel: 'Sair',
                }}
            />
        </Drawer.Navigator>
    );
};

export default MenuNavigator;