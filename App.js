import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './screens/Login';
import ChangePassword from './screens/ChangePassword';
import SignupStudent from './screens/SignupStudent';
import Verification from './screens/Verification';
import Dashboard from './screens/Dashboard';
import Details from './screens/Details';
import Profile from './screens/Profile';
import ScholarshipDetails from './screens/ScholarshipDetails';
import Application from './screens/Application';
import Messages from './screens/Messages';
import EditProfile from './screens/EditProfile';
import FilteredOffersList from './screens/FilteredOffersList';
import History from './screens/History';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }} >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="ChangePassword" component={ChangePassword} />
        <Stack.Screen name="SignupStudent" component={SignupStudent} />
        <Stack.Screen name="Verification" component={Verification} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Details" component={Details} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="ScholarshipDetails" component={ScholarshipDetails} />
        <Stack.Screen name="Application" component={Application} />
        <Stack.Screen name="Messages" component={Messages} />
        <Stack.Screen name="FilteredOffersList" component={FilteredOffersList} />
        <Stack.Screen name="History" component={History} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}