import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../FireBase/firebase.config";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const { width } = Dimensions.get("window");

const genderOptions = ["Male", "Female"];
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const PatientSignup = () => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [bloodModalVisible, setBloodModalVisible] = useState(false);
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const showAlert = (message) => {
    setAlertMessage(message);
    setAlertModalVisible(true);
  };

  const handleSignup = async () => {
    if (!name || !email || !password || !age || !gender || !bloodGroup || !address || !contact) {
      showAlert("Please fill all fields");
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      showAlert("Please enter a valid email");
      return;
    }

    if (isNaN(age) || parseInt(age) <= 0) {
      showAlert("Please enter a valid age");
      return;
    }

    const contactRegex = /^03[0-9]{2}-[0-9]{7}$/;
    if (!contactRegex.test(contact)) {
      showAlert("Contact must be in format 03xx-xxxxxxx");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);

      const patientData = {
        uid: user.uid,
        name,
        email,
        age,
        gender,
        bloodGroup,
        address,
        contact,
      };

      await setDoc(doc(db, "patients", user.uid), patientData);
      setLoading(false);
      showAlert("Account created! Please verify your email before logging in.");
    } catch (error) {
      setLoading(false);
      showAlert(error.message);
    }
  };

  return (
    <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.gradient}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Patient Signup</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter Full Name"
            placeholderTextColor="#ccc"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter Email"
            placeholderTextColor="#ccc"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor="#ccc"
              secureTextEntry={!passwordVisible}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
              <MaterialCommunityIcons
                name={passwordVisible ? "eye-off" : "eye"}
                size={22}
                color="#ccc"
              />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Age"
            placeholderTextColor="#ccc"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />

          <TouchableOpacity style={styles.dropdown} onPress={() => setGenderModalVisible(true)}>
            <Text style={{ color: gender ? "#fff" : "#ccc" }}>{gender || "Select Gender"}</Text>
            <Ionicons name="chevron-down" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.dropdown} onPress={() => setBloodModalVisible(true)}>
            <Text style={{ color: bloodGroup ? "#fff" : "#ccc" }}>{bloodGroup || "Select Blood Group"}</Text>
            <Ionicons name="chevron-down" size={20} color="#ccc" />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Contact (03xx-xxxxxxx)"
            placeholderTextColor="#ccc"
            value={contact}
            onChangeText={(text) => {
              const digitsOnly = text.replace(/\D/g, "");
              let formatted = digitsOnly.substring(0, 4);
              if (digitsOnly.length > 4) {
                formatted += "-" + digitsOnly.substring(4, 11);
              }
              setContact(formatted);
            }}
            keyboardType="phone-pad"
            maxLength={12}
          />

          <TextInput
            style={styles.input}
            placeholder="Address"
            placeholderTextColor="#ccc"
            value={address}
            onChangeText={setAddress}
          />

          <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
          </TouchableOpacity>

          {/* Gender Modal */}
          <Modal visible={genderModalVisible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.customDropdownContainer}>
                <Text style={styles.customDropdownTitle}>Select Gender</Text>
                {genderOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => {
                      setGender(option);
                      setGenderModalVisible(false);
                    }}
                    style={styles.customDropdownOption}
                  >
                    <Text style={styles.customDropdownOptionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={() => setGenderModalVisible(false)} style={styles.customDropdownButton}>
                  <Text style={styles.customDropdownButtonText}>Cancel</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </Modal>

          {/* Blood Modal */}
          <Modal visible={bloodModalVisible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.customDropdownContainer}>
                <Text style={styles.customDropdownTitle}>Select Blood Group</Text>
                {bloodGroups.map((group) => (
                  <TouchableOpacity
                    key={group}
                    onPress={() => {
                      setBloodGroup(group);
                      setBloodModalVisible(false);
                    }}
                    style={styles.customDropdownOption}
                  >
                    <Text style={styles.customDropdownOptionText}>{group}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={() => setBloodModalVisible(false)} style={styles.customDropdownButton}>
                  <Text style={styles.customDropdownButtonText}>Cancel</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </Modal>

          {/* Alert Modal */}
          <Modal visible={alertModalVisible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.customAlertContainer}>
                <Text style={styles.customAlertTitle}>Alert</Text>
                <Text style={styles.customAlertMessage}>{alertMessage}</Text>
                <TouchableOpacity
                  style={styles.customAlertButton}
                  onPress={() => {
                    setAlertModalVisible(false);
                    if (alertMessage.includes("verify your email")) {
                      navigation.navigate("PatientLogin");
                    }
                  }}
                >
                  <Text style={styles.customAlertButtonText}>OK</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </Modal>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default PatientSignup;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: width * 0.07,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#ffffff20",
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#ffffff40",
    marginBottom: 15,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff20",
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ffffff40",
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    height: 50,
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff20",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ffffff40",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#5a8dee",
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 14,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  modalOption: {
    paddingVertical: 10,
    width: "100%",
    alignItems: "center",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#000",
  },
  modalCancel: {
    color: "#1976d2",
    marginTop: 20,
    fontSize: 16,
    fontWeight: "bold",
  },
  customAlertContainer: {
    width: "80%",
    borderRadius: 16,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    elevation: 5,
  },
  customAlertTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
  },
  customAlertMessage: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  customAlertButton: {
    backgroundColor: "#ffffff30",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  customAlertButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  customDropdownContainer: {
    width: "80%",
    borderRadius: 16,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  customDropdownTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  customDropdownOption: {
    paddingVertical: 10,
    width: "100%",
    alignItems: "center",
  },
  customDropdownOptionText: {
    fontSize: 16,
    color: "#fff",
  },
  customDropdownButton: {
    marginTop: 20,
    backgroundColor: "#ffffff30",
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 20,
  },
  customDropdownButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

});
