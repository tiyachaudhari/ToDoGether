import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './Screen/homescreen';
import LoginScreen from './Screen/Login';  
import SignupScreen from './Screen/SignUp';  
import ParentSignupScreen from './Screen/ParentSignUp';
import ChildSignupScreen from './Screen/ChildSignUp';
import HomepagePar from './Screen/HomepagePar';
import ActivityAssignment from './Screen/ActivityAssignment';
import HomepageChild from './Screen/HomepageChild';
import ParentDashboard from './Screen/HomepagePar2';
import UpdateActivity from './Screen/UpdateActivity';
import PasswordReset from './Screen/reset';
import PasswordReset2 from './Screen/reset2';
import GameScreen from './Screen/GameScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Home' }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Login' }}
        />
        <Stack.Screen
          name="Reset"
          component={PasswordReset}
          options={{
            title: 'Reset Password'}}
        />    
        <Stack.Screen
          name="Signup"
          component={SignupScreen}
          options={{ title: 'Sign Up' }}
        />
        <Stack.Screen
          name="ParentSignup"
          component={ParentSignupScreen}
          options={{ title: 'Parent Sign Up' }}
        />
        <Stack.Screen
        name="ChildSignup"
        component={ChildSignupScreen}
        options={{ title: 'Child Sign Up' }}
        />
        <Stack.Screen
          name="HomepagePar"
          component={HomepagePar}
          options={({ route }) => ({
            title: 'Parent Homepage',
            Name: route.params.Name,
            ParentID: route.params.ParentID, })}
        />
        <Stack.Screen
          name="ActivityAssignment" 
          component={ActivityAssignment}
          options={({ route }) => ({
            title: 'Parent Homepage',
            ChildName: route.params.ChildName,
            ChildID: route.params.ChildID,
            ParentID: route.params.ParentID, })}
        />
        <Stack.Screen
          name="HomepageChild"
          component={HomepageChild}
          options={({ route }) => ({
            title: 'Child Homepage',
            Name: route.params.Name,
            ChildID: route.params.ChildID,
            TotalPoints: route.params.TotalPoints, })}
        />
        <Stack.Screen
          name="ParentDashboard" 
          component={ParentDashboard}
          options={{title: 'Parent Dashboard' }}  
        />
        <Stack.Screen
          name="UpdateActivity"
          component={UpdateActivity}
          options={({ route }) => ({
            title: 'Update Activity',
            ActivityID: route.params.ActivityID, })}   
        />
        <Stack.Screen
          name="GameScreen"
          component={GameScreen}
          options={({ route }) => ({
            title: 'Game Screen',
            ChildID: route.params.ChildID,
            FishID: route.params.FishID, })} 
        />
        <Stack.Screen
          name="PasswordReset2"
          component={PasswordReset2}
          options={({ route }) => ({
            title: 'Reset Code',
            email: route.params.email,
            UserName: route.params.UserName,
            UserType: route.params.UserType, })}            
      />        
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

