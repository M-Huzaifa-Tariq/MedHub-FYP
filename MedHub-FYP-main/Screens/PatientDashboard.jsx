import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { View, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

import PatientHome from "./PatientData/PatientHome";
import PatientProfile from "./PatientData/PatientProfile";
import PatientMedicalRecords from "./PatientData/PatientMedicalRecords";
import PatientAppointments from "./PatientData/PatientAppoitment";

// Stack Wrappers
const Stack = createStackNavigator();

const createStack = (screenName, Component) => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      headerStyle: styles.header,
      headerTitleStyle: styles.headerTitle,
      headerTintColor: "#000",
      headerLeft: () => null,
    }}
  >
    <Stack.Screen name={screenName} component={Component} />
  </Stack.Navigator>
);

// Tab Navigation
const Tab = createBottomTabNavigator();

const Home = () => (
  <View style={styles.screen}>
    <PatientHome />
  </View>
);

const Profile = () => (
  <View style={styles.screen}>
    <PatientProfile />
  </View>
);

const Appointment = () => (
  <View style={styles.screen}>
    <PatientAppointments />
  </View>
);
const MedicalRecords = () => (
  <View style={styles.screen}>
    <PatientMedicalRecords />
  </View>
);

const PatientDashboard = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          switch (route.name) {
            case "Home":
              iconName = "home";
              break;
            case "MedicalRecords":
              iconName = "folder";
              break;
            case "Appointment":
              iconName = "event-note";
              break;
            case "Profile":
              iconName = "person";
              break;
            default:
              iconName = "circle";
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#ccc",
        tabBarStyle: {
          backgroundColor: "#3b5998",
          borderTopWidth: 0.5,
          borderTopColor: "#ffffff30",
          paddingBottom: 6,
          height: 60,
        },
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 12,
        },
      })}
    >
      <Tab.Screen name="Home">{() => createStack("Home", Home)}</Tab.Screen>
      <Tab.Screen name="MedicalRecords">{() => createStack("Medical Records", MedicalRecords)}</Tab.Screen>
      <Tab.Screen name="Appointment">{() => createStack("Appointment", Appointment)}</Tab.Screen>
      <Tab.Screen name="Profile">{() => createStack("Profile", Profile)}</Tab.Screen>
    </Tab.Navigator>
  );
};

export default PatientDashboard;

const styles = StyleSheet.create({
   screen: {
    flex: 1,
  },
});
