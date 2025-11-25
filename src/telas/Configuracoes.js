import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ NOVO

import MenuModal from '../components/MenuModal';
import FundoDegrade from '../components/FundoDegrade';
import style from '../style';

export default function Configuracoes() {
  const navigation = useNavigation();

  const [trocaAutomatica, setTrocaAutomatica] = useState(false);
  const [volumeAlerta, setVolumeAlerta] = useState(50);
  const [menuVisible, setMenuVisible] = useState(false);

  // ✅ CHAVES PARA SALVAR
  const STORAGE_KEY_VOLUME = '@SafeView:volumeAlerta';
  const STORAGE_KEY_TROCA = '@SafeView:trocaAutomatica';

  useEffect(() => {
    carregarVolumeAtual();
  }, []);

  // ✅ CARREGAR CONFIGURAÇÕES SALVAS
  const carregarVolumeAtual = async () => {
    try {
      // Carrega volume
      const volumeSalvo = await AsyncStorage.getItem(STORAGE_KEY_VOLUME);
      if (volumeSalvo !== null) {
        setVolumeAlerta(parseInt(volumeSalvo));
        console.log(`✅ Volume carregado: ${volumeSalvo}%`);
      }

      // Carrega troca automática
      const trocaSalva = await AsyncStorage.getItem(STORAGE_KEY_TROCA);
      if (trocaSalva !== null) {
        setTrocaAutomatica(trocaSalva === 'true');
      }

      // Configura áudio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });
    } catch (error) {
      console.log('Erro ao carregar:', error);
    }
  };

  // ✅ SALVAR VOLUME
  const salvarVolume = async (novoVolume) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_VOLUME, novoVolume.toString());
      console.log(`💾 Volume salvo: ${novoVolume}%`);
    } catch (error) {
      console.error('Erro ao salvar volume:', error);
    }
  };

  // ✅ SALVAR TROCA AUTOMÁTICA
  const salvarTrocaAutomatica = async (valor) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_TROCA, valor.toString());
      console.log(`💾 Troca salva: ${valor}`);
    } catch (error) {
      console.error('Erro ao salvar troca:', error);
    }
  };

  const alterarVolumeDispositivo = async (novoVolume) => {
    try {
      setVolumeAlerta(novoVolume);
      const volumeDecimal = novoVolume / 100;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/beep.mp3'),
        { 
          shouldPlay: false,
          volume: volumeDecimal 
        }
      );

      await salvarVolume(novoVolume); // ✅ SALVA AQUI
      console.log(`Volume ajustado para: ${novoVolume}%`);

      await sound.unloadAsync();
    } catch (error) {
      console.log('Erro ao alterar volume:', error);
    }
  };

  const testarSom = async () => {
    try {
      const volumeDecimal = volumeAlerta / 100;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/beep.mp3'),
        { 
          shouldPlay: true,
          volume: volumeDecimal 
        }
      );

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });

      Alert.alert('🔊 Som de teste', `Tocando alerta com volume ${volumeAlerta}%`);
    } catch (error) {
      console.log('Erro ao testar som:', error);
      Alert.alert('Erro', 'Não foi possível tocar o som de teste.');
    }
  };

  return (
    <FundoDegrade>
      <StatusBar hidden={true} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={30} color="#fff" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Ionicons name="settings" size={60} color="#FFA85A" />
            <Text style={[style.titulo, styles.titulo]}>Configurações</Text>
            <Text style={styles.subtitulo}>Ajuste as preferências do app</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.configItem}>
              <View style={styles.configTextoContainer}>
                <Ionicons name="images" size={24} color="#FFA85A" />
                <View style={styles.configTexto}>
                  <Text style={styles.configTitulo}>Troca automática de imagem</Text>
                  <Text style={styles.configDescricao}>
                    Alterna automaticamente entre as câmeras
                  </Text>
                </View>
              </View>
              
              <Switch
                value={trocaAutomatica}
                onValueChange={async (valor) => {
                  setTrocaAutomatica(valor);
                  await salvarTrocaAutomatica(valor); // ✅ SALVA AQUI
                }}
                trackColor={{ false: '#767577', true: '#FFA85A' }}
                thumbColor={trocaAutomatica ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.divisor} />

            <View style={styles.configItem}>
              <View style={styles.configTextoContainer}>
                <Ionicons name="volume-high" size={24} color="#FFA85A" />
                <View style={styles.configTexto}>
                  <Text style={styles.configTitulo}>Volume do alerta</Text>
                  <Text style={styles.configDescricao}>
                    Ajuste o volume dos alertas do app
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.sliderContainer}>
              <Ionicons name="volume-mute" size={20} color="#BDC4D4" />
              
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                value={volumeAlerta}
                onValueChange={(valor) => {
                  setVolumeAlerta(valor);
                }}
                onSlidingComplete={(valor) => {
                  alterarVolumeDispositivo(valor); // ✅ Salva quando solta
                }}
                minimumTrackTintColor="#FFA85A"
                maximumTrackTintColor="#BDC4D4"
                thumbTintColor="#FFA85A"
              />
              
              <Ionicons name="volume-high" size={20} color="#BDC4D4" />
            </View>

            <Text style={styles.volumeTexto}>
              Volume: {Math.round(volumeAlerta)}%
            </Text>

            <TouchableOpacity 
              style={styles.botaoTestar}
              onPress={testarSom}
            >
              <Ionicons name="play-circle" size={20} color="#fff" />
              <Text style={styles.botaoTestarTexto}>Testar som de alerta</Text>
            </TouchableOpacity>

            <View style={styles.avisoContainer}>
              <Ionicons name="information-circle" size={20} color="#4169E1" />
              <Text style={styles.avisoTexto}>
                Este volume controla os alertas e sons do SafeView. 
                Suas configurações são salvas automaticamente.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={styles.botaoMenuFixo}
        onPress={() => setMenuVisible(true)}
      >
        <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
      </TouchableOpacity>

      <MenuModal 
        visible={menuVisible} 
        onClose={() => setMenuVisible(false)}
        telaAtual="Configuracoes"
      />
    </FundoDegrade>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  container: {
    flex: 1,
    paddingTop: 20,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 0,
    zIndex: 999,
    padding: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 60,
  },
  titulo: {
    fontSize: 28,
    marginTop: 10,
    marginBottom: 5,
  },
  subtitulo: {
    fontSize: 14,
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
    marginBottom: 20,
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  configTextoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  configTexto: {
    marginLeft: 15,
    flex: 1,
  },
  configTitulo: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  configDescricao: {
    fontSize: 12,
    color: '#BDC4D4',
    lineHeight: 16,
  },
  divisor: {
    height: 1,
    backgroundColor: '#ada8a836',
    marginVertical: 20,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
    height: 40,
  },
  volumeTexto: {
    fontSize: 16,
    color: '#FFA85A',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  //  NOVO: Botão para testar som
  botaoTestar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4169E1',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 15,
  },
  botaoTestarTexto: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  //  NOVO: Aviso sobre o volume
  avisoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(65, 105, 225, 0.2)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#4169E1',
    marginTop: 10,
  },
  avisoTexto: {
    flex: 1,
    marginLeft: 10,
    fontSize: 12,
    color: '#BDC4D4',
    lineHeight: 16,
  },
  botaoMenuFixo: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#4B5563',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 999,
  },
});