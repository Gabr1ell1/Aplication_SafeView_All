import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
  updatePassword, 
  EmailAuthProvider, 
  reauthenticateWithCredential 
} from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import FundoDegrade from '../components/FundoDegrade';
import Input from '../components/Input';
import Botao from '../components/Botao';
import style from '../style';

function validarSenha(senha) {
  const temMinimo15 = senha.length >= 15;
  const temMinimo6ComRegras =
    senha.length >= 6 &&
    /[A-Z]/i.test(senha) &&
    /[0-9]/.test(senha) &&
    /[@#!%&*]/.test(senha);
  return temMinimo15 || temMinimo6ComRegras;
}

function getForcaSenha(s) {
  if (s.length === 0) return '';
  if (s.length < 6) return 'Fraca';
  if (validarSenha(s)) {
    if (s.length >= 10) return 'Forte';
    return 'Aceitável';
  }
  return 'Fraca';
}

export default function TrocarSenha() {
  const navigation = useNavigation();

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const forcaSenha = getForcaSenha(novaSenha);
  const corForcaSenha =
    forcaSenha === 'Forte'
      ? '#0f0'
      : forcaSenha === 'Aceitável'
      ? '#FFA500'
      : forcaSenha === 'Fraca'
      ? '#f00'
      : '#D5E3ED';

  //  FUNÇÃO DE RE-AUTENTICAÇÃO CORRIGIDA
  const reautenticarUsuario = async () => {
    try {
      const user = auth.currentUser;

      if (!user || !user.email) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        return false;
      }

      //  Cria credenciais com o e-mail do usuário logado
      const credential = EmailAuthProvider.credential(
        user.email,
        senhaAtual
      );

      //  Re-autentica
      await reauthenticateWithCredential(user, credential);
      return true;
    } catch (error) {
      console.error('Erro na re-autenticação:', error);
      
      //  Tratamento melhorado de erros
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        Alert.alert('Senha incorreta', 'A senha atual que você digitou está errada.');
      } else if (error.code === 'auth/too-many-requests') {
        Alert.alert('Muitas tentativas', 'Aguarde um pouco antes de tentar novamente.');
      } else {
        Alert.alert('Erro', 'Não foi possível confirmar sua identidade. Tente novamente.');
      }
      return false;
    }
  };

  const trocarSenha = async () => {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      Alert.alert('Campos obrigatórios', 'Preencha todos os campos.');
      return;
    }

    if (!validarSenha(novaSenha)) {
      Alert.alert(
        'Senha inválida',
        'A senha deve ter no mínimo 6 caracteres, incluindo letra, número e símbolo (@, #, !, %).'
      );
      return;
    }

    if (senhaAtual === novaSenha) {
      Alert.alert('Senhas iguais', 'A nova senha deve ser diferente da senha atual.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      Alert.alert('Senhas não coincidem', 'A nova senha e a confirmação devem ser iguais.');
      return;
    }

    try {
      setLoading(true);

      const autenticado = await reautenticarUsuario();
      if (!autenticado) {
        setLoading(false);
        return;
      }

      const user = auth.currentUser;
      await updatePassword(user, novaSenha);

      Alert.alert('Sucesso', 'Senha alterada com sucesso!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);

      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
    } catch (error) {
      console.error('Erro ao trocar senha:', error);
      
      if (error.code === 'auth/weak-password') {
        Alert.alert('Senha fraca', 'A senha precisa ter no mínimo 6 caracteres.');
      } else if (error.code === 'auth/requires-recent-login') {
        Alert.alert('Sessão expirada', 'Por segurança, faça login novamente e tente trocar a senha.');
      } else {
        Alert.alert('Erro', 'Não foi possível trocar a senha.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <FundoDegrade>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={Platform.OS === 'ios' ? 100 : 20}
      >
        <View style={styles.container}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={30} color="#fff" />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="key" size={80} color="#FFA85A" />
            </View>
            <Text style={[style.titulo, styles.titulo]}>Trocar Senha</Text>
            <Text style={styles.subtitulo}>Crie uma nova senha segura para sua conta</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={{ color: '#fff', marginTop: 10 }}>Alterando senha...</Text>
            </View>
          ) : (
            <View style={styles.card}>
              <View style={styles.avisoContainer}>
                <Ionicons name="shield-checkmark" size={24} color="#4169E1" />
                <Text style={styles.avisoTexto}>
                  Por segurança, você precisará confirmar sua senha atual
                </Text>
              </View>

              <Input
                label="Senha atual:"
                placeholder="Digite sua senha atual"
                value={senhaAtual}
                onChangeText={setSenhaAtual}
                secureTextEntry
              />

              <View style={styles.linhaHorizontal} />

              <Input
                label="Nova senha:"
                placeholder="Ex: C@rro2024!Blindado"
                value={novaSenha}
                onChangeText={setNovaSenha}
                secureTextEntry
              />

              <Text style={styles.regrasSenha}>
                A senha deve ter no mínimo 6 caracteres, incluindo um número, letra e símbolo (ex: @, #, !, %)
              </Text>

              {forcaSenha !== '' && (
                <View style={styles.forcaSenhaContainer}>
                  <Text style={styles.forcaSenhaLabel}>Força da senha:</Text>
                  <View style={[styles.forcaSenhaBarra, { backgroundColor: corForcaSenha }]}>
                    <Text style={styles.forcaSenhaTexto}>{forcaSenha}</Text>
                  </View>
                </View>
              )}

              <Input
                label="Confirmar nova senha:"
                placeholder="Digite a senha novamente"
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry
              />

              {confirmarSenha.length > 0 && (
                <View style={styles.senhasCoincidentes}>
                  <Ionicons
                    name={novaSenha === confirmarSenha ? 'checkmark-circle' : 'close-circle'}
                    size={20}
                    color={novaSenha === confirmarSenha ? '#0f0' : '#f00'}
                  />
                  <Text
                    style={[
                      styles.senhasCoincidentesTexto,
                      { color: novaSenha === confirmarSenha ? '#0f0' : '#f00' },
                    ]}
                  >
                    {novaSenha === confirmarSenha
                      ? 'As senhas coincidem'
                      : 'As senhas não coincidem'}
                  </Text>
                </View>
              )}

              <Botao label="Alterar Senha" onPress={trocarSenha} />

              <View style={styles.dicasContainer}>
                <Text style={styles.dicasTitulo}>💡 Dicas de segurança:</Text>
                <Text style={styles.dicasTexto}>
                  • Use uma senha única para cada conta{'\n'}
                  • Combine letras maiúsculas e minúsculas{'\n'}
                  • Adicione números e símbolos especiais{'\n'}
                  • Evite informações pessoais óbvias
                </Text>
              </View>
            </View>
          )}
        </View>
      </KeyboardAwareScrollView>
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
backButton: {
marginBottom: 10,
alignSelf: 'flex-start',
padding: 5,
},
header: {
marginBottom: 30,
alignItems: 'center',
},
iconContainer: {
marginBottom: 15,
},
titulo: {
fontSize: 32,
marginBottom: 10,
},
subtitulo: {
fontSize: 16,
color: '#BDC4D4',
textAlign: 'center',
paddingHorizontal: 20,
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
avisoContainer: {
flexDirection: 'row',
alignItems: 'center',
backgroundColor: 'rgba(65, 105, 225, 0.2)', // Azul transparente
borderRadius: 10,
padding: 15,
marginBottom: 20,
borderWidth: 1,
borderColor: '#4169E1',
},
avisoTexto: {
flex: 1,
color: '#BDC4D4',
fontSize: 14,
marginLeft: 10,
lineHeight: 20,
},
linhaHorizontal: {
borderBottomColor: '#ada8a836',
borderBottomWidth: 1,
marginVertical: 20,
},
regrasSenha: {
fontSize: 14,
marginTop: 5,
marginBottom: 15,
color: '#D5E3ED',
lineHeight: 20,
},
forcaSenhaContainer: {
marginBottom: 20,
},
forcaSenhaLabel: {
color: '#BDC4D4',
fontSize: 14,
marginBottom: 8,
},
forcaSenhaBarra: {
paddingVertical: 8,
paddingHorizontal: 15,
borderRadius: 8,
alignItems: 'center',
},
forcaSenhaTexto: {
color: '#fff',
fontSize: 16,
fontWeight: 'bold',
},
senhasCoincidentes: {
flexDirection: 'row',
alignItems: 'center',
marginTop: 10,
marginBottom: 20,
},
senhasCoincidentesTexto: {
fontSize: 14,
marginLeft: 8,
fontWeight: '600',
},
loadingContainer: {
alignItems: 'center',
justifyContent: 'center',
paddingVertical: 40,
},
dicasContainer: {
marginTop: 25,
backgroundColor: 'rgba(255, 168, 90, 0.1)', // Laranja transparente
borderRadius: 10,
padding: 15,
borderWidth: 1,
borderColor: 'rgba(255, 168, 90, 0.3)',
},
dicasTitulo: {
color: '#FFA85A',
fontSize: 16,
fontWeight: 'bold',
marginBottom: 10,
},
dicasTexto: {
color: '#BDC4D4',
fontSize: 14,
lineHeight: 22,
},
});