import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const SignupScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Sign Up</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ParentSignup')}
      >
        <Text style={styles.buttonText}>Parent Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ChildSignup')}
      >
        <Text style={styles.buttonText}>Child Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white', 
  }, 
  heading: {
    fontSize: 24,
    marginBottom: 20,
    color: '#8b71de', 
    fontWeight:'bold',
  },
  button: {
    backgroundColor: '#8b71de', 
    padding: 15,
    width: '100%',
    borderRadius: 20, 
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff', 
    textAlign: 'center',
    fontSize: 18,
  },
});

export default SignupScreen;
