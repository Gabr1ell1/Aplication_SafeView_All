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
} from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import { useNavigation } from "@react-navigation/native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { saveUser } from "../services/authStorage"; 

import style from "../style";
import Input from "../components/Input";
import FundoDegrade from "../components/FundoDegrade";
import Botao from "../components/Botao";

export default function Login() {
      const navigation = useNavigation();

      const [email, setEmail] = useState("");
      const [senha, setSenha] = useState("");

      const emailRef = useRef(null);
      const senhaRef = useRef(null);

      const { width } = useWindowDimensions();
      const isLargeScreen = width > 900;

      // Desbloqueia rotação
      useEffect(() => {
        ScreenOrientation.unlockAsync();
      }, []);

      // LOGIN REAL
      async function handleLogin() {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, senha);
          const user = userCredential.user;
          
          // Salva dados essenciais do usuário no SecureStore
          await saveUser({
            uid: user.uid,
            email: user.email,
          });

          console.log("Login OK:", user.email);
          navigation.navigate("TelaInicial");
        } catch (error) {
          console.log("Erro ao logar:", error.message);
          Alert.alert("Erro", "Email ou senha incorretos!");
        }
      }

      // VALIDAÇÃO E DISPARO DO LOGIN
      function finalizar() {
        if (!email || !senha) {
          Alert.alert("Campos obrigatórios", "Preencha todos os campos.");
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          Alert.alert("E-mail inválido", "Digite um e-mail válido.");
          return;
        }

        handleLogin(); //só faz login se estiver tudo ok
  }

  return (
    <FundoDegrade>
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
            <Text style={[style.titulo, styles.titulo]}>
              Bem-vindo de volta!
            </Text>
            <Text style={[style.texto, styles.subtitulo]}>
              Faça login para continuar
            </Text>

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

              <Botao label="Entrar" onPress={finalizar} />

              <Text style={styles.cadastroTexto}>Não tem conta?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("CadastroUsers")}
              >
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
