import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, StyleSheet, Dimensions, StatusBar } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';

import CameraCarousel from '../components/CameraCarousel';
import StatusRow from '../components/StatusRow';
import MenuModal from '../components/MenuModal';



export default function TelaInicial() {
  const [screenWidth, setScreenWidth] = useState(Dimensions.get("window").width);
  const [menuVisible, setMenuVisible] = useState(false);

  const cameraData = [
    {
      id: "1",
      label: "Câmera lateral",
      source: require("./../../assets/camera-lateral.png"),
    },
    {
      id: "2",
      label: "Câmera traseira",
      source: require("./../../assets/camera-traseira.png"), // trocar pela correta
    },
  ];

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    

    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenWidth(window.width);
    });

    return () => subscription?.remove?.();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
        <StatusBar hidden={true} />
      {/* Header direto aqui */}
      <Text style={styles.header}>Página Inicial</Text>

      {/* Carrossel */}
      <CameraCarousel data={cameraData} screenWidth={screenWidth} />

      {/* Status + botão de menu */}
      <StatusRow onMenuPress={() => setMenuVisible(true)} />

      {/* Modal do menu */}
      <MenuModal visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#182946",
    paddingHorizontal: 10,
    justifyContent: "space-between",
  },
  header: {
    fontFamily: "Fredoka_500Medium",
    color: "white",
    fontSize: 20,
    textAlign: "center",
    marginTop: 10,
  },
});
