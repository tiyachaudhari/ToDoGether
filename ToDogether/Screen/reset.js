import React, { Component } from 'react';
import { View, TextInput, TouchableOpacity, Alert, StyleSheet, Text } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';


class PasswordReset extends Component {
  state = {
    email: '',
    UserType: '', 
    UserName: '',
  };

  handleResetPassword = () => {
    const { email, UserType, UserName } = this.state;

    // sends an alert when the username field is not filled in
    if (UserName.trim().length < 6) {
      Alert.alert('Error', 'Please enter a 6 character username.');
      return;
    }

    // validates the input for the email field
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    try {
      axios.post('http://192.168.1.156:8000/reset/data/', {
        UserType: UserType,
        email: email,
        UserName: UserName,
      })
      .then(response => {
        // navigates to the next step if the POST request is successful
        this.props.navigation.navigate('PasswordReset2', { email, UserName, UserType });
      })
      .catch(error => {
        // handles errors and shows an alert
        console.error('Password reset failed:', error.response ? error.response.data.message : error.message);
        alert('There seems to be an error - Try Again');
      });
    } catch (error) {
      // handles errors and shows an alert
      console.error('Password reset failed:', error.response ? error.response.data.message : error.message);
      alert('There seems to be an error - Try Again');
    }
  };

  //picker to pick the UserType
  renderUserTypePicker = () => {
    return (
      <View style={styles.pickerContainer}>
        <Picker
          style={styles.picker}
          selectedValue={this.state.UserType}
          onValueChange={(itemValue) => this.setState({ UserType: itemValue })}
        >
          <Picker.Item label="Select UserType" value="" />
          <Picker.Item label="Child" value="Child" />
          <Picker.Item label="Parent" value="Parent" />
        </Picker>
      </View>
    );
  };

  render() {
    return (
      <View style={styles.container}>
        {/* Picker function is called */}
        {this.renderUserTypePicker()}
         <TextInput
          style={styles.input}
          placeholder="UserName"
          onChangeText={(text) => this.setState({ UserName: text })}
          value={this.state.UserName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          onChangeText={(text) => this.setState({ email: text })}
          value={this.state.email}
          keyboardType="email-address"
        />
        <TouchableOpacity style={styles.button} onPress={this.handleResetPassword}>
          <Text style={styles.buttonText}>Reset Password</Text>
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
  loginHeading: {
    fontSize: 20,
    marginBottom: 10,
    color: '#ff6347', 
  },
  input: {
    height: 40,
    borderColor: '#68a4f2',
    marginBottom: 10,
    padding: 10,
    width: '100%',
    borderRadius: 15,
    borderWidth: 2,
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
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 10,
    backgroundColor: 'white',
  },
  pickerContainer: {
    width: '100%', 
    padding: 0,
    backgroundColor: 'white',
    borderColor: '#2196f3',
    borderWidth: 3,
    borderRadius: 5,
    marginBottom: 10,
  },

});
export default PasswordReset;
