// App.js

import MenuNavigator from './src/components/Menu/MenuNavigator';
import { AuthProvider } from './src/context/AuthContext.js'; // Caminho corrigido

export default function App() {
  return (
    <AuthProvider>
        <MenuNavigator />
    </AuthProvider>
  );
}