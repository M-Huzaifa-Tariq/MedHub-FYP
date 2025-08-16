import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../FireBase/firebase.config';
import LinearGradient from 'react-native-linear-gradient';

const DoctorReferralScreen = ({ route, navigation }) => {
  const { patientId, patientName: passedPatientName, doctorId } = route.params;

  const [patientName, setPatientName] = useState(passedPatientName || 'Loading...');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [daysData, setDaysData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [slotsModalVisible, setSlotsModalVisible] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  useEffect(() => {
    const fetchPatientName = async () => {
      if (!passedPatientName) {
        try {
          const snap = await getDoc(doc(db, 'patients', patientId));
          setPatientName(snap.exists() ? snap.data().name : 'Unknown Patient');
        } catch {
          setPatientName('Unknown Patient');
        }
      }
    };
    fetchPatientName();
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const snap = await getDocs(collection(db, 'doctors'));
        const others = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(doc => doc.id !== doctorId);
        setDoctors(others);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchDoctors();
  }, []);

  const handleDoctorSelect = async (doctor) => {
    setSelectedDoctor(doctor);
    setModalVisible(true);
    try {
      const snap = await getDocs(collection(db, 'doctors', doctor.id, 'availableSlots'));
      const days = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDaysData(days);
    } catch (err) {
      console.error('Error fetching days:', err);
    }
  };

  const handleDaySelect = async (dayData) => {
    setSelectedDayData(dayData);
    setAvailableSlots([]);
    setBookedSlots(new Set());
    setSlotsModalVisible(true);
    setLoadingSlots(true);

    try {
      const bookedSnap = await getDocs(
        query(collection(db, 'appointments'), where('doctorId', '==', selectedDoctor.id))
      );
      const bookedSet = new Set(
        bookedSnap.docs
          .filter(doc => doc.data().day === dayData.day)
          .map(doc => doc.data().time)
      );
      setBookedSlots(bookedSet);
      setAvailableSlots(dayData.slots || []);
    } catch (err) {
      console.error('Error loading slots:', err);
    }

    setLoadingSlots(false);
  };

  const handleSlotPress = (time) => {
    setSelectedSlot(time);
    setConfirmModalVisible(true);
  };

  const confirmReferral = async () => {
    try {
      await addDoc(collection(db, 'appointments'), {
        patientId,
        patientName,
        doctorId: selectedDoctor.id,
        bookedAt: new Date().toISOString(),
        day: selectedDayData.day,
        date: selectedDayData.date,
        time: selectedSlot,
        referred: true,
        discountApplied: true,
        referredBy: doctorId,
      });
      setConfirmModalVisible(false);
      setSuccessModalVisible(true);
    } catch (err) {
      console.error('Referral failed:', err);
    }
  };

  return (
    <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Refer {patientName}</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <>
            <Text style={styles.subtitle}>Select a Doctor</Text>
            {doctors.map(doctor => (
              <TouchableOpacity
                key={doctor.id}
                style={styles.doctorCard}
                onPress={() => handleDoctorSelect(doctor)}
              >
                <Text style={styles.doctorName}>{doctor.name}</Text>
                <Text style={styles.specialization}>{doctor.specialization}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      {/* Days Modal (with Gradient) */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Available Days</Text>
            <ScrollView>
              {daysData.map((dayObj, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dayButton}
                  onPress={() => {
                    handleDaySelect(dayObj);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.dayText}>{dayObj.day} ({dayObj.date})</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Pressable onPress={() => setModalVisible(false)}>
              <Text style={styles.cancel}>Cancel</Text>
            </Pressable>
          </LinearGradient>
        </View>
      </Modal>

      {/* Slots Modal (with Gradient) */}
      <Modal visible={slotsModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Slots on {selectedDayData?.day}</Text>
            {loadingSlots ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              availableSlots.map((slot, index) => (
                <TouchableOpacity
                  key={index}
                  disabled={bookedSlots.has(slot.time)}
                  style={[styles.slotButton, bookedSlots.has(slot.time) && styles.bookedSlot]}
                  onPress={() => handleSlotPress(slot.time)}
                >
                  <Text style={styles.slotText}>{slot.time} {bookedSlots.has(slot.time) ? '(Booked)' : ''}</Text>
                </TouchableOpacity>
              ))
            )}
            <Pressable onPress={() => setSlotsModalVisible(false)}>
              <Text style={styles.cancel}>Close</Text>
            </Pressable>
          </LinearGradient>
        </View>
      </Modal>

      {/* Confirmation Modal (with Gradient) */}
      <Modal visible={confirmModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Referral</Text>
            <Text style={styles.confirmText}>Doctor: {selectedDoctor?.name}</Text>
            <Text style={styles.confirmText}>Day: {selectedDayData?.day} ({selectedDayData?.date})</Text>
            <Text style={styles.confirmText}>Time: {selectedSlot}</Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity style={styles.confirmButton} onPress={confirmReferral}>
                <Text style={styles.slotText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setConfirmModalVisible(false)}>
                <Text style={[styles.slotText, { color: '#fff' }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>

      {/* Success Modal (with Gradient) */}
      <Modal visible={successModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Referral Successful</Text>
            <Text style={styles.modalMessage}>Patient referred successfully.</Text>
            <TouchableOpacity
              style={[styles.confirmButton, { marginTop: 10 }]}
              onPress={() => {
                setSuccessModalVisible(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.slotText}>OK</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>
    </LinearGradient>
  );
};

export default DoctorReferralScreen;


const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 12,
    fontWeight: '600',
  },
  doctorCard: {
    backgroundColor: '#ffffff20',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ffffff30',
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  specialization: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#ffffff40',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  dayButton: {
    backgroundColor: '#ffffff20',
    borderColor: "#ffffff30",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    width: 'auto',
  },
  dayText: {
    color: '#fff',
    fontSize: 15,
  },
  slotButton: {
   backgroundColor: "#ffffff20", // Transparent-like background for gradient card feel
    borderWidth: 1,
    borderColor: "#ffffff30",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginVertical: 6,
    width: "100%",
  },
  bookedSlot: {
      backgroundColor: "#555", // More readable booked style with contrast
    opacity: 0.6,
  },
  slotText: {
     color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },
  cancel: {
    fontSize:18,
    marginTop: 10,
    color: 'red',
    textAlign: 'center',
  },
  confirmActions: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmButton: {
    backgroundColor: '#3b5998',
    flex: 1,
    marginRight: 10,
    padding: 10,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#ffffff20',
    borderColor: '#ffffff30',
    borderWidth: 1,
    flex: 1,
    padding: 10,
    borderRadius: 8,
  },
  confirmText: {
    color: '#fff',
    fontSize: 15,
    marginTop: 6,
  },
  modalMessage: {
    textAlign: 'center',
    marginVertical: 10,
    color: '#333',
  },
});
