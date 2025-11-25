import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function StatusRow({ onMenuPress }) {
  return (
    <View style={styles.statusRow}>
      <View style={styles.statusItem}>
        <Text style={styles.statusText}>Sensor frontal:</Text>
        <View style={[styles.indicator, { backgroundColor: "green" }]} />
      </View>
      <View style={styles.statusItem}>
        <Text style={styles.statusText}>Sensor lateral:</Text>
        <View style={[styles.indicator, { backgroundColor: "red" }]} />
      </View>
      <View style={styles.statusItem}>
        <Text style={styles.statusText}>Sensor traseiro:</Text>
        <View style={[styles.indicator, { backgroundColor: "yellow" }]} />
      </View>
      <TouchableOpacity onPress={onMenuPress}>
        <Ionicons name="menu-sharp" size={30} color="white" style={styles.menuIcon} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingVertical: 10,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  statusText: {
    fontFamily: "Cairo_500Medium",
    color: "white",
    fontSize: 16,
  },
  indicator: {
    width: 30,
    height: 30,
    borderRadius: 20,
    marginLeft: 6,
  },
  menuIcon: {
    marginLeft: 10,
    backgroundColor: "#52677D",
    borderRadius: 20,
    padding: 5,
  },
});