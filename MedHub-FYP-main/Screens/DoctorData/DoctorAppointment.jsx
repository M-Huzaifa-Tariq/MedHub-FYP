import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../FireBase/firebase.config';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const DoctorAppointmentScreen = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchAppointments = async () => {
    try {
      const doctorId = auth.currentUser?.uid;
      const q = query(collection(db, 'appointments'), where('doctorId', '==', doctorId));
      const querySnapshot = await getDocs(q);

      const fetched = await Promise.all(
        querySnapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          let referredByName = null;

          if (data.referredBy) {
            try {
              const refDoc = await getDoc(doc(db, 'doctors', data.referredBy));
              referredByName = refDoc.exists() ? refDoc.data().name : null;
            } catch (err) {
              console.warn('Failed to fetch referring doctor:', err);
            }
          }

          return {
            id: docSnap.id,
            ...data,
            patientName: data.patientName || 'Unknown Patient',
            referredByName,
          };
        })
      );

      setAppointments(fetched);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchAppointments();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAppointments();
  }, []);

  const handleCardPress = (item) => {
    navigation.navigate('PaitentPrescription', {
      patientId: item.patientId,
      patientName: item.patientName,
      appointmentId: item.id,
      doctorId: item.doctorId,
      isReffered: !!item.referredBy,
      referred: item.referred || false,
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleCardPress(item)}>
      <View style={styles.card}>
        <Text style={styles.title}>
          {item.patientName}
          {item.referredByName ? ` 
Referred by ${item.referredByName}` : ''}
        </Text>
        <Text style={styles.subtitle}>Day: {item.day}</Text>
        <Text style={styles.subtitle}>Time: {item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.gradient}>
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 40 }} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.gradient}>
      <Text style={styles.heading}>Appointments</Text>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.container}
        ListEmptyComponent={<Text style={styles.empty}>No Appointments Found</Text>}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4c669f', '#3b5998', '#192f6a']}
            tintColor="#fff"
          />
        }
      />
    </LinearGradient>
  );
};

export default DoctorAppointmentScreen;

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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginVertical: 20,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 15,
    color: '#ddd',
    marginTop: 4,
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#ccc',
  },
});
