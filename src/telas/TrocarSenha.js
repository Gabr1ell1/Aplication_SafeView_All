import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
  updatePassword, 
  EmailAuthProvider, 
  reauthenticateWithCredential,
  sendPasswordResetEmail // ✅ NOVO: Função para enviar email de recuperação
} from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import FundoDegrade from '../components/FundoDegrade';
import Input from '../components/Input';

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
      ? '#22c55e'
      : forcaSenha === 'Aceitável'
      ? '#FFA500'
      : forcaSenha === 'Fraca'
      ? '#ef4444'
      : '#D5E3ED';

  // ✅ FUNÇÃO PARA ENVIAR EMAIL DE RECUPERAÇÃO
  const enviarEmailRecuperacao = async () => {
    try {
      setLoading(true);

      // PASSO 1: Pega o e-mail do usuário logado
      const user = auth.currentUser;
      
      if (!user || !user.email) {
        Alert.alert('Erro', 'Nenhum usuário logado ou e-mail não encontrado.');
        setLoading(false);
        return;
      }

      const emailUsuario = user.email;

      // PASSO 2: Envia o e-mail de recuperação
      await sendPasswordResetEmail(auth, emailUsuario);

      // PASSO 3: Mostra mensagem de sucesso
      Alert.alert(
        'E-mail enviado! ✅',
        `Um link de recuperação foi enviado para ${emailUsuario}. Verifique sua caixa de entrada e spam.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // PASSO 4: Faz logout após enviar o e-mail
              // (obrigatório porque o usuário vai trocar a senha pelo e-mail)
              Alert.alert(
                'Fazer logout?',
                'Você será deslogado para trocar a senha pelo e-mail. Deseja continuar?',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Sim, fazer logout',
                    onPress: async () => {
                      await auth.signOut();
                      navigation.navigate('Login');
                    },
                  },
                ]
              );
            },
          },
        ]
      );

    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);

      // PASSO 5: Tratamento de erros
      if (error.code === 'auth/user-not-found') {
        Alert.alert('Erro', 'Usuário não encontrado.');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Erro', 'E-mail inválido.');
      } else if (error.code === 'auth/too-many-requests') {
        Alert.alert(
          'Muitas tentativas',
          'Você tentou muitas vezes. Aguarde alguns minutos e tente novamente.'
        );
      } else {
        Alert.alert('Erro', 'Não foi possível enviar o e-mail de recuperação.');
      }
    } finally {
      setLoading(false);
    }
  };

  const reautenticarUsuario = async () => {
    try {
      const user = auth.currentUser;

      if (!user || !user.email) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        return false;
      }

      const credential = EmailAuthProvider.credential(
        user.email,
        senhaAtual
      );

      await reauthenticateWithCredential(user, credential);
      return true;
    } catch (error) {
      console.error('Erro na re-autenticação:', error);
      
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
    <FundoDegrade style={['#2C3E50', '#1A2332']}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={Platform.OS === 'ios' ? 100 : 20}
      >
        <View style={styles.container}>
          <Text style={styles.titulo}>Alterando senha...</Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={{ color: '#fff', marginTop: 10 }}>Processando...</Text>
            </View>
          ) : (
            <View style={styles.card}>
              {/* Senha atual */}
              <Text style={styles.label}>Senha atual:</Text>
              <Input
                placeholder="Digite aqui..."
                value={senhaAtual}
                onChangeText={setSenhaAtual}
                secureTextEntry
              />

              {/* ✅ LINK "ESQUECI MINHA SENHA" FUNCIONAL */}
              <TouchableOpacity 
                style={styles.linkContainer}
                onPress={enviarEmailRecuperacao}
              >
                <Text style={styles.linkTexto}>Esqueci minha senha</Text>
              </TouchableOpacity>

              {/* Nova senha */}
              <Text style={styles.label}>Nova senha:</Text>
              <Input
                placeholder="Digite aqui..."
                value={novaSenha}
                onChangeText={setNovaSenha}
                secureTextEntry
              />

              {/* Texto de regras */}
              <Text style={styles.regrasSenha}>
                A senha deve ter pelo menos 15 caracteres OU pelo menos 6 caracteres, incluindo um número, letra e símbolo (ex: @, #, !, %)
              </Text>

              {/* Indicador de força (SIMPLES) */}
              {forcaSenha !== '' && (
                <Text style={[styles.forcaSenhaTexto, { color: corForcaSenha }]}>
                  Senha: {forcaSenha}
                </Text>
              )}

              {/* Confirme sua nova senha */}
              <Text style={styles.label}>Confirme sua nova senha:</Text>
              <Input
                placeholder="Digite aqui..."
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry
              />

              {/* Botões */}
              <View style={styles.botoesContainer}>
                <TouchableOpacity 
                  style={styles.botaoCancelar}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.botaoConfirmar}
                  onPress={trocarSenha}
                >
                  <Text style={styles.botaoConfirmarTexto}>Confirmar</Text>
                </TouchableOpacity>
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
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  titulo: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '400',
    marginBottom: 30,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 550,
    backgroundColor: '#334155',
    borderRadius: 20,
    padding: 30,
  },
  label: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
    marginTop: 15,
  },
  linkContainer: {
    alignSelf: 'flex-end',
    marginTop: 5,
    marginBottom: 10,
  },
  linkTexto: {
    fontSize: 13,
    color: '#93C5FD',
    textDecorationLine: 'underline',
  },
  regrasSenha: {
    fontSize: 12,
    color: '#D1D5DB',
    marginTop: 8,
    lineHeight: 18,
  },
  forcaSenhaTexto: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 5,
  },
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    marginTop: 30,
  },
  botaoCancelar: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  botaoCancelarTexto: {
    color: '#1F2937',
    fontSize: 15,
    fontWeight: '500',
  },
  botaoConfirmar: {
    flex: 1,
    backgroundColor: '#F59E0B',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  botaoConfirmarTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
});