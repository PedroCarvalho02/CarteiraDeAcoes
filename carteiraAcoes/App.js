
import MenuNavigator from './src/components/Menu/MenuNavigator';
import { AuthProvider } from './context/AuthContext.js';

export default function App() {
  return (
    <AuthProvider>
        <MenuNavigator />
    </AuthProvider>
  );
}


