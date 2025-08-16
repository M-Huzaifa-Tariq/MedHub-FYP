import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  FlatList,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../FireBase/firebase.config";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";

const { width } = Dimensions.get("window");

const DoctorSignup = () => {
  const navigation = useNavigation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [specialization, setSpecialization] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [experience, setExperience] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSpecializationModal, setShowSpecializationModal] = useState(false);
  const [alertModal, setAlertModal] = useState({
    visible: false,
    title: "",
    message: "",
    onClose: null,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, []);

  const specializationList = [
    "Cardiologist",
    "Dermatologist",
    "Neurologist",
    "Pediatrician",
    "Psychiatrist",
    "General Physician",
    "Orthopedic Surgeon",
    "ENT Specialist",
    "Gynecologist",
    "Radiologist",
    "Urologist",
    "Dentist",
  ];

  const validateLicense = (license) => /^\d{5,7}$/.test(license);

  const showCustomAlert = (
    title,
    message,
    onClose = () => setAlertModal({ ...alertModal, visible: false })
  ) => {
    setAlertModal({ visible: true, title, message, onClose });
  };

  const handleSignup = async () => {
    if (
      !name ||
      !email ||
      !password ||
      !specialization ||
      !licenseNumber ||
      !experience ||
      !contactNumber
    ) {
      showCustomAlert("Incomplete", "Please fill in all fields.");
      return;
    }

    if (!validateLicense(licenseNumber)) {
      showCustomAlert("Invalid License", "License number must be 5 to 7 digits.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);

      await setDoc(doc(db, "doctors", user.uid), {
        uid: user.uid,
        name: "Dr. " + name.trim(),
        email,
        specialization,
        licenseNumber,
        experience,
        contactNumber,
        role: "doctor",
        emailVerified: false,
      });

      showCustomAlert(
        "Verify Email",
        "A verification email has been sent. Please check your inbox.",
        () => {
          setAlertModal({ ...alertModal, visible: false });
          navigation.goBack();
        }
      );
    } catch (error) {
      showCustomAlert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: fadeAnim, width: "100%" }}>
            <Text style={styles.title}>Doctor Signup</Text>

            {/* Prefixed Dr. */}
            <View style={styles.nameRow}>
              <View style={styles.drPrefix}>
                <Text style={styles.drPrefixText}>Dr.</Text>
              </View>
              <TextInput
                style={styles.nameInput}
                placeholder="Name"
                placeholderTextColor="#ccc"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Other Inputs */}
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#ccc"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#ccc"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialCommunityIcons
                  name={showPassword ? "eye-off" : "eye"}
                  size={22}
                  color="#ccc"
                />
              </TouchableOpacity>
            </View>

            {/* Specialization Dropdown */}
            <TouchableOpacity style={styles.dropdown} onPress={() => setShowSpecializationModal(true)}>
              <Text style={specialization ? styles.selectedText : styles.placeholderText}>
                {specialization || "Select Specialization"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#ccc" />
            </TouchableOpacity>

            {/* Specialization Modal with Gradient */}
            <Modal visible={showSpecializationModal} transparent animationType="fade">
              <View style={styles.modalOverlay}>
                <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.modalContent}>
                  <FlatList
                    data={specializationList}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => {
                          setSpecialization(item);
                          setShowSpecializationModal(false);
                        }}
                        style={styles.modalItem}
                      >
                        <Text style={styles.modalItemText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </LinearGradient>
              </View>
            </Modal>

            <TextInput
              style={styles.input}
              placeholder="License Number"
              placeholderTextColor="#ccc"
              keyboardType="numeric"
              value={licenseNumber}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9]/g, "");
                if (cleaned.length <= 7) setLicenseNumber(cleaned);
              }}
              maxLength={7}
            />

            <TextInput
              style={styles.input}
              placeholder="Experience (e.g., 5 years)"
              placeholderTextColor="#ccc"
              value={experience}
              onChangeText={setExperience}
            />

            <TextInput
              style={styles.input}
              placeholder="Contact Number (e.g. 03XX-XXXXXXX)"
              placeholderTextColor="#ccc"
              keyboardType="number-pad"
              value={contactNumber}
              onChangeText={(text) => {
                const digitsOnly = text.replace(/\D/g, "");
                let formatted = digitsOnly;
                if (formatted.length > 4) {
                  formatted = formatted.slice(0, 4) + "-" + formatted.slice(4);
                }
                if (formatted.length <= 12) {
                  setContactNumber(formatted);
                }
              }}
              maxLength={12}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Alert Modal */}
      <Modal visible={alertModal.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>{alertModal.title}</Text>
            <Text style={styles.alertMessage}>{alertModal.message}</Text>
            <TouchableOpacity
              style={styles.alertButton}
              onPress={alertModal.onClose}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

export default DoctorSignup;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    paddingHorizontal: 25,
    alignItems: "center",
  },
  title: {
    fontSize: width * 0.08,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "#ffffff20",
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 15,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#ffffff40",
  },
  nameRow: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 15,
  },
  drPrefix: {
    backgroundColor: "#ffffff30",
    paddingHorizontal: 14,
    paddingVertical: 12.5,
    justifyContent: "center",
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderWidth: 1,
    borderColor: "#ffffff40",
  },
  drPrefixText: {
    fontSize: 16,
    color: "#fff",
  },
  nameInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#fff",
    backgroundColor: "#ffffff20",
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 1,
    borderColor: "#ffffff40",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
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
    width: "100%",
    backgroundColor: "#ffffff20",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ffffff40",
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedText: {
    fontSize: 16,
    color: "#fff",
  },
  placeholderText: {
    fontSize: 16,
    color: "#ccc",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalContent: {
    borderRadius: 15,
    padding: 15,
    maxHeight: 350,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  modalItemText: {
    fontSize: 16,
    color: "#fff",
  },
  button: {
    backgroundColor: "#5a8dee",
    paddingVertical: 16,
    borderRadius: 30,
    width: '100%',
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
    letterSpacing: 1,
  },
  alertBox: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 10,
    alignItems: "center",
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#222",
  },
  alertMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#444",
  },
  alertButton: {
    backgroundColor: "#5a8dee",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
});
