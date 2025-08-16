import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { auth, db } from "../../FireBase/firebase.config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
const { width } = Dimensions.get("window");

const specializations = [
  "Cardiologist",
  "Dermatologist",
  "Neurologist",
  "Pediatrician",
  "Psychiatrist",
  "Orthopedic",
  "ENT",
  "General Physician",
];

const DoctorProfile = () => {
  const navigation = useNavigation();
  const [doctor, setDoctor] = useState({
    name: "",
    specialization: "",
    experience: "",
    contactNumber: "",
    email: "",
    licenseNumber: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true); // Start with loading true for data fetch
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [specModalVisible, setSpecModalVisible] = useState(false);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false); // Loading on logout

  useEffect(() => {
    const fetchDoctorData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const docRef = doc(db, "doctors", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            data.email = user.email;
            setDoctor(data);
          }
        } catch (error) {
          setModalMessage("Failed to load data. " + error.message);
          setModalVisible(true);
        }
      }
      setLoading(false); // Data fetch done
    };
    fetchDoctorData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => true;
      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }, [])
  );

  const handleChange = (key, value) => {
    if (key === "contactNumber") {
      const numeric = value.replace(/[^0-9]/g, "");
      let formatted = numeric.slice(0, 4);
      if (numeric.length > 4) {
        formatted += "-" + numeric.slice(4, 11);
      }
      setDoctor((prev) => ({ ...prev, [key]: formatted }));
    } else if (key === "licenseNumber") {
      const numeric = value.replace(/[^0-9]/g, "").slice(0, 7);
      setDoctor((prev) => ({ ...prev, [key]: numeric }));
    } else {
      setDoctor((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setLoading(true);
    try {
      const { email, ...dataWithoutEmail } = doctor;
      const docRef = doc(db, "doctors", user.uid);
      await updateDoc(docRef, dataWithoutEmail);
      setModalMessage("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      setModalMessage("Failed to update profile. " + error.message);
    }
    setModalVisible(true);
    setLoading(false);
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await signOut(auth);
      setLogoutLoading(false);
      navigation.navigate("HomeScreen");
    } catch (error) {
      setModalMessage("Logout failed. Please try again.");
      setModalVisible(true);
      setLogoutLoading(false);
    }
  };

  // Show loading indicator while fetching data or during logout loading
  if (loading) {
    return (
      <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Doctor Profile</Text>

        {renderField("Name", "name")}

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Specialization</Text>
          {isEditing ? (
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setSpecModalVisible(true)}
            >
              <Text style={{ color: doctor.specialization ? "#fff" : "#ccc", flex: 1 }}>
                {doctor.specialization || "Select Specialization"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#ccc" />
            </TouchableOpacity>
          ) : (
            <Text style={styles.info}>{doctor.specialization}</Text>
          )}
        </View>

        {renderField("Experience", "experience")}
        {renderField("Contact Number", "contactNumber", "phone-pad")}
        {renderField("License Number", "licenseNumber", "numeric")}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Email</Text>
          <Text style={[styles.info, { color: "#aaa" }]}>{doctor.email}</Text>
        </View>

        <View style={styles.buttonRow}>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={styles.button}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Save</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#ffffff34" }]}
                onPress={() => setIsEditing(false)}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setIsEditing(true)}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#d9534f" }]}
                onPress={() => setLogoutConfirmVisible(true)}
              >
                <Text style={styles.buttonText}>Logout</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Alert Modal */}
        <Modal transparent visible={modalVisible} animationType="fade">
          <View style={styles.modalOverlay}>
            <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.modalContainer}>
              <Text style={styles.modalMessage}>{modalMessage}</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </Modal>

        {/* Specialization Modal */}
        <Modal visible={specModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Select Specialization</Text>
              {specializations.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.modalOption}
                  onPress={() => {
                    setDoctor((prev) => ({ ...prev, specialization: item }));
                    setSpecModalVisible(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{item}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => setSpecModalVisible(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </Modal>

        {/* Logout Confirmation Modal */}
        <Modal transparent visible={logoutConfirmVisible} animationType="fade">
          <View style={styles.modalOverlay}>
            <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.modalContainer}>
              <Text style={styles.modalTitle}> Confirm Logout </Text>
              <Text style={styles.modalMessage}>Are you sure you want to logout?</Text>
              {logoutLoading ? (
                <ActivityIndicator size="large" color="#fff" style={{ marginVertical: 20 }} />
              ) : (
                <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                  <TouchableOpacity
                    style={[styles.modalButton, { flex: 1, marginRight: 5, backgroundColor: "#aaa", borderRadius: 50 }]}
                    onPress={() => setLogoutConfirmVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { flex: 1, marginLeft: 5, backgroundColor: "#d9534f", borderRadius: 50 }]}
                    onPress={async () => {
                      setLogoutLoading(true);
                      await handleLogout();
                      setLogoutConfirmVisible(false);
                    }}
                  >
                    <Text style={styles.modalButtonText}>Logout</Text>
                  </TouchableOpacity>
                </View>
              )}
            </LinearGradient>
          </View>
        </Modal>
      </ScrollView>
    </LinearGradient>
  );

  function renderField(label, key, keyboardType = "default") {
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>{label}</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={doctor[key]}
            onChangeText={(text) => handleChange(key, text)}
            placeholder={label}
            keyboardType={keyboardType}
            placeholderTextColor="#aaa"
          />
        ) : (
          <Text style={styles.info}>{doctor[key]}</Text>
        )}
      </View>
    );
  }
};

export default DoctorProfile;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#192f6a",
  },
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: width * 0.07,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 30,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    color: "#eee",
    fontSize: 15,
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#ffffff20",
    color: "#fff",
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ffffff40",
  },
  info: {
    fontSize: 16,
    color: "#fff",
    paddingVertical: 8,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  button: {
    flex: 1,
    backgroundColor: "#5a8dee",
    paddingVertical: 14,
    marginHorizontal: 6,
    borderRadius: 30,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 1,
  },
  dropdown: {
    backgroundColor: "#ffffff20",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ffffff40",
    flexDirection: "row",
    alignItems: "center",
  },
  dropdownIcon: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000099",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    backgroundColor: "#4c669f",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 15,
  },
  modalMessage: {
    fontSize: 16,
    color: "#eee",
    textAlign: "center",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#5a8dee",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginTop: 10,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 1,
  },
  modalOption: {
    paddingVertical: 12,
    borderBottomColor: "#ffffff60",
    borderBottomWidth: 1,
    width: "100%",
  },
  modalOptionText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
  modalCancel: {
    marginTop: 15,
    color: "#aaa",
    fontSize: 16,
    textAlign: "center",
  },
});
