import { createDrawerNavigator } from "@react-navigation/drawer"
import { NavigationContainer } from "@react-navigation/native";
import LoginView from "../view/LoginView";
import HomeView from "../view/HomeView";
import AcoesView from "../view/AcoesView";
import DepositoView from "../view/DepositoView";
import SaqueView from "../view/SaqueView";


const Drawer = createDrawerNavigator();

export default MenuNavigator = () =>
{
    return (
        <NavigationContainer>
            <Drawer.Navigator initialRouteName="homse">
                <Drawer.Screen name="login" component={LoginView} 
                options={{headerTitle: ""}}/>
                <Drawer.Screen name="home" component={HomeView} 
                options={{headerTitle: ""}}/>
                <Drawer.Screen name="acoes" component={AcoesView} 
                options={{headerTitle: ""}}/>
                 <Drawer.Screen name="deposito" component={DepositoView} 
                options={{headerTitle: ""}}/>
                 <Drawer.Screen name="saque" component={SaqueView} 
                options={{headerTitle: ""}}/>
            </Drawer.Navigator>
        </NavigationContainer>

    )
}