import React, { useState } from 'react';
import {
  View,
  SafeAreaView,
  Text,
  Image,
  StyleSheet,
  useWindowDimensions,
  Alert,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

import style from '../style';
import Input from '../components/Input';
import Select from '../components/Select';
import FundoDegrade from '../components/FundoDegrade';
import Botao from '../components/Botao';

/* -------------------- Funções auxiliares -------------------- */
//Seleção de modelos de caminhões
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

//Senha válida
function validarSenha(senha) {
  const temMinimo15 = senha.length >= 15;
  const temMinimo6ComRegras =
    senha.length >= 6 &&
    /[A-Z]/i.test(senha) &&
    /[0-9]/.test(senha) &&
    /[@#!%&*]/.test(senha);
  return temMinimo15 || temMinimo6ComRegras;
}

//Validando o nível das senhas
function getForcaSenha(s) {
  if (s.length === 0) return '';
  if (s.length < 6) return 'Fraca';
  if (validarSenha(s)) {
    if (s.length >= 10) return 'Forte';
    return 'Aceitável';
  }
  return 'Fraca';
}


const LinhaHorizontal = () => (<View style={styles.linhaHorizontal} />);

/* -------------------- Formulário interno -------------------- */
function Formulario({
  marca,
  setMarca,
  modelo,
  setModelo,
  outro,
  setOutro,
  senha,
  setSenha,
  isLargeScreen,
  onSubmit,
}) {
  const modelosDisponiveis = marca ? marcasModelos[marca] || [] : [];
  const forcaSenha = getForcaSenha(senha);
  const corForcaSenha =
    forcaSenha === 'Forte'
      ? '#0f0'
      : forcaSenha === 'Aceitável'
      ? '#FFA500'
      : forcaSenha === 'Fraca'
      ? '#f00'
      : '#D5E3ED';

/* -------------------- Funções auxiliares -------------------- */
  return (
    <View style={isLargeScreen ? styles.card : styles.formMobile}>
      <Text style={[style.titulo, styles.cardtitulo]}>Sobre seu veículo</Text>

      <View style={styles.pickerContainer}>
        <Select
          label="Marca do caminhão:"
          selectedValue={marca}
          onValueChange={(value) => {
            setMarca(value);
            setModelo('');
            setOutro('');
          }}
          options={Object.keys(marcasModelos).map((m) => ({ label: m, value: m }))}
        />

        {marca === 'Outro' ? (
          <Input
            label="Digite a Marca/Modelo:"
            placeholder= "Volvo FH"
            value={outro}
            onChangeText={setOutro}
          />
        ) : (
          marca !== '' && (
            <Select
              label="Modelo do caminhão:"npx 
              selectedValue={modelo}
              onValueChange={setModelo}
              options={modelosDisponiveis.map((mod) => ({ label: mod, value: mod }))}
            />
          )
        )}
      </View>

      <LinhaHorizontal />

      <Input
        label="Crie uma senha:"
        placeholder="Ex: C@rro2024!Blindado"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      <Text style={styles.regrasSenha}>
        A senha deve ter no mínimo 6 caracteres. Incluindo um número, letra e símbolo (ex: @, #, !, %)
      </Text>

      {forcaSenha !== '' && <Text style={{ color: corForcaSenha }}>Senha: {forcaSenha}</Text>}

      <Botao label="Entrar" onPress={onSubmit} />
    </View>
  );
}


export default function Cadastro2({ navigation, route }) {
  const { nome, email, ano } = route.params;
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [outro, setOutro] = useState('');
  const [senha, setSenha] = useState('');

  const [loading, setLoading] = useState(false);
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;


  //Salvando os dados
  const salvarDados = async () => {
    if (senha.length < 6) {
      Alert.alert('Senha inválida', 'A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    try {
    setLoading(true); 

    //Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    //Firestore
      await setDoc(doc(db, 'motorista', user.uid), {
        nome,
        email,
        ano,
        veiculo: marca === 'Outro' ? outro : `${marca} ${modelo}`,
        tamanhoSenha: senha.length, //  ADICIONE ESTA LINHA
      criadoEm: new Date(),
      });
       
      Alert.alert('Sucesso', 'Cadastro realizado!');

      //!!Trocar para direcionar para tela inicial
      navigation.navigate('TelaInicial');
      } catch (error) {
      console.error(error);

      if (error.code === 'auth/weak-password') {
        Alert.alert('Senha fraca', 'A senha precisa ter no mínimo 6 caracteres.');
        } 
      else if (error.code === 'auth/email-already-in-use') {
          Alert.alert('E-mail já em uso', 'Tente fazer login ou usar outro e-mail.');
        } 
      else {
        Alert.alert('Erro', 'Não foi possível criar sua conta.');
      }
      } finally {
          setLoading(false);
  }
};

/* -------------------- Tela Principal -------------------- */
  return (
    <FundoDegrade>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={Platform.OS === 'ios' ? 100 : 20}
      >
        <View style={[styles.container, isLargeScreen && styles.containerRow]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={30} color="#fff" />
          </TouchableOpacity>

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
            <Text style={[style.titulo, styles.titulo]}>Olá, é um prazer!</Text>
            <Text style={[style.texto, styles.subtitulo]}>
              Que tal começar uma nova jornada?
            </Text>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={{ color: '#fff', marginTop: 10 }}>Cadastrando...</Text>
              </View>
            ) : (
              <Formulario
                  marca={marca}
                  setMarca={setMarca}
                  modelo={modelo}
                  setModelo={setModelo}
                  outro={outro}
                  setOutro={setOutro}
                  senha={senha}
                  setSenha={setSenha}
                  isLargeScreen={isLargeScreen}
                  onSubmit={salvarDados}
                />
              )}
            </View>
        </View>
      </KeyboardAwareScrollView>
    </FundoDegrade>
  );
}

/* -------------------- Estilos -------------------- */

const styles = StyleSheet.create({
  scrollContainer:{ 
    flexGrow: 1, 
    padding: 20 
  },
  container: {  
    flex: 1 
  },
  containerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  backButton: { 
    marginBottom: 10, 
    alignSelf: 'flex-start', 
    padding: 1 
  },
  imageContainer: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 20 
  },
  image: { 
    width: '100%', 
    height: Platform.OS === 'web' ? 300 : 200 
  },
  formContainer: { 
    flex: 1 
  },
  formMobile: { 
    width: '100%', 
    marginTop: 15 
  },
  card: { 
    borderColor: '#0F1A2C', 
    borderWidth: 0.5, 
    borderRadius: 12, 
    padding: 25, 
    marginTop: 20, 
    shadowOpacity: 1, 
    shadowRadius: 15, 
    elevation: 5 
  },
  cardtitulo: { 
    textAlign: 'center', 
    marginBottom: 20, 
    fontSize: 22 
  },
  titulo: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    textAlign: 'center' 
  },
  subtitulo: { 
    fontSize: 18, 
    textAlign: 'center', 
    marginBottom: 20 
  },
  pickerContainer: { 
    marginBottom: 15 
  },
  regrasSenha: { 
    fontSize: 14, 
    marginBottom: 10, 
    color: '#D5E3ED' 
  },
  linhaHorizontal: { 
    borderBottomColor: '#ada8a836', 
    borderBottomWidth: 1, 
    marginVertical: 10 
  },
  loadingContainer: {
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 40,
},
});