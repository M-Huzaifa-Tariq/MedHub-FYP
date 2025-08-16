// Screens/HomeScreen.jsx

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";

const { width } = Dimensions.get("window");

const HomeScreen = () => {
  const navigation = useNavigation();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(buttonsAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const buttons = [
    { screen: "DoctorLogin", label: "Login as Doctor" },
    { screen: "PatientLogin", label: "Login as Patient" },
  ];

  return (
    <LinearGradient
      colors={["#4c669f", "#3b5998", "#192f6a"]}
      style={styles.container}
    >
      <Animated.View style={[styles.titleContainer, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Welcome to MedHub</Text>
        <Text style={styles.subtitle}>Your health, our priority</Text>
      </Animated.View>

      <Animated.View style={{ opacity: buttonsAnim, marginTop: 30 }}>
        {buttons.map(({ screen, label }, index) => (
          <TouchableOpacity
            key={index}
            style={styles.button}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(screen)}
          >
            <Text style={styles.buttonText}>{label}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </LinearGradient>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: width * 0.08,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: width * 0.04,
    color: "#d1d9f8",
    marginTop: 8,
    fontStyle: "italic",
  },
  button: {
    backgroundColor: "#5a8dee",
    marginVertical: 12,
    paddingVertical: 16,
    borderRadius: 30,
    width: width * 0.7,
    alignItems: "center",
    shadowColor: "#2b4cca",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: width * 0.05,
    letterSpacing: 1,
  },
});
