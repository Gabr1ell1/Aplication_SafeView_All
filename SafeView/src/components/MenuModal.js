import React from 'react';
import { Modal, Pressable, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function MenuModal({ visible, onClose }) {
    const navigation = useNavigation();
  
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        
        <Pressable style={styles.menuContainer}>
          <TouchableOpacity
              style={styles.menuButton}
              onPress={() => {
                onClose();
                navigation.navigate("Perfil");
              }}
            >
              <Ionicons name="person" size={24} color="white" />
              <Text style={styles.menuText}>Meu perfil</Text>
          </TouchableOpacity>

         <TouchableOpacity
            style={styles.menuButton}
            onPress={() => {
              onClose();
              // navigation.navigate("Configuracoes"); 
            }}
          >
            <Ionicons name="settings" size={24} color="white" />
            <Text style={styles.menuText}>Configurações</Text>
          </TouchableOpacity>
        </Pressable>

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
    fontFamily: "Cairo_500Medium",
    color: "white",
    marginLeft: 10,
    fontSize: 16,
  },
});
