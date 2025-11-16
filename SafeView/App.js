import Routes from './src/rotas/routes';
import { AuthProvider } from './src/context/authProvider';

export default function App() {  
  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
}
