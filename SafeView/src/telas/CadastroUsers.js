// Cadastro.js
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  useWindowDimensions,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import style from '../style';
import Input from '../components/Input';
import FundoDegrade from '../components/FundoDegrade';
import Botao from '../components/Botao';

/* ---------------------------- Funções auxiliares ---------------------------- */

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

/* ---------------------------- Formulário interno ---------------------------- */

function Formulario({
  nome,
  setNome,
  email,
  setEmail,
  ano,
  setAno,
  emailRef,
  anoRef,
  finalizar,
  isLargeScreen,
}) {

  /* -------------------- Tela Principal -------------------- */
  return (
    <View style={isLargeScreen ? styles.card : styles.formMobile}>
      <Text style={[style.titulo, styles.cardtitulo]}>
        Quem vai dirigir?
      </Text>

      <Input
        label="Nome completo"
        placeholder="Deve conter 6 ou mais caracteres"
        value={nome}
        onChangeText={setNome}
        returnKeyType="next"
        blurOnSubmit={false}
        onSubmitEditing={() => emailRef.current?.focus()}
      />

      <Input
        label="Digite seu e-mail de acesso:"
        placeholder="exemplo@gmail.com"
        value={email}
        onChangeText={setEmail}
        ref={emailRef}
        returnKeyType="next"
        blurOnSubmit={false}
        onSubmitEditing={() => anoRef.current?.focus()}
      />

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
            formatted = `${numericText.slice(0, 2)}/${numericText.slice(
              2,
              4
            )}/${numericText.slice(4, 8)}`;
          }

          setAno(formatted);
        }}
        onBlur={() => {
          if (!verificarMaioridade(ano)) {
            Alert.alert(
              'Atenção',
              'Você precisa ter mais de 18 anos para se cadastrar.'
            );
            setAno('');
          }}}
        ref={anoRef}
        keyboardType="numeric"
      />

      <Botao label="Entrar" onPress={finalizar} />
    </View>
  );
}

/* ---------------------------- Tela principal ---------------------------- */

export default function Cadastro() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 900;

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [ano, setAno] = useState('');

  const emailRef = useRef(null);
  const anoRef = useRef(null);

  function finalizar() {
    if (!nome || !email || !ano) {
      Alert.alert('Campos obrigatórios', 'Por favor, preencha todos os campos.');
      return;
    }

    if (nome.trim().length < 6) {
      Alert.alert('Nome inválido', 'Digite seu nome completo.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('E-mail inválido', 'Digite um e-mail válido.');
      return;
    }

    const dataRegex =
      /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d\d$/;
    if (!dataRegex.test(ano)) {
      Alert.alert('Data inválida', 'Use o formato DD/MM/AAAA.');
      return;
    }

    if (!verificarMaioridade(ano)) {
      Alert.alert(
        'Atenção',
        'Você precisa ter mais de 18 anos para se cadastrar.'
      );
      return;
    }

    navigation.navigate('CadastroUsers2', { nome, email, ano });
  }

  return (
    <FundoDegrade>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={Platform.OS === 'ios' ? 100 : 20}
      >
        <View style={[styles.container, isLargeScreen && styles.containerRow]}>
          {isLargeScreen && (
            <View style={styles.imageContainer}>
              <Image
                source={require('../../assets/logo-truck.png')}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
          )}

          <View style={styles.formContainer}>
            <Text style={[style.titulo, styles.titulo]}>
              Olá, é um prazer!
            </Text>
            <Text style={[style.texto, styles.subtitulo]}>
              Que tal começar uma nova jornada?
            </Text>

            <Formulario
              nome={nome}
              setNome={setNome}
              email={email}
              setEmail={setEmail}
              ano={ano}
              setAno={setAno}
              emailRef={emailRef}
              anoRef={anoRef}
              finalizar={finalizar}
              isLargeScreen={isLargeScreen}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </FundoDegrade>
  );
}

/* ---------------------------- Estilos ---------------------------- */

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  container: {
    flex: 1,
  },
  containerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: '100%',
    height: Platform.OS === 'web' ? 300 : 200,
  },
  formContainer: {
    flex: 1,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    borderColor: '#0F1A2C',
    borderWidth: 0.5,
    borderRadius: 12,
    padding: 25,
    marginTop: 20,
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 5,
  },
  cardtitulo: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 22,
  },
  formMobile: {
    width: '100%',
    marginTop: 15,
  },
});
