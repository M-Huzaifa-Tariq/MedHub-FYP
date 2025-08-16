import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { getAuth } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../FireBase/firebase.config';
import LinearGradient from 'react-native-linear-gradient';

const availableTimes = [
  '08:00-08:25 AM',
  '08:30-08:55 AM',
  '09:00-09:25 PM',
  '09:30-09:55 AM',
  '10:00-10:25 AM',
  '10:30-10:55 AM',
  '11:00-11:25 AM',
  '11:30-11:55 AM',
  '12:00-12:25 PM',
  '12:30-12:55 PM',
];

const DoctorSetAvailability = () => {
  const auth = getAuth();
  const doctorId = auth.currentUser?.uid;

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('success'); // 'error' or 'success'

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirm = (date) => {
    setSelectedDate(date);
    hideDatePicker();
  };

  const toggleSlot = (time) => {
    setSelectedSlots((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );
  };

  const getDayName = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date(date).getDay()];
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const showModal = (message, type = 'success') => {
    setModalMessage(message);
    setModalType(type);
    setModalVisible(true);
  };

  const saveAvailability = async () => {
    if (!doctorId || !selectedDate || selectedSlots.length === 0) {
      showModal('Please select a date and at least one time slot.', 'error');
      return;
    }

    const formattedDate = formatDate(selectedDate);
    const dayName = getDayName(selectedDate);
    const slotsToSave = selectedSlots.map((time) => ({ time, isBooked: false }));

    try {
      const docRef = doc(db, 'doctors', doctorId, 'availableSlots', formattedDate);
      await setDoc(docRef, {
        date: formattedDate,
        day: dayName,
        slots: slotsToSave,
      });

      setSelectedSlots([]);
      setSelectedDate(null);
      showModal('Availability saved successfully!', 'success');
    } catch (err) {
      console.error(err);
      showModal('Failed to save availability.', 'error');
    }
  };

  return (
    <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Set Your Availability</Text>

        <TouchableOpacity onPress={showDatePicker} style={styles.dateBtn}>
          <Text style={styles.dateBtnText}>
            {selectedDate ? `Selected Date: ${formatDate(selectedDate)}` : 'Pick a Date'}
          </Text>
        </TouchableOpacity>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        />

        <View style={styles.slotsContainer}>
          {availableTimes.map((time) => (
            <TouchableOpacity
              key={time}
              style={[styles.slot, selectedSlots.includes(time) && styles.slotSelected]}
              onPress={() => toggleSlot(time)}
            >
              <Text style={styles.slotText}>{time}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={saveAvailability}>
          <Text style={styles.saveBtnText}>Save Availability</Text>
        </TouchableOpacity>

        {/* Custom Alert Modal */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <LinearGradient
              colors={['#4c669f', '#3b5998', '#192f6a']}
              style={styles.modalBox}
            >
              <Text style={styles.modalTitle}>
                {modalType === 'error' ? 'Error' : 'Success'}
              </Text>
              <Text style={styles.modalText}>{modalMessage}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </Modal>
      </ScrollView>
    </LinearGradient>
  );
};

export default DoctorSetAvailability;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    marginTop: 220,
    padding: 24,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
  },
  dateBtn: {
    backgroundColor: '#ffffff20',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffffff40',
  },
  dateBtnText: {
    fontSize: 16,
    color: '#fff',
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  slot: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#aaa',
    margin: 6,
    backgroundColor: '#ffffff20',
  },
  slotSelected: {
    backgroundColor: '#5a8dee',
    borderColor: '#5a8dee',
  },
  slotText: {
    color: '#fff',
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: '#5a8dee',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000080',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '80%',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
    fontWeight :320,
  },
  modalButton: {
    backgroundColor: '#ffffff30',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffffff60',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
