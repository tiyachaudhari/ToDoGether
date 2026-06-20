import React, { Component } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

class ParentSignupScreen extends Component {
  state = {
    //states to hold the Input and Response data values
    parentFirstName: '',
    parentSurname: '',
    parentEmail: '',
    parentUsername: '',
    parentPassword: '',
    parentID: null,
  };

  ParentSignup = () => {
    //parentData object with the data that needs to be sent 
    const parentData = {
      Parent_FirstName: this.state.parentFirstName,
      Parent_SurName: this.state.parentSurname,
      ParentEmail: this.state.parentEmail,
      Parent_username: this.state.parentUsername,
      ParentPassword: this.state.parentPassword,
    };

    //sends an alert when the password field is not 10 characters long
    if (this.state.parentPassword.trim().length < 10) {
      Alert.alert('Error', 'Please enter a 10 character password.');
      return;
    }

    //sends an alert when the username field is not 6 characters long
    if (this.state.parentUsername.trim().length < 6) {
      Alert.alert('Error', 'Please enter a 6 character username.');
      return;
    }

    //validates the input for the email field
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(this.state.parentEmail)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    //sends a POST request with the 'parentData' to the backend with the data to create a Parent Account
    axios
      .post('http://192.168.1.156:8000/signup/parent/', parentData)
      .then((response) => {
        console.log('Parent signed up successfully:', response.data);
        alert('Parent signed up successfully!');
        //extracts the ParentID from the response data 
        this.setState({ parentID: response.data.ParentID });
      })
      //error handling
      .catch((error) => {
        console.error('Error signing up parent:', error);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        } else if (error.request) {
          console.error('Request made but no response received:', error.request);
        } else {
          console.error('Error setting up the request:', error.message);
        }
      });
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.signupHeading}>Parent Sign Up</Text>
        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={this.state.parentFirstName}
          //updates the state with the inputted value
          onChangeText={(text) => this.setState({ parentFirstName: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Surname" 
          value={this.state.parentSurname}
          onChangeText={(text) => this.setState({ parentSurname: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={this.state.parentEmail}
          onChangeText={(text) => this.setState({ parentEmail: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={this.state.parentUsername}
          onChangeText={(text) => this.setState({ parentUsername: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          //password masking for security
          secureTextEntry={true}
          value={this.state.parentPassword}
          onChangeText={(text) => this.setState({ parentPassword: text })}
        />
        {/* calls the ParentSignup function when the sign up button is clicked  */}
        <TouchableOpacity style={styles.button} onPress={this.ParentSignup}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
        {/* checks whether the parentID state is null and ouputs the ParentID on the screen */}
        {this.state.parentID !== null && (
          <Text style={styles.parentIDText}>
            use (Parent ID: {this.state.parentID}) to register child accounts{' '}, an email with the ParentID
            has also been sent to your inputted email
          </Text>
        )}
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
  signupHeading: {
    fontSize: 24,
    marginBottom: 20,
    color: '#8b71de',
    fontWeight: 'bold', 
  },
  input: {
    height: 40,
    borderColor: '#8b71de', 
    borderWidth: 1.8,
    marginBottom: 10,
    padding: 10,
    width: '100%',
    borderRadius: 15, 
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
  parentIDText: {
    marginTop: 10,
    fontSize: 16,
    color: '#000', 
  },
  Text: {
    color: '#000',
    fontSize: 16,
    textAlign: 'center',
  }
});

export default ParentSignupScreen;
