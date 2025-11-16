import React, { useState } from 'react';
import {
View,
Text,
StyleSheet,
ActivityIndicator,
Alert,
ScrollView,
TouchableOpacity,
Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import FundoDegrade from '../components/FundoDegrade';
import Botao from '../components/Botao';
import style from '../style';



export default function Perfil() {
      const navigation = useNavigation();
      const [loading, setLoading] = useState(true);
      const [dadosUsuario, setDadosUsuario] = useState(null);
      
      //  PASSO 1: DECLARAR A FUNÇÃO PRIMEIRO
      const carregarDadosUsuario = async () => {
      try {
      setLoading(true); // ← IMPORTANTE: Mostra loading toda vez

      const user = auth.currentUser;

        if (!user) {
          Alert.alert('Erro', 'Nenhum usuário logado.');
          navigation.navigate('CadastroUsers');
          return;
        }

        const docRef = doc(db, 'motorista', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setDadosUsuario(docSnap.data());
        } else {
          Alert.alert('Erro', 'Dados do usuário não encontrados.');
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        Alert.alert('Erro', 'Não foi possível carregar seus dados.');
      } finally {
        setLoading(false);
      }
  };
  //  PASSO 2: AGORA USAR A FUNÇÃO NO useFocusEffect
  useFocusEffect(
          React.useCallback(() => {
              carregarDadosUsuario(); // ← Agora a função existe!
              }, []) // ← Array vazio porque não depende de nenhuma variável
              );
              // Função para deslogar
              const fazerLogout = () => {
              Alert.alert(
              'Confirmar Logout',
              'Você realmente deseja sair?',
              [
              {text: 'Cancelar', style: 'cancel',
              },
            {
              text: 'Sair', style: 'destructive',
            
              onPress: async () => {
                try {await signOut(auth);
                Alert.alert('Sucesso', 'Você saiu da conta.');
                navigation.navigate('CadastroUsers');
            } catch (error) {
                console.error('Erro ao fazer logout:', error);
                Alert.alert('Erro', 'Não foi possível sair.');
            }
          },
        },
      ]
    );
  };

    // Função para ir para a tela de edição
    const irParaEdicao = () => {
        navigation.navigate('EditarPerfil', { dadosUsuario });
    };
    // Função para ir para a tela de trocar senha
    const irParaTrocarSenha = () => {
        navigation.navigate('TrocarSenha');
    };

  // Se ainda está carregando, mostra o ícone girando
  if (loading) {
  return (
        <FundoDegrade>
        <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: '#fff', marginTop: 10 }}>
        Carregando perfil...
        </Text>
        </View>
        </FundoDegrade>
        );
    }

    // Se não tem dados, mostra mensagem de erro
    if (!dadosUsuario) {
    return (
        <FundoDegrade>
        <View style={styles.container}>
        <Text style={style.texto}>Erro ao carregar dados.</Text>
        <Botao
        label="Voltar"
        onPress={() => navigation.navigate('CadastroUsers')}
        />
        </View>
        </FundoDegrade>
        );
    }
    // Se chegou aqui, tudo certo! Mostra o perfil
    return (
        <FundoDegrade>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
        {/* Cabeçalho com título */}
        <View style={styles.header}>
        <Text style={[style.titulo, styles.titulo]}>Meu Perfil</Text>
        <Text style={styles.subtitulo}>
        Aqui estão suas informações cadastradas
    </Text>
</View>
{/* Card com as informações */}
      <View style={styles.card}>
        {/* Ícone de usuário */}
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={100} color="#FFA85A" />
        </View>

        {/* Informações do usuário */}
        <View style={styles.infoContainer}>
          {/* Nome */}
          <View style={styles.infoItem}>
            <Ionicons name="person" size={24} color="#FFA85A" />
            <View style={styles.infoTexto}>
              <Text style={styles.infoLabel}>Nome Completo</Text>
              <Text style={styles.infoValor}>{dadosUsuario.nome}</Text>
            </View>
          </View>

          {/* E-mail */}
          <View style={styles.infoItem}>
            <Ionicons name="mail" size={24} color="#FFA85A" />
            <View style={styles.infoTexto}>
              <Text style={styles.infoLabel}>E-mail</Text>
              <Text style={styles.infoValor}>{dadosUsuario.email}</Text>
            </View>
          </View>

          {/* Data de nascimento */}
          <View style={styles.infoItem}>
            <Ionicons name="calendar" size={24} color="#FFA85A" />
            <View style={styles.infoTexto}>
              <Text style={styles.infoLabel}>Data de Nascimento</Text>
              <Text style={styles.infoValor}>{dadosUsuario.ano}</Text>
            </View>
          </View>

          {/* Veículo */}
          <View style={styles.infoItem}>
            <Ionicons name="car" size={24} color="#FFA85A" />
            <View style={styles.infoTexto}>
              <Text style={styles.infoLabel}>Veículo</Text>
              <Text style={styles.infoValor}>{dadosUsuario.veiculo}</Text>
            </View>
          </View>
        </View>

        {/* Botões de ação */}
        <View style={styles.botoesContainer}>
          {/* Botão de editar */}
          <TouchableOpacity 
            style={[styles.botaoAcao, styles.botaoEditar]}
            onPress={irParaEdicao}
          >
            <Ionicons name="create" size={20} color="#fff" />
            <Text style={styles.botaoTexto}>Editar Perfil</Text>
          </TouchableOpacity>

          {/* Botão de trocar senha */}
          <TouchableOpacity 
            style={[styles.botaoAcao, styles.botaoSenha]}
            onPress={irParaTrocarSenha}
          >
            <Ionicons name="key" size={20} color="#fff" />
            <Text style={styles.botaoTexto}>Trocar Senha</Text>
          </TouchableOpacity>

          {/* Botão de logout */}
          <TouchableOpacity 
            style={[styles.botaoAcao, styles.botaoLogout]}
            onPress={fazerLogout}
          >
            <Ionicons name="log-out" size={20} color="#fff" />
            <Text style={styles.botaoTexto}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </ScrollView>
</FundoDegrade>
);
}
const styles = StyleSheet.create({
scrollContainer: {
flexGrow: 1,
padding: 20,
},
container: {
flex: 1,
},
loadingContainer: {
flex: 1,
justifyContent: 'center',
alignItems: 'center',
},
header: {
marginBottom: 30,
alignItems: 'center',
},
titulo: {
fontSize: 32,
marginBottom: 10,
},
subtitulo: {
fontSize: 16,
color: '#BDC4D4',
textAlign: 'center',
},
card: {
backgroundColor: 'rgba(15, 26, 44, 0.6)',
borderRadius: 20,
padding: 25,
borderWidth: 1,
borderColor: 'rgba(255, 168, 90, 0.3)',
shadowColor: '#000',
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.3,
shadowRadius: 8,
elevation: 8,
},
avatarContainer: {
alignItems: 'center',
marginBottom: 30,
},
infoContainer: {
marginBottom: 20,
},
infoItem: {
flexDirection: 'row',
alignItems: 'center',
backgroundColor: 'rgba(30, 42, 56, 0.8)',
borderRadius: 12,
padding: 15,
marginBottom: 15,
},
infoTexto: {
marginLeft: 15,
flex: 1,
},
infoLabel: {
fontSize: 12,
color: '#BDC4D4',
marginBottom: 4,
},
infoValor: {
fontSize: 16,
color: '#fff',
fontWeight: '600',
},
botoesContainer: {
marginTop: 10,
},
botaoAcao: {
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'center',
paddingVertical: 14,
borderRadius: 12,
marginBottom: 12,
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.2,
shadowRadius: 4,
elevation: 3,
},
botaoEditar: {
backgroundColor: '#4169E1',
},
botaoSenha: {
backgroundColor: '#9370DB',
},
botaoLogout: {
backgroundColor: '#DC143C',
},
botaoTexto: {
color: '#fff',
fontSize: 16,
fontWeight: 'bold',
marginLeft: 8,
},
botao: {
backgroundColor: '#FFA85A',
paddingVertical: 12,
paddingHorizontal: 32,
borderRadius: 50,
alignItems: 'center',
justifyContent: 'center',
marginTop: 20,

// sombra iOS
shadowColor: '#000',
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.2,
shadowRadius: 6,

// sombra Android
elevation: 4,
},
texto: {
color: '#fff',
fontWeight: 'bold',
fontSize: 16,
},
});

