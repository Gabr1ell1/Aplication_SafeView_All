import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { auth, db } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

import FundoDegrade from '../components/FundoDegrade';
import MenuModal from '../components/MenuModal';

export default function Perfil() {
  const navigation = useNavigation();
  
  const [loading, setLoading] = useState(true);
  const [dadosUsuario, setDadosUsuario] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [modalGerenciarVisible, setModalGerenciarVisible] = useState(false);
  const [tamanhoSenha, setTamanhoSenha] = useState(8); // ✅ NOVO: armazena tamanho da senha

  const carregarDadosUsuario = async () => {
    try {
      setLoading(true);
      
      const user = auth.currentUser;

      if (!user) {
        Alert.alert('Erro', 'Nenhum usuário logado.');
        navigation.navigate('Login');
        return;
      }

      const docRef = doc(db, 'motorista', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const dados = docSnap.data();
        setDadosUsuario(dados);
        
        //  NOVO: Pega o tamanho da senha armazenada (se existir)
        if (dados.tamanhoSenha) {
          setTamanhoSenha(dados.tamanhoSenha);
        }
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

  useFocusEffect(
    React.useCallback(() => {
      carregarDadosUsuario();
    }, [])
  );

  const pedirPermissaoGaleria = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permissão negada',
        'Precisamos de acesso à galeria para você escolher uma foto de perfil.'
      );
      return false;
    }
    return true;
  };

  const converterParaBase64 = async (uri) => {
    try {
      const imagemComprimida = await manipulateAsync(
        uri,
        [{ resize: { width: 300 } }],
        {
          compress: 0.5,
          format: SaveFormat.JPEG,
          base64: true,
        }
      );

      return `data:image/jpeg;base64,${imagemComprimida.base64}`;
    } catch (error) {
      console.error('Erro ao converter imagem:', error);
      throw error;
    }
  };

  const escolherFotoDaGaleria = async () => {
    try {
      const temPermissao = await pedirPermissaoGaleria();
      if (!temPermissao) return;

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (resultado.canceled) {
        console.log('Usuário cancelou');
        return;
      }

      const imagemUri = resultado.assets[0].uri;
      await salvarFotoBase64(imagemUri);

    } catch (error) {
      console.error('Erro ao escolher foto:', error);
      Alert.alert('Erro', 'Não foi possível escolher a foto.');
    }
  };

  const salvarFotoBase64 = async (imagemUri) => {
    try {
      setUploadingFoto(true);

      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        return;
      }

      const imagemBase64 = await converterParaBase64(imagemUri);

      if (imagemBase64.length > 900000) {
        Alert.alert(
          'Imagem muito grande',
          'Por favor, escolha uma imagem menor ou tire uma foto nova.'
        );
        return;
      }

      await updateDoc(doc(db, 'motorista', user.uid), {
        fotoPerfil: imagemBase64,
        atualizadoEm: new Date(),
      });

      setDadosUsuario({
        ...dadosUsuario,
        fotoPerfil: imagemBase64,
      });

      Alert.alert('Sucesso', 'Foto de perfil atualizada!');
      
    } catch (error) {
      console.error('Erro ao salvar foto:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a foto.');
    } finally {
      setUploadingFoto(false);
    }
  };

  const fazerLogout = () => {
    Alert.alert('Confirmar Logout', 'Você realmente deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
            Alert.alert('Sucesso', 'Você saiu da conta.');
            navigation.navigate('Login');
          } catch (error) {
            console.error('Erro ao fazer logout:', error);
            Alert.alert('Erro', 'Não foi possível sair.');
          }
        },
      },
    ]);
  };

  const irParaEditarPerfil = () => {
    setModalGerenciarVisible(false);
    navigation.navigate('EditarPerfil', { dadosUsuario });
  };

  const irParaTrocarSenha = () => {
    setModalGerenciarVisible(false);
    navigation.navigate('TrocarSenha');
  };

  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return '—';
    
    const [dia, mes, ano] = dataNascimento.split('/').map(Number);
    const hoje = new Date();
    const nascimento = new Date(ano, mes - 1, dia);
    
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesDiff = hoje.getMonth() - nascimento.getMonth();
    
    if (mesDiff < 0 || (mesDiff === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    
    return idade;
  };

  const mascararEmail = (email) => {
    if (!email) return '';
    const [nome, dominio] = email.split('@');
    const nomeVisivel = nome.substring(0, 1);
    const mascarado = '*'.repeat(6);
    return `${nomeVisivel}${mascarado}@${dominio}`;
  };

  // ✅ NOVO: Função para gerar asteriscos de acordo com o tamanho da senha
  const gerarAsteriscosSenha = () => {
    return '*'.repeat(tamanhoSenha);
  };

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

  if (!dadosUsuario) {
    return (
      <FundoDegrade>
        <View style={styles.container}>
          <Text style={styles.texto}>Erro ao carregar dados.</Text>
        </View>
      </FundoDegrade>
    );
  }

  return (
    <FundoDegrade style={['#2C3E50', '#1A2332']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Text style={styles.titulo}>Meu perfil</Text>

          <View style={styles.card}>
            {/* LADO ESQUERDO - Foto + Nome */}
            <View style={styles.ladoEsquerdo}>
              <View style={styles.avatarContainer}>
                {dadosUsuario.fotoPerfil ? (
                  <Image 
                    source={{ uri: dadosUsuario.fotoPerfil }} 
                    style={styles.fotoPerfil}
                  />
                ) : (
                  <View style={styles.fotoPlaceholder}>
                    <Ionicons name="person" size={80} color="#9CA3AF" />
                  </View>
                )}

                <TouchableOpacity 
                  style={styles.botaoCamera}
                  onPress={escolherFotoDaGaleria}
                  disabled={uploadingFoto}
                >
                  {uploadingFoto ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="pencil" size={18} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>

              <Text style={styles.nomeUsuario}>{dadosUsuario.nome}</Text>
            </View>

            {/* LADO DIREITO - Informações */}
            <View style={styles.ladoDireito}>
              <Text style={styles.infoTexto}>
                <Text style={styles.infoLabel}>Idade:</Text> {calcularIdade(dadosUsuario.ano)} anos
              </Text>
              
              <Text style={styles.infoTexto}>
                <Text style={styles.infoLabel}>E-mail cadastrado:</Text> {mascararEmail(dadosUsuario.email)}
              </Text>
              
              {/* SENHA COM ASTERISCOS CORRETOS */}
              <Text style={styles.infoTexto}>
                <Text style={styles.infoLabel}>Senha:</Text> {gerarAsteriscosSenha()}
              </Text>

              <Text style={styles.secaoTitulo}>Informações do veículo:</Text>
              
              <Text style={styles.infoTexto}>
                <Text style={styles.infoLabel}>Marca-Modelo:</Text> {dadosUsuario.veiculo}
              </Text>
            </View>

            {/* BOTÕES DENTRO DO CARD */}
            <View style={styles.botoesCard}>
              <TouchableOpacity 
                style={styles.botaoLogout}
                onPress={fazerLogout}
              >
                <Text style={styles.botaoLogoutTexto}>Logout</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.botaoGerenciar}
                onPress={() => setModalGerenciarVisible(true)}
              >
                <Text style={styles.botaoGerenciarTexto}>Gerenciar perfil</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* BOTÃO MENU FIXO */}
      <TouchableOpacity 
        style={styles.botaoMenuFixo}
        onPress={() => setMenuVisible(true)}
      >
        <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
      </TouchableOpacity>

      {/* MODAL "GERENCIAR PERFIL" */}
      <Modal
        visible={modalGerenciarVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalGerenciarVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalGerenciarVisible(false)}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitulo}>Gerenciar perfil</Text>

            <TouchableOpacity 
              style={styles.modalOpcao}
              onPress={irParaEditarPerfil}
            >
              <Ionicons name="person" size={24} color="#F59E0B" />
              <Text style={styles.modalOpcaoTexto}>Editar informações da conta</Text>
            </TouchableOpacity>

            <View style={styles.modalDivisor} />

            <TouchableOpacity 
              style={styles.modalOpcao}
              onPress={irParaTrocarSenha}
            >
              <Ionicons name="lock-closed" size={24} color="#F59E0B" />
              <Text style={styles.modalOpcaoTexto}>Editar senha</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modalBotaoVoltar}
              onPress={() => setModalGerenciarVisible(false)}
            >
              <Text style={styles.modalBotaoVoltarTexto}>Voltar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <MenuModal 
        visible={menuVisible} 
        onClose={() => setMenuVisible(false)}
        telaAtual="Perfil"
      />
    </FundoDegrade>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '400',
    marginBottom: 30,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 700,
    backgroundColor: '#334155',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#F59E0B',
    padding: 30,
    paddingBottom: 20,
    position: 'relative',
  },
  
  ladoEsquerdo: {
    position: 'absolute',
    left: 30,
    top: 30,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  fotoPerfil: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#F59E0B',
  },
  fotoPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#F59E0B',
  },
  botaoCamera: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#F59E0B',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#334155',
  },
  nomeUsuario: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '400',
    textAlign: 'center',
  },
  
  ladoDireito: {
    marginLeft: 220,
    flex: 1,
  },
  infoTexto: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 10,
    lineHeight: 20,
  },
  infoLabel: {
    color: '#fff',
    fontWeight: '500',
  },
  secaoTitulo: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 10,
  },
  
  botoesCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
    paddingTop: 20,
    gap: 20,
  },
  botaoLogout: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    minWidth: 130,
  },
  botaoLogoutTexto: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  botaoGerenciar: {
    backgroundColor: '#F59E0B',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    minWidth: 160,
  },
  botaoGerenciarTexto: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  botaoMenuFixo: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#4B5563',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 999,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#E5E7EB',
    borderRadius: 15,
    padding: 30,
    width: '90%',
    maxWidth: 450,
    alignItems: 'center',
  },
  modalTitulo: {
    fontSize: 22,
    color: '#1F2937',
    fontWeight: '600',
    marginBottom: 25,
    textAlign: 'center',
  },
  modalOpcao: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    width: '100%',
  },
  modalOpcaoTexto: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 15,
    fontWeight: '400',
  },
  modalDivisor: {
    height: 1,
    backgroundColor: '#9CA3AF',
    width: '100%',
    marginVertical: 5,
  },
  modalBotaoVoltar: {
    marginTop: 25,
    backgroundColor: '#4B5563',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  modalBotaoVoltarTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
});