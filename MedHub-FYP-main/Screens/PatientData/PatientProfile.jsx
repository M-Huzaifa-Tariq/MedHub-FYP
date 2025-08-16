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

const genderOptions = ["Male", "Female"];
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const PatientProfile = () => {
  const navigation = useNavigation();
  const [patient, setPatient] = useState({
    name: "",
    age: "",
    gender: "",
    bloodGroup: "",
    contact: "",
    email: "",
    address: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [genderModal, setGenderModal] = useState(false);
  const [bloodModal, setBloodModal] = useState(false);
  const [logoutConfirmModal, setLogoutConfirmModal] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (user) {
        const snap = await getDoc(doc(db, "patients", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          data.email = user.email;
          setPatient(data);
        }
      }
    };
    fetchData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => true;
      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }, [])
  );

  const handleChange = (key, value) => {
    if (key === "contact") {
      const numeric = value.replace(/[^0-9]/g, "").slice(0, 11);
      let formatted = numeric.slice(0, 4);
      if (numeric.length > 4) {
        formatted += "-" + numeric.slice(4);
      }
      setPatient((prev) => ({ ...prev, [key]: formatted }));
    } else {
      setPatient((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setLoading(true);
    try {
      const { email, ...dataToSave } = patient;
      await updateDoc(doc(db, "patients", user.uid), dataToSave);
      setModalMessage("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      setModalMessage("Failed to update profile. " + error.message);
    }
    setModalVisible(true);
    setLoading(false);
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      navigation.navigate("HomeScreen");
    } catch (error) {
      setModalMessage("Logout failed. Please try again.");
      setModalVisible(true);
    }
    setLoading(false);
  };

  return (
    <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Patient Profile</Text>

        {renderField("Full Name", "name")}
        {renderField("Age", "age", "numeric")}

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Gender</Text>
          {isEditing ? (
            <TouchableOpacity style={styles.dropdown} onPress={() => setGenderModal(true)}>
              <Text style={{ color: patient.gender ? "#fff" : "#ccc" }}>
                {patient.gender || "Select Gender"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#ccc" />
            </TouchableOpacity>
          ) : (
            <Text style={styles.info}>{patient.gender}</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Blood Group</Text>
          {isEditing ? (
            <TouchableOpacity style={styles.dropdown} onPress={() => setBloodModal(true)}>
              <Text style={{ color: patient.bloodGroup ? "#fff" : "#ccc" }}>
                {patient.bloodGroup || "Select Blood Group"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#ccc" />
            </TouchableOpacity>
          ) : (
            <Text style={styles.info}>{patient.bloodGroup}</Text>
          )}
        </View>

        {renderField("Contact Number", "contact", "phone-pad")}
        {renderField("Address", "address")}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Email</Text>
          <Text style={[styles.info, { color: "#aaa" }]}>{patient.email}</Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={isEditing ? handleSave : () => setIsEditing(true)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{isEditing ? "Save" : "Edit"}</Text>
            )}
          </TouchableOpacity>

          {isEditing ? (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#6c757d" }]}
              onPress={() => setIsEditing(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#d9534f" }]}
              onPress={() => setLogoutConfirmModal(true)}
            >
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Message Modal */}
        <Modal transparent visible={modalVisible} animationType="fade">
          <View style={styles.modalOverlay}>
            <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.modalContainer}>
              <View >
                <Text style={styles.modalTitle}>Success</Text>
                <Text style={styles.modalMessage}>{modalMessage}</Text>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </Modal>

        {/* Logout Confirmation Modal */}
        <Modal transparent visible={logoutConfirmModal} animationType="fade">
          <View style={styles.modalOverlay}>
            <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Confirm Logout</Text>
              <Text style={styles.modalMessage}>Are you sure you want to log out?</Text>

              <View style={styles.logoutButtonRow}>
                <TouchableOpacity
                  style={[styles.logoutmodalButton, { backgroundColor: "#d9534f", marginRight: 8 }]}
                  onPress={() => {
                    setLogoutConfirmModal(false);
                    handleLogout();
                  }}
                >
                  <Text style={styles.logoutmodalButtonText}>Logout</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.logoutmodalButton, { backgroundColor: "#5a8dee", marginLeft: 8 }]}
                  onPress={() => setLogoutConfirmModal(false)}
                >
                  <Text style={styles.logoutmodalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </Modal>

        {/* Gender Modal */}
        <Modal transparent visible={genderModal} animationType="fade">
          <View style={styles.modalOverlay}>
            <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.modalContainer}>
              <View>
                <Text style={styles.modalTitle}>Select Gender</Text>
                {genderOptions.map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={styles.modalOption}
                    onPress={() => {
                      setPatient((prev) => ({ ...prev, gender: g }));
                      setGenderModal(false);
                    }}
                  >
                    <Text style={styles.modalOptionText}>{g}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={() => setGenderModal(false)}>
                  <Text style={styles.GmodalCancel}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </Modal>

        {/* Blood Group Modal */}
        <Modal transparent visible={bloodModal} animationType="fade">
          <View style={styles.modalOverlay}>
            <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.modalContainer}>
              <View >
                <Text style={styles.modalTitle}>Select Blood Group</Text>
                {bloodGroups.map((bg) => (
                  <TouchableOpacity
                    key={bg}
                    style={styles.modalOption}
                    onPress={() => {
                      setPatient((prev) => ({ ...prev, bloodGroup: bg }));
                      setBloodModal(false);
                    }}
                  >
                    <Text style={styles.modalOptionText}>{bg}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={() => setBloodModal(false)}>
                  <Text style={styles.modalCancel}>Cancel</Text>
                </TouchableOpacity>
              </View>
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
            value={patient[key]}
            onChangeText={(text) => handleChange(key, text)}
            placeholder={label}
            keyboardType={keyboardType}
            placeholderTextColor="#aaa"
          />
        ) : (
          <Text style={styles.info}>{patient[key]}</Text>
        )}
      </View>
    );
  }
};

export default PatientProfile;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: width * 0.07,
    marginTop: 30,
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
  paddingHorizontal: 14,
  paddingVertical: 12,
  borderWidth: 1,
  borderColor: "#ffffff40",
  flexDirection: "row",
  justifyContent: "space-between", 
  alignItems: "center",            
},
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    padding: 25,
    borderRadius: 16,
    width: "80%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ffffff30",
  },
  modalMessage: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: "#5a8dee",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 18,
    color: "#fff",
  },
  modalOption: {
    paddingVertical: 10,
    alignItems: "center",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#fff",
  },
  modalCancel: {
    color: "#ffcccb",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginLeft: 55
  },
  GmodalCancel: {
    color: "#ffcccb",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginLeft: 39
  },
  logoutButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  logoutmodalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
  },
  logoutmodalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  }
});