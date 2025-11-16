import React, { useState, useRef } from 'react';
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
import { doc, updateDoc } from 'firebase/firestore';
import { 
  updateEmail, 
  EmailAuthProvider, 
  reauthenticateWithCredential 
} from 'firebase/auth'; // NOVAS FUNÇÕES
import { auth, db } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import FundoDegrade from '../components/FundoDegrade';
import Input from '../components/Input';
import Select from '../components/Select';
import Botao from '../components/Botao';
import style from '../style';

const marcasModelos = {
  Hyundai: ['Hyundai HR Baú'],
  Fiat: ['Fiat Ducato Baú'],
  Renault: ['Renault Master Baú'],
  Volvo: ['FH 460 Baú', 'FH 540 Baú', 'VM 270 Baú'],
  Scania: ['R440 Baú', 'R450 Baú', 'P360 Baú'],
  'Mercedes-Benz': ['Sprinter 415 Baú', 'Sprinter 515 Baú', 'Accelo 1016 Baú', 'Atego 1719 Baú', 'Atego 2426 Baú'],
  Iveco: ['Stralis Baú', 'Iveco Daily 35S14 Baú'],
  Volkswagen: ['Delivery 9.170 Baú', 'Delivery 11.180 Baú', 'Constellation 17.230 Baú', 'Constellation 24.280'],
  Outro: ['Outro'],
};

