// Updated PatientPrescriptionScreen with edit functionality for referred appointments
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../FireBase/firebase.config';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const PatientPrescriptionScreen = ({ route }) => {
  const {
    patientId,
    patientName,
    appointmentId,
    doctorId,
    referred = false, // passed from navigation
  } = route.params;

  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState(null);
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [timesPerDay, setTimesPerDay] = useState('');
  const [numberOfDays, setNumberOfDays] = useState('');
  const [loading, setLoading] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (selectionMode) {
          setSelectionMode(false);
          setSelectedIds([]);
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [selectionMode])
  );

  const fetchPrescriptions = async () => {
    try {
      const q = query(collection(db, 'prescriptions'), where('patientId', '==', patientId));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPrescriptions(list);
    } catch (err) {
      console.log('Error fetching prescriptions:', err);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const resetForm = () => {
    setMedicineName('');
    setDosage('');
    setTimesPerDay('');
    setNumberOfDays('');
    setEditingPrescription(null);
    setEditMode(false);
  };

  const handleSave = async () => {
    if (!medicineName || !dosage || !timesPerDay || !numberOfDays) return;

    try {
      setLoading(true);
      if (editMode && editingPrescription) {
        await updateDoc(doc(db, 'prescriptions', editingPrescription.id), {
          medicineName,
          dosage,
          timesPerDay,
          numberOfDays,
        });
      } else {
        await addDoc(collection(db, 'prescriptions'), {
          patientId,
          doctorId,
          appointmentId,
          medicineName,
          dosage,
          timesPerDay,
          numberOfDays,
          createdAt: new Date().toISOString(),
        });
      }

      setModalVisible(false);
      resetForm();
      fetchPrescriptions();
    } catch (err) {
      console.error('Error saving prescription:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (prescription) => {
    setEditMode(true);
    setEditingPrescription(prescription);
    setMedicineName(prescription.medicineName);
    setDosage(prescription.dosage);
    setTimesPerDay(prescription.timesPerDay);
    setNumberOfDays(prescription.numberOfDays);
    setModalVisible(true);
  };

  const toggleSelection = (id) => {
    if (!selectionMode) return;
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const deleteSelected = async () => {
    try {
      const promises = selectedIds.map(id => deleteDoc(doc(db, 'prescriptions', id)));
      await Promise.all(promises);
      setSelectedIds([]);
      setSelectionMode(false);
      setShowConfirm(false);
      fetchPrescriptions();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

 const renderItem = ({ item }) => {
  const selected = selectedIds.includes(item.id);
  return (
    <TouchableOpacity
      onPress={() => selectionMode ? toggleSelection(item.id) : null}
      activeOpacity={selectionMode ? 0.8 : 1}
    >
      <View style={styles.historyCard}>
        {selectionMode && (
          <View style={styles.checkbox}>
            {selected ? (
              <MaterialIcons name="check-box" size={20} color="#fff" />
            ) : (
              <MaterialIcons name="check-box-outline-blank" size={20} color="#fff" />
            )}
          </View>
        )}

        <View style={{ flex: 1 }}>
          <Text style={styles.medicine}>Medicine: {item.medicineName}</Text>
          <Text style={styles.detail}>Dosage: {item.dosage}</Text>
          <Text style={styles.detail}>Times/Day: {item.timesPerDay}</Text>
          <Text style={styles.detail}>Days: {item.numberOfDays}</Text>
        </View>

        {referred && !selectionMode && (
          <TouchableOpacity
            style={styles.editIconWrapper}
            onPress={() => handleEdit(item)}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};


  return (
    <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.gradient}>
      <View style={styles.container}>
        <Text style={styles.header}>{patientName}'s Medical History</Text>

        <FlatList
          data={prescriptions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.emptyText}>No medical history found.</Text>}
          contentContainerStyle={{ paddingBottom: 160 }}
        />

        {/* Refer button */}
        <TouchableOpacity
          style={styles.referralButton}
          onPress={() =>
            navigation.navigate('DoctorReferral', {
              patientId,
              patientName,
              doctorId,
              appointmentId,
            })
          }
        >
          <LinearGradient colors={['#5a8dee', '#3b5998']} style={styles.referralGradient}>
            <Text style={styles.referralButtonText}>Refer Patient</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* FABs */}
        {!selectionMode && (
          <TouchableOpacity style={styles.fabMain} onPress={() => setFabOpen(!fabOpen)}>
            <Ionicons name={fabOpen ? 'close' : 'add'} size={26} color="#fff" />
          </TouchableOpacity>
        )}

        {fabOpen && !selectionMode && (
          <View style={styles.fabActions}>
            <TouchableOpacity
              style={styles.fabActionBtn}
              onPress={() => {
                resetForm();
                setModalVisible(true);
                setFabOpen(false);
              }}
            >
              <Ionicons name="pencil-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.fabActionBtn}
              onPress={() => {
                setSelectionMode(true);
                setSelectedIds([]);
                setFabOpen(false);
              }}
            >
              <MaterialIcons name="delete-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Delete FAB in selection mode */}
        {selectionMode && (
          <TouchableOpacity
            style={[styles.fabMain, { backgroundColor: '#d9534f', bottom: 180 }]}
            onPress={() => {
              if (selectedIds.length > 0) setShowConfirm(true);
              else setSelectionMode(false);
            }}
          >
            <MaterialIcons name="delete" size={24} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Confirm Delete Modal */}
        <Modal visible={showConfirm} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.confirmContainer}>
              <Text style={styles.confirmText}>Are you sure you want to delete selected items?</Text>
              <View style={styles.confirmButtons}>
                <TouchableOpacity style={styles.confirmButton} onPress={deleteSelected}>
                  <Text style={styles.confirmButtonText}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmButton, { backgroundColor: '#ccc' }]}
                  onPress={() => setShowConfirm(false)}
                >
                  <Text style={[styles.confirmButtonText, { color: '#000' }]}>No</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </Modal>

        {/* Add/Edit Modal */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.modalContent}>
              <ScrollView>
                <Text style={styles.modalTitle}>{editMode ? 'Edit Prescription' : 'Add Prescription'}</Text>
                <TextInput
                  placeholder="Medicine Name"
                  placeholderTextColor="#fff"
                  style={styles.input}
                  value={medicineName}
                  onChangeText={setMedicineName}
                />
                <TextInput
                  placeholder="Dosage"
                  placeholderTextColor="#fff"
                  style={styles.input}
                  value={dosage}
                  onChangeText={setDosage}
                />
                <TextInput
                  placeholder="Times per day"
                  placeholderTextColor="#fff"
                  style={styles.input}
                  value={timesPerDay}
                  onChangeText={setTimesPerDay}
                />
                <TextInput
                  placeholder="Number of days"
                  placeholderTextColor="#fff"
                  style={styles.input}
                  value={numberOfDays}
                  onChangeText={setNumberOfDays}
                />
                <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>{editMode ? 'Update' : 'Save'}</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </ScrollView>
            </LinearGradient>
          </View>
        </Modal>
      </View>
    </LinearGradient>
  );
};

export default PatientPrescriptionScreen;

// styles (same as previous version, not repeated here for brevity)

// ✨ Use your existing styles object or expand from the last version


const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { padding: 16, flex: 1 },
  header: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 20, textAlign: 'center' },
  historyCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff20',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ffffff30',
  },
  checkbox: { marginRight: 10, marginTop: 2,  },
  medicine: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  detail: { fontSize: 14, color: '#e0e0e0', marginTop: 4 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#ccc', fontSize: 16 },
  referralButton: { marginBottom: 20, borderRadius: 10, overflow: 'hidden' },
  referralGradient: { padding: 14, alignItems: 'center', borderRadius: 10 },
  referralButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  fabMain: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    backgroundColor: '#5a8dee',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    marginBottom: 30,
  },
  fabActions: {
    position: 'absolute',
    right: 20,
    bottom: 180,
    alignItems: 'center',
    gap: 16,
    marginBottom: 25,
  },
  fabActionBtn: {
    backgroundColor: '#6c757d',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  confirmContainer: { width: '80%', padding: 20, borderRadius: 16, alignItems: 'center' },
  confirmText: { fontSize: 16, color: '#fff', textAlign: 'center', marginBottom: 15 },
  confirmButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 10 },
  confirmButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#5a8dee',
  },
  confirmButtonText: { color: '#fff', fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000088' },
  modalContent: { padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#fff' },
  input: {
    borderWidth: 1,
    borderColor: '#ffffff20',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 15,
    color: '#fff',
    backgroundColor: '#ffffff20',
  },
  saveButton: {
    backgroundColor: '#5a8dee',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelText: { textAlign: 'center', color: '#fff', marginTop: 20, fontSize: 15, fontWeight: 'bold' },
});
