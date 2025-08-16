import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Easing,
  BackHandler,
  Platform,
  UIManager,
  TextInput,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../FireBase/firebase.config";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AntDesign from "react-native-vector-icons/AntDesign";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ExpandableCard = ({ item, isExpanded, onPress, navigation }) => {
  const animatedHeight = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  }, [isExpanded]);

  const detailsHeight = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 250],
  });

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.cardWrapper}>
      <View style={[styles.card, isExpanded && styles.expandedCard]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.spec}>{item.specialization}</Text>
          </View>
          <AntDesign name="pluscircleo" size={24} color="#fff" />
        </View>

        <Animated.View style={[styles.detailsAnimated, { height: detailsHeight }]}>
          {isExpanded && (
            <View>
              <Text style={styles.detailText}>Experience: {item.experience || "N/A"}</Text>
              <Text style={styles.detailText}>Contact: {item.contact || item.contactNumber || "N/A"}</Text>

              <TouchableOpacity
                style={styles.bookBtn}
                onPress={() => navigation.navigate("DoctorSlotBooking", { doctor: item })}
              >
                <Text style={styles.bookBtnText}>Book an appointment</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const PatientHome = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "doctors"));
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setDoctors(docs);
      setFilteredDoctors(docs);
    } catch (e) {
      console.error("Error fetching doctors:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => true;
      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }, [])
  );

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDoctors();
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = doctors.filter(
      (doc) =>
        doc.name.toLowerCase().includes(text.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredDoctors(filtered);
  };

  return (
    <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.gradient}>
      <Text style={styles.title}>Available Doctors</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by name or specialization"
        placeholderTextColor="#ccc"
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredDoctors}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ExpandableCard
              item={item}
              isExpanded={expandedId === item.id}
              onPress={() => toggleExpand(item.id)}
              navigation={navigation}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No doctors found.</Text>}
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


export default PatientHome;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    marginTop: 30,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  searchInput: {
  backgroundColor: "#ffffff20",
  borderRadius: 12,
  padding: 12,
  marginHorizontal: 16,
  marginBottom: 10,
  borderWidth: 1,
  borderColor: "#ffffff30",
  color: "#fff",
  fontSize: 15,
},
  list: {
    padding: 16,
    flexGrow: 1,
  },
  cardWrapper: {
    marginBottom: 14,
  },
  card: {
    backgroundColor: "#ffffff20",
    borderRadius: 16,
    padding: 25,
    borderWidth: 1,
    borderColor: "#ffffff40",
  },
  expandedCard: {
    backgroundColor: "#ffffff30",
    maxHeight: 250,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  spec: {
    fontSize: 14,
    color: "#ddd",
    marginTop: 4,
  },
  detailsAnimated: {
    overflow: "hidden",
    marginTop: 10,
  },
  detailText: {
    fontSize: 14,
    color: "#eee",
    marginBottom: 6,
  },
  availTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    marginTop: 8,
    marginBottom: 4,
  },
  slotItem: {
    marginLeft: 10,
  },
  bookBtn: {
    marginTop: 50,
    backgroundColor: "#3b5998",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  bookBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 30,
    color: "#ccc",
  },
});
