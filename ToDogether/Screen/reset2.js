import React, { Component } from 'react';
import { View, TextInput, TouchableOpacity, Alert, StyleSheet, Text } from 'react-native';
import axios from 'axios';

class PasswordReset2 extends Component {
  state = {
    ResetCode: '',
    NewPassword: '',
    ConfirmPassword: '',
  };

  handleResetPassword = () => {
    const { ResetCode, NewPassword, ConfirmPassword } = this.state;
    // re-declares the variables that have been sent when navigation took place
    const { UserName, UserType } = this.props.route.params;

    // validates the user input against the given conditions
    if (
      // entered reset code must have 6 characters
      ResetCode.trim().length !== 6 ||
      // entered password must be more than 10 characters
      NewPassword.trim().length < 10 ||
      // Password validation
      NewPassword !== ConfirmPassword
    ) {
      Alert.alert(
        'Error',
        'Please enter a 6-digit Reset Code, a new password with at least 10 characters, and ensure the passwords match.'
      );
      return;
    }

    try {
      console.log(ResetCode, NewPassword, UserName, UserType);
      axios.post('http://192.168.1.156:8000/reset/data/', {
        ResetCode: ResetCode,
        NewPassword: NewPassword,
        UserName: UserName,
        UserType: UserType,
      })
      .then((response) => {
        //Checks the response from the server
        if (response.data.message === 'New Password reset') {
          //Shows success alert only if the response indicates success
          Alert.alert('Password Reset', 'Password has been reset successfully.');
        } else {
          //Shows an error alert for other responses
          Alert.alert('Error', response.data.message);
        }
      })
      .catch((error) => {
        console.error(
          'Password reset failed:',
          //prints the particular error
          error.response ? error.response.data.message : error.message
        );
        alert('There seems to be an error - Try Again');
      });
    } catch (error) {
      console.error(
        'Password reset failed:',
        error.response ? error.response.data.message : error.message
      );
      alert('There seems to be an error - Try Again');
    }
  };

  render() {
    const { email } = this.props.route.params;

    return (
      <View style={styles.container}>
        <Text>The email has been sent to {email}.</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Reset Code"
          onChangeText={(text) => this.setState({ ResetCode: text })}
          value={this.state.ResetCode}
          //ensures that the user can only input 6 numeric values
          keyboardType="numeric"
          maxLength={6}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter a new Password"
          onChangeText={(text) => this.setState({ NewPassword: text })}
          value={this.state.NewPassword}
          //password masking for security
          secureTextEntry={true}
          //ensures that the password is atleast 10 characters long
          minLength={10}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm New Password"
          onChangeText={(text) => this.setState({ ConfirmPassword: text })}
          value={this.state.ConfirmPassword}
          secureTextEntry={true}
          minLength={10}
        />
        <TouchableOpacity style={styles.button} onPress={this.handleResetPassword}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: '80%',
  },
  button: {
    backgroundColor: '#68a4f2',
    padding: 15,
    width: '50%',
    borderRadius: 20,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
  },
});

export default PasswordReset2;
