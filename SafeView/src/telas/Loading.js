import React, { useContext, useEffect } from 'react';
import { StyleSheet, Text, ActivityIndicator, View } from 'react-native';
import style from '../style';
import { AuthContext } from '../context/authContext';

export default function Loading({ navigation }) {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // pequena pausa só para exibir o loading corretamente
    const timer = setTimeout(() => {
      if (user) {
        navigation.replace('TelaInicial');
      } else {
        navigation.replace('Login');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [user]);

  return (
    <View style={style.container}>
      <ActivityIndicator size="large" color="#E7C100" />
      <Text style={style.texto}>Carregando...</Text>
    </View>
  );
}
