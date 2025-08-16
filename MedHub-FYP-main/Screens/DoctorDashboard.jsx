import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import LinearGradient from "react-native-linear-gradient";

// Screens
import DoctorAppointment from "./DoctorData/DoctorAppointment";
import DoctorProfile from "./DoctorData/DoctorProfile";
import DoctorSetAvailability from "./DoctorData/DoctorSetAvailability";

// Wrappers for consistent gradient background in screens
const Appointments = () => (
  <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.screen}>
    <DoctorAppointment />
  </LinearGradient>
);

const DoctorAvailability = () => (
  <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.screen}>
    <DoctorSetAvailability />
  </LinearGradient>
);

const Profile = () => (
  <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.screen}>
    <DoctorProfile />
  </LinearGradient>
);

// Tab Navigator
const Tab = createBottomTabNavigator();

const DoctorDashboard = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Appointments") iconName = "event-note";
          else if (route.name === "Availability") iconName = "access-time";
          else if (route.name === "Profile") iconName = "person";

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#ccc",
        tabBarStyle: {
          backgroundColor: "#3b5998",
          borderTopWidth: 0,
          elevation: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: "600",
          marginBottom: 6,
        },
      })}
    >
      <Tab.Screen name="Appointments" component={Appointments} />
      <Tab.Screen name="Availability" component={DoctorAvailability} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

export default DoctorDashboard;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 10,
  },
});