function verificarMaioridade(dataStr) {
  const [dia, mes, ano] = dataStr.split('/').map(Number);
  if (!dia || !mes || !ano || dataStr.length !== 10) return false;

  const hoje = new Date();
  const nascimento = new Date(ano, mes - 1, dia);

  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mesDiff = hoje.getMonth() - nascimento.getMonth();

  if (mesDiff < 0 || (mesDiff === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }

  return idade >= 18;
}

export default function EditarPerfil({ route }) {
  const navigation = useNavigation();
  const { dadosUsuario } = route.params;

  // Estados com os valores ATUAIS
  const [nome, setNome] = useState(dadosUsuario.nome);
  const [email, setEmail] = useState(dadosUsuario.email); // NOVO: e-mail editável
  const [ano, setAno] = useState(dadosUsuario.ano);
  const [loading, setLoading] = useState(false);

  // NOVO: Estados para modal de confirmação de senha
  const [mostrarModalSenha, setMostrarModalSenha] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novoEmail, setNovoEmail] = useState('');

  const veiculoAtual = dadosUsuario.veiculo;
  const marcaInicial = Object.keys(marcasModelos).find((m) =>
    veiculoAtual.includes(m)
  ) || 'Outro';
  
  const [marca, setMarca] = useState(marcaInicial);
  const [modelo, setModelo] = useState(
    marcaInicial === 'Outro' ? '' : veiculoAtual.replace(marcaInicial, '').trim()
  );
  const [outro, setOutro] = useState(
    marcaInicial === 'Outro' ? veiculoAtual : ''
  );

  const emailRef = useRef(null);
  const anoRef = useRef(null);

  // NOVA FUNÇÃO: Re-autenticar usuário
  // Por que isso é necessário? Firebase exige confirmação antes de trocar e-mail
  const reautenticarUsuario = async (senha) => {
    try {
      const user = auth.currentUser;
      
      // EmailAuthProvider cria credenciais com e-mail e senha
      const credential = EmailAuthProvider.credential(
        user.email, // E-mail atual
        senha       // Senha digitada
      );

      // reauthenticateWithCredential = confirma que é realmente o usuário
      await reauthenticateWithCredential(user, credential);
      return true;
    } catch (error) {
      console.error('Erro na re-autenticação:', error);
      
      if (error.code === 'auth/wrong-password') {
        Alert.alert('Senha incorreta', 'A senha digitada está errada.');
      } else if (error.code === 'auth/too-many-requests') {
        Alert.alert('Muitas tentativas', 'Aguarde um pouco antes de tentar novamente.');
      } else {
        Alert.alert('Erro', 'Não foi possível confirmar sua identidade.');
      }
      return false;
    }
  };

  // NOVA FUNÇÃO: Atualizar e-mail
  const atualizarEmail = async () => {
    // Valida o novo e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(novoEmail)) {
      Alert.alert('E-mail inválido', 'Digite um e-mail válido.');
      return;
    }

    if (novoEmail === dadosUsuario.email) {
      Alert.alert('Mesmo e-mail', 'Digite um e-mail diferente do atual.');
      return;
    }

    if (!senhaAtual) {
      Alert.alert('Senha obrigatória', 'Digite sua senha atual para confirmar.');
      return;
    }

    try {
      setLoading(true);

      // 1. Re-autentica o usuário
      const autenticado = await reautenticarUsuario(senhaAtual);
      if (!autenticado) {
        setLoading(false);
        return;
      }

      const user = auth.currentUser;

      // 2. Atualiza o e-mail no Firebase Auth
      await updateEmail(user, novoEmail);

      // 3. Atualiza o e-mail no Firestore
      await updateDoc(doc(db, 'motorista', user.uid), {
        email: novoEmail,
        atualizadoEm: new Date(),
      });

      Alert.alert('Sucesso', 'E-mail atualizado com sucesso!');
      
      // Limpa os campos e fecha o modal
      setEmail(novoEmail);
      setSenhaAtual('');
      setNovoEmail('');
      setMostrarModalSenha(false);
    } catch (error) {
      console.error('Erro ao atualizar e-mail:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('E-mail em uso', 'Este e-mail já está sendo usado por outra conta.');
      } else if (error.code === 'auth/requires-recent-login') {
        Alert.alert('Sessão expirada', 'Faça login novamente e tente trocar o e-mail.');
      } else {
        Alert.alert('Erro', 'Não foi possível atualizar o e-mail.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para salvar as alterações (SEM o e-mail)
  const salvarAlteracoes = async () => {
    if (!nome || !ano) {
      Alert.alert('Campos obrigatórios', 'Por favor, preencha todos os campos.');
      return;
    }

    if (nome.trim().length < 6) {
      Alert.alert('Nome inválido', 'Digite seu nome completo.');
      return;
    }

    const dataRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d\d$/;
    if (!dataRegex.test(ano)) {
      Alert.alert('Data inválida', 'Use o formato DD/MM/AAAA.');
      return;
    }

    if (!verificarMaioridade(ano)) {
      Alert.alert('Atenção', 'Você precisa ter mais de 18 anos.');
      return;
    }

    if (marca === '' || (marca !== 'Outro' && modelo === '')) {
      Alert.alert('Veículo obrigatório', 'Selecione a marca e modelo do veículo.');
      return;
    }

    if (marca === 'Outro' && outro.trim() === '') {
      Alert.alert('Veículo obrigatório', 'Digite a marca/modelo do veículo.');
      return;
    }

    try {
      setLoading(true);

      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        return;
      }

      const veiculoCompleto = marca === 'Outro' ? outro : `${marca} ${modelo}`;

      // Atualiza APENAS nome, ano e veículo (e-mail é separado)
      await updateDoc(doc(db, 'motorista', user.uid), {
        nome,
        ano,
        veiculo: veiculoCompleto,
        atualizadoEm: new Date(),
      });

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
    } finally {
      setLoading(false);
    }
  };

  const modelosDisponiveis = marca ? marcasModelos[marca] || [] : [];

  return (
    <FundoDegrade>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={Platform.OS === 'ios' ? 100 : 20}
      >
        <View style={styles.container}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={30} color="#fff" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={[style.titulo, styles.titulo]}>Editar Perfil</Text>
            <Text style={styles.subtitulo}>
              Atualize suas informações abaixo
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={{ color: '#fff', marginTop: 10 }}>
                Salvando alterações...
              </Text>
            </View>
          ) : (
            <View style={styles.card}>
              {/* Campo de nome */}
              <Input
                label="Nome completo"
                placeholder="Deve conter 6 ou mais caracteres"
                value={nome}
                onChangeText={setNome}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => emailRef.current?.focus()}
              />

              {/* NOVO: Campo de e-mail EDITÁVEL */}
              <View style={styles.emailEditavelContainer}>
                <Input
                  label="E-mail"
                  placeholder="exemplo@gmail.com"
                  value={email}
                  onChangeText={setEmail}
                  ref={emailRef}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => anoRef.current?.focus()}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                
                {/* Botão para trocar e-mail */}
                {email !== dadosUsuario.email && (
                  <TouchableOpacity
                    style={styles.botaoTrocarEmail}
                    onPress={() => {
                      setNovoEmail(email);
                      setMostrarModalSenha(true);
                    }}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.botaoTrocarEmailTexto}>
                      Confirmar novo e-mail
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Data de nascimento */}
              <Input
                label="Data de nascimento:"
                placeholder="DD/MM/AAAA"
                value={ano}
                onChangeText={(text) => {
                  const numericText = text.replace(/\D/g, '');
                  let formatted = numericText;

                  if (numericText.length > 2 && numericText.length <= 4) {
                    formatted = `${numericText.slice(0, 2)}/${numericText.slice(2)}`;
                  } else if (numericText.length > 4) {
                    formatted = `${numericText.slice(0, 2)}/${numericText.slice(2, 4)}/${numericText.slice(4, 8)}`;
                  }

                  setAno(formatted);
                }}
                onBlur={() => {
                  if (!verificarMaioridade(ano)) {
                    Alert.alert('Atenção', 'Você precisa ter mais de 18 anos.');
                    setAno(dadosUsuario.ano);
                  }
                }}
                ref={anoRef}
                keyboardType="numeric"
              />

              <View style={styles.linhaHorizontal} />

              <Text style={styles.secaoTitulo}>Informações do Veículo</Text>

              <Select
                label="Marca do caminhão:"
                selectedValue={marca}
                onValueChange={(value) => {
                  setMarca(value);
                  setModelo('');
                  setOutro('');
                }}
                options={Object.keys(marcasModelos).map((m) => ({ 
                  label: m, 
                  value: m 
                }))}
              />

              {marca === 'Outro' ? (
                <Input
                  label="Digite a Marca/Modelo:"
                  placeholder="Volvo FH"
                  value={outro}
                  onChangeText={setOutro}
                />
              ) : (
                marca !== '' && (
                  <Select
                    label="Modelo do caminhão:"
                    selectedValue={modelo}
                    onValueChange={setModelo}
                    options={modelosDisponiveis.map((mod) => ({ 
                      label: mod, 
                      value: mod 
                    }))}
                  />
                )
              )}

              <Botao label="Salvar Alterações" onPress={salvarAlteracoes} />
            </View>
          )}

          {/* MODAL DE CONFIRMAÇÃO DE SENHA */}
          {mostrarModalSenha && (
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitulo}>Confirme sua senha</Text>
                <Text style={styles.modalSubtitulo}>
                  Para trocar o e-mail para:
                </Text>
                <Text style={styles.modalEmail}>{novoEmail}</Text>
                <Text style={styles.modalSubtitulo}>
                  Digite sua senha atual:
                </Text>

                <Input
                  placeholder="Senha atual"
                  value={senhaAtual}
                  onChangeText={setSenhaAtual}
                  secureTextEntry
                />

                <View style={styles.modalBotoes}>
                  <TouchableOpacity
                    style={[styles.modalBotao, styles.modalBotaoCancelar]}
                    onPress={() => {
                      setMostrarModalSenha(false);
                      setSenhaAtual('');
                      setEmail(dadosUsuario.email); // Volta para o e-mail original
                    }}
                  >
                    <Text style={styles.modalBotaoTexto}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalBotao, styles.modalBotaoConfirmar]}
                    onPress={atualizarEmail}
                  >
                    <Text style={styles.modalBotaoTexto}>Confirmar</Text>
                  </TouchableOpacity>
                </View>
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
  emailEditavelContainer: {
    marginBottom: 10,
  },
  botaoTrocarEmail: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4169E1',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  botaoTrocarEmailTexto: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  linhaHorizontal: {
    borderBottomColor: '#ada8a836',
    borderBottomWidth: 1,
    marginVertical: 20,
  },
  secaoTitulo: {
    color: '#FFA85A',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  
  // ESTILOS DO MODAL
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Fundo escuro semi-transparente
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#1E2A38',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: '#FFA85A',
  },
  modalTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalSubtitulo: {
    fontSize: 14,
    color: '#BDC4D4',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalEmail: {
    fontSize: 16,
    color: '#FFA85A',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalBotoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalBotao: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  modalBotaoCancelar: {
    backgroundColor: '#DC143C',
  },
  modalBotaoConfirmar: {
    backgroundColor: '#32CD32',
  },
  modalBotaoTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});