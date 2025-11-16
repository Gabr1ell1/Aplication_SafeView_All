import React from "react";
import { StyleSheet, Text, ActivityIndicator, View } from "react-native";

import style from "../style";

export default function Loading() {
  return (
    <View style={style.container}>
      <ActivityIndicator size="large" color="var('amarelo')" />
      <Text style={style.texto}>Carregando...</Text>
    </View>
  );
}

