import React from "react";
import { ScrollView, View, Text, Image, StyleSheet } from "react-native";
export default function CameraCarousel({ data, screenWidth }) {
  return (
    <View style={styles.content}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={screenWidth * 0.85}
        contentContainerStyle={styles.scrollContent}
      >
        {data.map((item) => (
          <View
            key={item.id}
            style={[styles.cameraItem, { width: screenWidth * 0.85 }]}
          >
            <Text style={styles.cameraLabel}>{item.label}</Text>
            <Image source={item.source} style={styles.cameraImage} resizeMode="cover" />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  scrollContent: {
    paddingLeft: 20,
  },
  cameraItem: {
    height: "90%",
    justifyContent: "flex-start",
    alignItems: "center",
    marginRight: 20,
  },
  cameraLabel: {
    fontFamily: "Cairo_500Medium",
    color: "white",
    marginBottom: 4,
    fontSize: 16,
    textAlign: "left",
  },
  cameraImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
});