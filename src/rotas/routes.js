import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Telas de autenticação e inicial
import Loading from '../telas/Loading';
import Login from '../telas/LoginUser';
import TelaInicial from '../telas/TelaInicial';

// Telas de cadastro
import CadastroUsers from '../telas/CadastroUsers';
import CadastroUsers2 from '../telas/CadastroUsers2';

// Telas de perfil
import Perfil from '../telas/Perfil';
import EditarPerfil from '../telas/EditarPerfil';
import TrocarSenha from '../telas/TrocarSenha';

import Configuracoes from '../telas/Configuracoes';

const Stack = createStackNavigator();

export default function Routes() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Loading" //  Começa no Loading
        screenOptions={{
          headerShown: false, 
          animationEnabled: true, 
          animation: 'slide_from_right',
        }}
      >
        {/* Tela de carregamento */}
        <Stack.Screen 
          name="Loading" 
          component={Loading} 
        />

        {/* Autenticação */}
        <Stack.Screen 
          name="Login" 
          component={Login} 
        />

        {/* Tela principal */}
        <Stack.Screen 
          name="TelaInicial" 
          component={TelaInicial} 
        />

        {/* Cadastro */}
        <Stack.Screen 
          name="CadastroUsers" 
          component={CadastroUsers} 
          options={{ title: 'Cadastre-se Aqui!!' }}
        />
        <Stack.Screen 
          name="CadastroUsers2" 
          component={CadastroUsers2} 
          options={{ title: 'Finalize seu Cadastro!' }}
        />

        {/* Perfil */}
        <Stack.Screen 
          name="Perfil" 
          component={Perfil} 
          options={{ title: 'Meu Perfil' }}
        />
        <Stack.Screen 
          name="EditarPerfil" 
          component={EditarPerfil} 
          options={{ title: 'Editar Perfil' }}
        />
        <Stack.Screen 
          name="TrocarSenha" 
          component={TrocarSenha} 
          options={{ title: 'Trocar Senha' }}
        />
        <Stack.Screen 
          name="Configuracoes" 
          component={Configuracoes} 
          options={{ title: 'Configurações' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}