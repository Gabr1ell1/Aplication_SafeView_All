import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  useWindowDimensions,
  Alert,
  Platform,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import { useNavigation } from "@react-navigation/native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { Ionicons } from '@expo/vector-icons';

import style from "../style";
import Input from "../components/Input";
import FundoDegrade from "../components/FundoDegrade";
import Botao from "../components/Botao";

export default function Login() {
  useEffect(() => {
    ScreenOrientation.unlockAsync();
  }, []);

  const navigation = useNavigation();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const emailRef = useRef(null);
  const senhaRef = useRef(null);

  const { width } = useWindowDimensions();
  const isLargeScreen = width > 900;

  async function finalizar() {
    if (!email || !senha) {
      Alert.alert("Campos obrigatórios", "Por favor, preencha todos os campos.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("E-mail inválido", "Digite um e-mail válido.");
      return;
    }

    try {
      setLoading(true);

      //  Login no Firebase
      await signInWithEmailAndPassword(auth, email, senha);

      //  Se deu certo, vai para TelaInicial (não Perfil)
      navigation.navigate("TelaInicial");
    } catch (error) {
      console.error("Erro ao fazer login:", error);

      //  Tratamento melhorado de erros
      if (error.code === 'auth/invalid-credential' || 
          error.code === 'auth/wrong-password' ||
          error.code === 'auth/user-not-found') {
        Alert.alert(
          "Erro ao entrar",
          "E-mail ou senha incorretos. Verifique seus dados e tente novamente."
        );
      } else if (error.code === 'auth/too-many-requests') {
        Alert.alert(
          "Muitas tentativas", 
          "Você tentou muitas vezes. Aguarde alguns minutos e tente novamente."
        );
      } else if (error.code === 'auth/network-request-failed') {
        Alert.alert(
          "Erro de conexão",
          "Verifique sua internet e tente novamente."
        );
      } else {
        Alert.alert(
          "Erro", 
          "Não foi possível fazer login. Tente novamente mais tarde."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <FundoDegrade>
      <StatusBar hidden={true} />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={Platform.OS === "ios" ? 100 : 20}
      >
        <View style={[styles.container, isLargeScreen && styles.containerRow]}>
          {isLargeScreen && (
            <View style={styles.imageContainer}>
              <Image
                source={require("../../assets/logo-truck.png")}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
          )}

          <View style={styles.formContainer}>
            <Text style={[style.titulo, styles.titulo]}>Bem-vindo de volta!</Text>
            <Text style={[style.texto, styles.subtitulo]}>Faça login para continuar</Text>

            <View style={isLargeScreen ? styles.card : styles.formMobile}>
              <Input
                label="E-mail"
                placeholder="exemplo@gmail.com"
                value={email}
                onChangeText={setEmail}
                returnKeyType="next"
                blurOnSubmit={false}
                ref={emailRef}
                onSubmitEditing={() => senhaRef.current?.focus()}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Input
                label="Senha"
                placeholder="Digite sua senha"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
                ref={senhaRef}
                returnKeyType="done"
                onSubmitEditing={finalizar}
              />

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#FFA25B" />
                  <Text style={styles.loadingText}>Entrando...</Text>
                </View>
              ) : (
                <Botao label="Entrar" onPress={finalizar} />
              )}

              <Text style={styles.cadastroTexto}>Não tem conta?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("CadastroUsers")}>
                <Text style={styles.cadastroLink}>Cadastre-se!</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  containerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  imageContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  image: {
    width: "100%",
    height: Platform.OS === "web" ? 300 : 200,
  },
  formContainer: {
    flex: 1,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitulo: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    borderColor: "#0F1A2C",
    borderWidth: 0.5,
    borderRadius: 12,
    padding: 25,
    marginTop: 20,
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 5,
  },
  formMobile: {
    width: "100%",
    marginTop: 15,
  },
  loadingContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
  },
  cadastroTexto: {
    marginTop: 15,
    color: "#fff",
    textAlign: "center",
  },
  cadastroLink: {
    textAlign: "center",
    fontWeight: "bold",
    textDecorationLine: "underline",
    color: "#FFA85A",
  },
});