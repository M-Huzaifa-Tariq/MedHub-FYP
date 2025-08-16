import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../FireBase/firebase.config';
import LinearGradient from 'react-native-linear-gradient';

const PatientMedicalRecords = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPrescriptions = async () => {
    try {
      const patientId = auth.currentUser.uid;
      const q = query(collection(db, 'prescriptions'), where('patientId', '==', patientId));
      const querySnapshot = await getDocs(q);

      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPrescriptions(data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPrescriptions();
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>Medicine: {item.medicineName}</Text>
      <Text style={styles.detail}>Dosage: {item.dosage}</Text>
      <Text style={styles.detail}>Times/Day: {item.timesPerDay}</Text>
      <Text style={styles.detail}>Duration: {item.numberOfDays} day(s)</Text>
    </View>
  );

  return (
    <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.gradient}>
      <Text style={styles.heading}>Your Medical Records</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={prescriptions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.container}
          ListEmptyComponent={<Text style={styles.empty}>No prescriptions found.</Text>}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#4c669f', '#3b5998', '#192f6a']}
              tintColor="#fff"
            />
          }
        />
      )}
    </LinearGradient>
  );
};

export default PatientMedicalRecords;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 30,
    flexGrow: 1,
  },
  heading: {
    marginTop: 30,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff20',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ffffff40',
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  detail: {
    fontSize: 14,
    color: '#ddd',
    marginTop: 2,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#ccc',
  },
});
