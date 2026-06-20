import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

class HomeScreen extends Component {
  //navigates to the login screen and sends the usertype 
  showLogin = (UserType) => {
    this.props.navigation.navigate('Login', { UserType });
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>🗒️</Text>
        <Text style={styles.heading}>ToDogether</Text>

        {/* Button to navigate to Parent Login */}
        <TouchableOpacity style={styles.button} onPress={() => this.showLogin('Parent')}>
          <Text style={styles.buttonText}>Parent Login</Text>
        </TouchableOpacity>

        {/* Button to navigate to Child Login */}
        <TouchableOpacity style={styles.button} onPress={() => this.showLogin('Child')}>
          <Text style={styles.buttonText}>Child Login</Text>
        </TouchableOpacity>

        {/* Link to navigate to the Signup screen */}
        <TouchableOpacity onPress={() => this.props.navigation.navigate('Signup')}>
          <Text style={styles.Link}>Don't have an account? Click here</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  emoji: {
    fontSize: 30,
  },
  heading: {
    fontSize: 24,
    marginBottom: 20,
    color: '#68a4f2',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#68a4f2',
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
  Link: {
    color: '#2196f3',
    textAlign: 'left',
    fontSize: 15,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default HomeScreen;
