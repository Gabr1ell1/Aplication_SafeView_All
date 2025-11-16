import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons'; 

const Input = React.forwardRef(({
  label = '',
  placeholder = '',
  value,
  onChangeText,
  secureTextEntry = false,
  ...props
}, ref) => {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const isSenha = secureTextEntry;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <LinearGradient
        colors={['#FF8C00', '#4169E1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bordaGradient}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#ccc"
            value={value}
            onChangeText={onChangeText}
            ref={ref}
            secureTextEntry={secureTextEntry && !mostrarSenha}
            {...props}
          />

          {isSenha && (
            <TouchableOpacity
              style={styles.icon}
              onPress={() => setMostrarSenha(!mostrarSenha)}
            >
              <Ionicons
                name={mostrarSenha ? 'eye-off' : 'eye'}
                size={20}
                color="#ccc"
              />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </View>
  );
});

export default Input;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 12,
  },
  label: {
    color: '#fff',
    marginBottom: 6,
    fontSize: 14,
  },
  bordaGradient: {
    borderRadius: 10,
    padding: 2,
  },
  inputContainer: {
    backgroundColor: '#1E2A38',
    borderRadius: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
     height: 50,
     flex: 1,
     color: '#fff',
     paddingVertical: 10,
  },
  icon: {
    paddingHorizontal: 8,
  },
});
