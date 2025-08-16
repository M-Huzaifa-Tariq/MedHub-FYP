import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../FireBase/firebase.config";
import LinearGradient from "react-native-linear-gradient";

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(collection(db, "appointments"), where("patientId", "==", user.uid));
      const querySnapshot = await getDocs(q);

      const data = await Promise.all(
        querySnapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          let doctorName = "Unknown Doctor";
          let specialization = "N/A";

          try {
            const doctorSnap = await getDocs(
              query(collection(db, "doctors"), where("__name__", "==", data.doctorId))
            );
            if (!doctorSnap.empty) {
              const doctorData = doctorSnap.docs[0].data();
              doctorName = doctorData.name || doctorName;
              specialization = doctorData.specialization || specialization;
            }
          } catch (e) {
            console.warn("Error fetching doctor info:", e);
          }

          return {
            id: docSnap.id,
            doctor: doctorName,
            specialization: specialization,
            date: data.date,
            time: data.time,
          };
        })
      );

      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAppointments();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.doctorName}>{item.doctor}</Text>
      <Text style={styles.specialization}>{item.specialization}</Text>
      <Text style={styles.details}>
        {item.date} | {item.time}
      </Text>
    </View>
  );

  return (
    <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.gradient}>
      <Text style={styles.heading}>My Appointments</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.container}
          ListEmptyComponent={<Text style={styles.empty}>No appointments found.</Text>}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#4c669f", "#3b5998", "#192f6a"]}
              tintColor="#fff"
            />
          }
        />
      )}
    </LinearGradient>
  );
};

export default PatientAppointments;

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
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginVertical: 20,
  },
  card: {
    backgroundColor: "#ffffff20",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#ffffff40",
  },
  doctorName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  specialization: {
    fontSize: 14,
    color: "#ccc",
    marginTop: 4,
  },
  details: {
    fontSize: 14,
    color: "#eee",
    marginTop: 8,
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#ccc",
  },
});
