import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  LayoutAnimation,
  UIManager,
  Platform,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { db } from "../FireBase/firebase.config";
import {
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import LinearGradient from "react-native-linear-gradient";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CustomAlertModal = ({ visible, title, message, buttons }) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.customAlertOverlay}>
      <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.customAlertContainer}>
        <Text style={styles.customAlertTitle}>{title}</Text>
        <Text style={styles.customAlertMessage}>{message}</Text>
        <View style={styles.customAlertButtons}>
          {buttons.map(({ text, onPress, style }, i) => (
            <TouchableOpacity
              key={i}
              onPress={onPress}
              style={[styles.customAlertButton, style, i !== 0 && { marginLeft: 12 }]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.customAlertButtonText,
                  style?.backgroundColor ? { color: "#fff" } : { color: "#1976d2" },
                ]}
              >
                {text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>
    </View>
  </Modal>

);

const DoctorSlotBooking = () => {
  const route = useRoute();
  const { doctor } = route.params;
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);
  const [bookedSlots, setBookedSlots] = useState({});
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertButtons, setAlertButtons] = useState([]);

  const fetchPatientName = async () => {
    try {
      if (!userId) return "Unknown";
      const ref = doc(db, "patients", userId);
      const snap = await getDoc(ref);
      return snap.exists() ? snap.data().name || "Unknown" : "Unknown";
    } catch {
      return "Unknown";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!doctor?.id) return;
        const q = query(collection(db, "doctors", doctor.id, "availableSlots"));
        const qs = await getDocs(q);
        const formatted = qs.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          slots: doc.data().slots.sort((a, b) => a.time.localeCompare(b.time)),
        }));
        setSlots(formatted);

        const appointmentSnap = await getDocs(collection(db, "appointments"));
        const booked = {};
        appointmentSnap.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.doctorId === doctor.id) {
            if (!booked[data.day]) booked[data.day] = [];
            booked[data.day].push(data.time);
          }
        });
        setBookedSlots(booked);
      } catch (err) {
        showAlert("Error", "Failed to load slots.", [{ text: "OK", onPress: () => setAlertVisible(false) }]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [doctor]);

  const showAlert = useCallback((title, message, buttons) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertButtons(buttons);
    setAlertVisible(true);
  }, []);

  const handleSlotSelect = (day) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedDay((prev) => (prev === day ? null : day));
  };

  const handleConfirmSlot = async () => {
    try {
      if (!selectedDay || !selectedSlot) return;
      const isBooked = bookedSlots[selectedDay]?.includes(selectedSlot.time);
      if (isBooked) {
        showAlert("Already Booked", "This slot has already been booked.", [{ text: "OK", onPress: () => setAlertVisible(false) }]);
        return;
      }

      const patientName = await fetchPatientName();
      showAlert("Confirm Slot", `Book ${selectedSlot.time} on ${selectedDay}?`, [
        { text: "Cancel", onPress: () => setAlertVisible(false) },
        {
          text: "Confirm",
          onPress: async () => {
            setAlertVisible(false);
            const ref = doc(db, "appointments", `${userId}_${doctor.id}_${selectedDay}_${selectedSlot.time}`);
            await setDoc(ref, {
              patientId: userId,
              patientName,
              doctorId: doctor.id,
              doctorName: doctor.name,
              time: selectedSlot.time,
              day: selectedDay,
              bookedAt: new Date().toISOString(),
            });
            showAlert("Success", "Slot successfully booked.", [
              {
                text: "OK",
                onPress: () => {
                  setShowSlotModal(false);
                  setSelectedDay(null);
                  setSelectedSlot(null);
                  setAlertVisible(false);
                },
                style: styles.confirmBtnStyle,
              },
            ]);
            setBookedSlots((prev) => ({
              ...prev,
              [selectedDay]: [...(prev[selectedDay] || []), selectedSlot.time],
            }));
          },
          style: styles.confirmBtnStyle,
        },
      ]);
    } catch (err) {
      showAlert("Error", "Something went wrong.", [{ text: "OK", onPress: () => setAlertVisible(false) }]);
    }
  };

  const renderSlotCard = ({ item }) => {
    const isExpanded = expandedDay === item.day;
    return (
      <TouchableOpacity
        style={[styles.card, isExpanded && styles.cardExpanded]}
        onPress={() => handleSlotSelect(item.day)}
        activeOpacity={0.9}
      >
        <Text style={styles.dayText}>{item.day}</Text>
        {isExpanded && (
          <View style={styles.expandedSection}>
            <TouchableOpacity
              style={styles.selectBtn}
              onPress={() => {
                setSelectedDay(item.day);
                setShowSlotModal(true);
              }}
            >
              <Text style={styles.selectText}>Select Slot</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.gradient}>
      <View style={styles.container}>
        <Text style={styles.title}>Book an Appointment</Text>
        <Text style={styles.subtitle}>with {doctor?.name}</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : slots.length > 0 ? (
          <FlatList
            data={slots}
            keyExtractor={(item) => item.id}
            renderItem={renderSlotCard}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <Text style={styles.noSlotsText}>No available slots.</Text>
        )}

        <Modal visible={showSlotModal} animationType="fade" transparent>
          <View style={styles.modalOverlay}>
            <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.modalTitleGradient}>
              <View style={styles.modalContainer}>

                <Text style={styles.modalTitle}>Select a slot for {selectedDay}</Text>

                {slots.find((s) => s.day === selectedDay)?.slots.map((slot, i) => {
                  const isBooked = bookedSlots[selectedDay]?.includes(slot.time);
                  const isSelected = selectedSlot?.time === slot.time;
                  return (
                    <TouchableOpacity
                      key={i}
                      style={[styles.slotBtn, isBooked && styles.slotBooked, isSelected && !isBooked && styles.slotSelected]}
                      disabled={isBooked}
                      onPress={() => setSelectedSlot(slot)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.slotText, isBooked && { color: "#aaa" }]}> {slot.time} {isBooked ? "(Booked)" : ""}</Text>
                    </TouchableOpacity>
                  );
                })}
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalButton} onPress={handleConfirmSlot}>
                    <Text style={styles.modalButtonText}>Confirm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: "#999" }]}
                    onPress={() => setShowSlotModal(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </View>
        </Modal>

        <CustomAlertModal
          visible={alertVisible}
          title={alertTitle}
          message={alertMessage}
          buttons={alertButtons}
        />
      </View>
    </LinearGradient>
  );
};

