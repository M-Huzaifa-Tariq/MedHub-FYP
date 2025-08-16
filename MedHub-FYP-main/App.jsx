

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./Screens/HomeScreen";
import DoctorLogin from "./Screens/DoctorLogin";
import PatientLogin from "./Screens/PatientLogin";
import DoctorSignup from "./Screens/DoctorSignup";
import PatientSignup from "./Screens/PatientSignup";
import DoctorDashboard from "./Screens/DoctorDashboard"; 
import PatientDashboard from "./Screens/PatientDashboard";
import DoctorSlotBooking from "./Screens/DoctorSlotBooking";
import PatientHome from "./Screens/PatientData/PatientHome";
import PatientForgotPass from "./Screens/PatientForgotPass";
import DoctorForgotPass from "./Screens/DoctorForgotPass";
import PaitentPrescription from './Screens/PatientPrescription';
import DoctorReferral from "./Screens/DoctorReferral";

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="HomeScreen">
        <Stack.Screen name="HomeScreen" component={HomeScreen} options={{headerShown: false}} />
        <Stack.Screen name="DoctorLogin" component={DoctorLogin}  options={{headerShown: false}}/>
        <Stack.Screen name="PatientLogin" component={PatientLogin} options={{headerShown: false}} />
        <Stack.Screen name="DoctorSignup" component={DoctorSignup} options={{headerShown: false}}/>
        <Stack.Screen name="PatientSignup" component={PatientSignup} options={{headerShown: false}} />
        <Stack.Screen name="DoctorDashboard" component={DoctorDashboard} options={{headerShown: false}} />
        <Stack.Screen name="PatientDashboard" component={PatientDashboard}                           options={{ headerShown: false }}/>
        <Stack.Screen name="DoctorSlotBooking" component={DoctorSlotBooking} options={{headerShown: false}} />
        <Stack.Screen name="PatientHome" component={PatientHome} options={{headerShown: false}}  />
        <Stack.Screen name="PatientForgotPass" component={PatientForgotPass} options={{headerShown: false}} />
        <Stack.Screen name="DoctorForgotPass" component={DoctorForgotPass} options={{headerShown: false}} />
        <Stack.Screen name="PaitentPrescription" component={PaitentPrescription} options={{headerShown: false}} />
        <Stack.Screen name="DoctorReferral" component={DoctorReferral} options={{headerShown: false}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
