import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../FireBase/firebase.config";
import LinearGradient from "react-native-linear-gradient";

const { width } = Dimensions.get("window");

const DoctorForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleReset = async () => {
    if (!email) {
      setAlertMessage("Please enter your email address.");
      setAlertVisible(true);
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setAlertMessage("Password reset email sent. Check your inbox.");
    } catch (error) {
      console.error("Reset error:", error);
      setAlertMessage("Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
      setAlertVisible(true);
    }
  };

  return (
    <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.container}>
      <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Reset Access</Text>
        <Text style={styles.subtitle}>Enter your registered email</Text>

        <TextInput
          style={styles.input}
          placeholder="Doctor Email"
          placeholderTextColor="#ccc"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleReset}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send Reset Link</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back to Login</Text>
        </TouchableOpacity>
      </Animated.View>

      <Modal transparent visible={alertVisible} animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.alertBox}>
            <Text style={styles.alertText}>{alertMessage}</Text>
            <TouchableOpacity
              style={styles.alertButton}
              onPress={() => setAlertVisible(false)}
            >
              <Text style={styles.alertButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

export default DoctorForgotPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 25,
  },
  inner: {
    alignItems: "center",
  },
  title: {
    fontSize: width * 0.08,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: width * 0.045,
    color: "#d1d9f8",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "#ffffff20",
    borderColor: "#ffffff40",
    borderWidth: 1,
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    color: "#fff",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#5a8dee",
    borderRadius: 30,
    paddingVertical: 16,
    width: width * 0.75,
    alignItems: "center",
    elevation: 6,
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1,
  },
  backText: {
    color: "#d1d9f8",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertBox: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
    elevation: 5,
  },
  alertText: {
    fontSize: 16,
    color: "#000",
    marginBottom: 20,
    textAlign: "center",
  },
  alertButton: {
    backgroundColor: "#5a8dee",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 8,
  },
  alertButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
