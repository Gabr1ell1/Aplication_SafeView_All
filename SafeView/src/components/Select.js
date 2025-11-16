import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const Select = ({ label, selectedValue, onValueChange, options = [] }) => {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <LinearGradient
        colors={['#FF8C00', '#4169E1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bordaGradient}
      >
        <View style={styles.selectContainer}>
          <Picker
            selectedValue={selectedValue}
            onValueChange={onValueChange}
            style={styles.picker}
            dropdownIconColor="#BDC4D4"
          >
            <Picker.Item label="Selecione um veículo" value="" color="#BDC4D4" />
            {options.map((opt) => (
              <Picker.Item
                key={opt.value}
                label={opt.label}
                value={opt.value}
                color="#0F1A2C"
              />
            ))}
          </Picker>
        </View>
      </LinearGradient>
    </View>
  );
};

export default Select;

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
  selectContainer: {
    backgroundColor: '#1E2A38',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  picker: {
    flex: 1,
    height: 50, 
    color: '#fff',
  },
});