export default DoctorSlotBooking;

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, padding: 20 },
  title: { marginTop:30,fontSize: 25, fontWeight: "bold", color: "#fff", textAlign: "center" },
  subtitle: { fontSize: 18, fontWeight: "600", color: "#eee", textAlign: "center", marginBottom: 16 },
  card: {
    backgroundColor: "#ffffff20",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ffffff30",
  },
  cardExpanded: { backgroundColor: "#ffffff30" },
  dayText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  expandedSection: { marginTop: 10 },
  selectBtn: {
    backgroundColor: "#3b5998",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  selectText: { color: "#fff", fontWeight: "bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modalContainer: {
    width: "85%",
    padding: 20,
    borderRadius: 25,
    alignItems: "center",
    backgroundColor: "transparent", // NEW
  },
  customAlertContainer: {
    width: "80%",
    padding: 20,
    borderRadius: 22,
    backgroundColor: "transparent", // NEW
  },
  modalTitleGradient: {
    width: "85%",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  slotBtn: {
    backgroundColor: "#ffffff20", // Transparent-like background for gradient card feel
    borderWidth: 1,
    borderColor: "#ffffff30",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginVertical: 6,
    width: "100%",
  },
  slotSelected: {
    backgroundColor: "#4c669f", // Gradient base color
    borderColor: "#fff",
    borderWidth: 1.2,
  },
  slotBooked: {
    backgroundColor: "#555", // More readable booked style with contrast
    opacity: 0.6,
  },
  slotText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },
  modalActions: { flexDirection: "row", marginTop: 16 },
  modalButton: {
    backgroundColor: "#1976d2",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 20,
  },
  modalButtonText: { color: "#fff", fontSize:16,fontWeight: "bold" },
  noSlotsText: { color: "#ccc", textAlign: "center", marginTop: 20 },
  customAlertOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  customAlertContainer: { backgroundColor: "#ffffff40", padding: 20, borderRadius: 22, width: "80%" },
  customAlertTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  customAlertMessage: { color: "#fff", fontSize: 16, marginBottom: 20, textAlign: "center" },
  customAlertButtons: { flexDirection: "row", justifyContent: "center" },
  customAlertButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1976d2",
    alignItems: "center",
  },
  customAlertButtonText: { fontSize: 16, fontWeight: "bold" },
  confirmBtnStyle: { backgroundColor: "#1976d2", borderColor: "#1976d2" },
});