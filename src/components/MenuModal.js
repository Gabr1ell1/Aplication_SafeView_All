import React from "react";
import { 
  Modal, 
  Pressable, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function MenuModal({ visible, onClose, telaAtual }) {
  const navigation = useNavigation();

  // Função para navegar e fechar o modal
  const navegarPara = (tela) => {
    onClose(); // Fecha o modal primeiro
    navigation.navigate(tela); // Depois navega
  };

  // Define quais botões mostrar baseado na tela atual
  const renderizarBotoes = () => {
    switch (telaAtual) {
      case 'TelaInicial':
        // Se estiver na Tela Inicial, mostra: Perfil e Configurações
        return (
          <>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => navegarPara('Perfil')}
            >
              <Ionicons name="person" size={24} color="white" />
              <Text style={styles.menuText}>Meu perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => navegarPara('Configuracoes')}
            >
              <Ionicons name="settings" size={24} color="white" />
              <Text style={styles.menuText}>Configurações</Text>
            </TouchableOpacity>
          </>
        );

      case 'Perfil':
        // Se estiver no Perfil, mostra: Tela Inicial e Configurações
        return (
          <>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => navegarPara('TelaInicial')}
            >
              <Ionicons name="home" size={24} color="white" />
              <Text style={styles.menuText}>Tela Inicial</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => navegarPara('Configuracoes')}
            >
              <Ionicons name="settings" size={24} color="white" />
              <Text style={styles.menuText}>Configurações</Text>
            </TouchableOpacity>
          </>
        );

      case 'Configuracoes':
        // Se estiver em Configurações, mostra: Tela Inicial e Perfil
        return (
          <>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => navegarPara('TelaInicial')}
            >
              <Ionicons name="home" size={24} color="white" />
              <Text style={styles.menuText}>Tela Inicial</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => navegarPara('Perfil')}
            >
              <Ionicons name="person" size={24} color="white" />
              <Text style={styles.menuText}>Meu perfil</Text>
            </TouchableOpacity>
          </>
        );

      default:
        // Padrão caso não reconheça a tela
        return (
          <>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => navegarPara('Perfil')}
            >
              <Ionicons name="person" size={24} color="white" />
              <Text style={styles.menuText}>Meu perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => navegarPara('Configuracoes')}
            >
              <Ionicons name="settings" size={24} color="white" />
              <Text style={styles.menuText}>Configurações</Text>
            </TouchableOpacity>
          </>
        );
    }
  };

  return (
    <Modal 
      transparent={true} 
      visible={visible} 
      animationType="fade" 
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.menuContainer}>
          {renderizarBotoes()}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0)",
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  menuContainer: {
    backgroundColor: "#2c3e50",
    padding: 20,
    borderRadius: 10,
    width: 200,
    marginBottom: 60,
    marginRight: 10,
  },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  menuText: {
    color: "white",
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "500",
  },
});