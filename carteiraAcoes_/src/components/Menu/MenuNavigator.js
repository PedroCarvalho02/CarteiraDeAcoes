import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import LoginView from "../view/LoginView";
import HomeView from "../view/HomeView";
import AcoesView from "../view/AcoesView";
import DepositoView from "../view/DepositoView";
import SaqueView from "../view/SaqueView";
import RentabilidadeView from "../view/RentabilidadeView"
import RegistroView from "../view/RegistroView";



const Stack = createStackNavigator();

export default MenuNavigator = () =>
{
    return (
            <Stack.Navigator initialRouteName="login">
                <Stack.Screen name="login" component={LoginView} 
                options={{headerTitle: ""}}/>
                <Stack.Screen name="register" component={RegistroView} 
                 options={{headerTitle: ""}} />
                <Stack.Screen name="home" component={HomeView} 
                options={{headerTitle: ""}}/>
                <Stack.Screen name="acoes" component={AcoesView} 
                options={{headerTitle: ""}}/>
                 <Stack.Screen name="deposito" component={DepositoView} 
                options={{headerTitle: ""}}/>
                 <Stack.Screen name="saque" component={SaqueView} 
                options={{headerTitle: ""}}/>
                 <Stack.Screen name="rentabilidade" component={RentabilidadeView} 
                options={{headerTitle: ""}}/>
            </Stack.Navigator>

    )
}