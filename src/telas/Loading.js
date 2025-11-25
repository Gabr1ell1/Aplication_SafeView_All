import React, { useEffect } from "react";
import { StyleSheet, ActivityIndicator, View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function Loading() {
  const navigation = useNavigation();

  useEffect(() => {
    // Observer do Firebase que detecta mudanças de autenticação
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setTimeout(() => {
        if (user) {
          //  TEM usuário logado → vai para TelaInicial
          navigation.navigate('TelaInicial');
        } else {
          //  NÃO TEM usuário → vai para Login
          navigation.navigate('Login');
        }
      }, 2000); // Aguarda 2 segundos (splash screen)
    });

    // Limpa o observer quando o componente desmontar
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FFA25B" />
      <Text style={styles.text}>Carregando...</Text>
      <Text style={styles.subtext}>Verificando autenticação...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1D2E4A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#F1F1F1',
    fontSize: 20,
    marginTop: 15,
    fontWeight: 'bold',
  },
  subtext: {
    color: '#BDC4D4',
    fontSize: 14,
    marginTop: 5,
  },
});