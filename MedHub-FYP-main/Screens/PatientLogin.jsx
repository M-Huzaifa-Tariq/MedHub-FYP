import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Animated,
  Dimensions,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../FireBase/firebase.config";

const { width } = Dimensions.get("window");

const PatientLogin = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertTitle, setAlertTitle] = useState("");


  const fadeAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(formAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };


  const handlePatientLogin = async () => {
  if (!email || !password) {
    showAlert("Missing Fields", "Please enter both email and password.");
    return;
  }

  setLoading(true);

  try {
    await signInWithEmailAndPassword(auth, email, password);
    navigation.navigate("PatientDashboard");
  } catch (error) {
    console.log("Login Error:", error);
    console.log("Error Code:", error.code);

    switch (error.code) {
      case "auth/invalid-credential":
        showAlert("Login Error", "Incorrect email or password.");
        break;

      case "auth/network-request-failed":
        showAlert("Network Error", "Please check your internet connection.");
        break;

      case "auth/invalid-email":
        showAlert("Email Error", "The email format is invalid.");
        break;

      default:
        showAlert("Unexpected Error", "Something went wrong. Try again.");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.container}>
      <Animated.View style={[styles.formWrapper, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Patient Login</Text>
      </Animated.View>

      <Animated.View style={{ opacity: formAnim, width: "100%", alignItems: "center" }}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#ccc"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor="#ccc"
            secureTextEntry={secureText}
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setSecureText(!secureText)}>
            <MaterialCommunityIcons
              name={secureText ? "eye-off" : "eye"}
              size={24}
              color="#ccc"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handlePatientLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>LOGIN</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("PatientSignup")}>
          <Text style={styles.linkText}>Don't have an account? Sign up</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("PatientForgotPass")}>
          <Text style={styles.linkText}>Forgot Password?</Text>
        </TouchableOpacity>
      </Animated.View>

      <Modal transparent visible={alertVisible} animationType="fade">
        <View style={styles.modalBackground}>
          <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.alertBox}>
            <Text style={styles.modalTitle}>{alertTitle}</Text>
            <Text style={styles.modalMessage}>{alertMessage}</Text>
            <TouchableOpacity
              style={styles.alertButton}
              onPress={() => setAlertVisible(false)}
            >
              <Text style={styles.alertButtonText}>OK</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>

    </LinearGradient>
  );
};

export default PatientLogin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  formWrapper: {
    marginBottom: 30,
    alignItems: "center",
  },
  title: {
    fontSize: width * 0.08,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  input: {
    width: "90%",
    backgroundColor: "#ffffff20",
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 15,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#ffffff40",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    backgroundColor: "#ffffff20",
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ffffff40",
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    height: 50,
  },
  button: {
    backgroundColor: "#5a8dee",
    borderRadius: 30,
    paddingVertical: 16,
    width: width * 0.7,
    alignItems: "center",
    marginBottom: 15,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1,
  },
  linkText: {
    color: "#d1d9f8",
    fontSize: 14,
    marginTop: 8,
    textDecorationLine: "underline",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertBox: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 14,
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
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 8,
  },
  alertButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },

});
