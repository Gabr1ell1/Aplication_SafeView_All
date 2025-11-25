import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import FundoDegrade from '../components/FundoDegrade';
import Input from '../components/Input';
import Select from '../components/Select';

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

  const [nome, setNome] = useState(dadosUsuario.nome);
  const [ano, setAno] = useState(dadosUsuario.ano);
  const [loading, setLoading] = useState(false);

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
    <FundoDegrade style={['#2C3E50', '#1A2332']}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={Platform.OS === 'ios' ? 100 : 20}
      >
        <View style={styles.container}>
          <Text style={styles.titulo}>Alterando informações...</Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={{ color: '#fff', marginTop: 10 }}>
                Salvando alterações...
              </Text>
            </View>
          ) : (
            <View style={styles.card}>
              {/* ✅ LINHA 1: Nome + Marca */}
              <View style={styles.linha}>
                <View style={styles.colunaEsquerda}>
                  <Text style={styles.labelnome}>Nome:</Text>
                  <Input
                    placeholder="EXEMPLO..."
                    value={nome}
                    onChangeText={setNome}
                  />
                </View>

                <View style={styles.colunaDireita}>
                  <Text style={styles.label}>Marca/Modelo:</Text>
                  <Select
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
                </View>
              </View>

              {/* ✅ LINHA 2: Data + Modelo */}
              <View style={styles.linha}>
                <View style={styles.colunaEsquerda}>
                  <Text style={styles.labelDt}>Data de nascimento:</Text>
                  <Input
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
                    keyboardType="numeric"
                  />
                </View>

                {/* Modelo (aparece depois de escolher marca) */}
                {marca !== '' && marca !== 'Outro' && (
                  <View style={styles.colunaDireita}>
                    <Text style={styles.label}>Modelo:</Text>
                    <Select
                      selectedValue={modelo}
                      onValueChange={setModelo}
                      options={modelosDisponiveis.map((mod) => ({ 
                        label: mod, 
                        value: mod 
                      }))}
                    />
                  </View>
                )}

                {/* Campo de texto se escolher "Outro" */}
                {marca === 'Outro' && (
                  <View style={styles.colunaDireita}>
                    <Text style={styles.label}>Digite a Marca/Modelo:</Text>
                    <Input
                      placeholder="Volvo FH"
                      value={outro}
                      onChangeText={setOutro}
                    />
                  </View>
                )}
              </View>

              {/* Botões */}
              <View style={styles.botoesContainer}>
                <TouchableOpacity 
                  style={styles.botaoCancelar}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.botaoConfirmar}
                  onPress={salvarAlteracoes}
                >
                  <Text style={styles.botaoConfirmarTexto}>Confirmar</Text>
                </TouchableOpacity>
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
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  titulo: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '400',
    marginBottom: 30,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 750,
    backgroundColor: '#334155',
    borderRadius: 20,
    padding: 40,
  },
  //  CADA LINHA É UM CONTAINER FLEXBOX
  linha: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 40,
  },
  //  COLUNA ESQUERDA (50% - 10px)
  colunaEsquerda: {
    flex: 1,
  },
  //  COLUNA DIREITA (50% - 10px)
  colunaDireita: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
  },
  labelnome: {
    fontSize: 14,
    color: '#fff',
    marginBottom: -15,
  },
    labelDt: {
    fontSize: 14,
    color: '#fff',
    marginBottom: -15,
  },
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 30,
  },
  botaoCancelar: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    minWidth: 150,
  },
  botaoCancelarTexto: {
    color: '#1F2937',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  botaoConfirmar: {
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    minWidth: 150,
  },
  botaoConfirmarTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
});