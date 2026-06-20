import React, { Component } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

class LoginScreen extends Component {
  state = {
    //states to hold the Input values
    username: '',
    password: ''
  };

  //extracts user type from the previous screen route
  UserType = this.props.route.params.UserType;

  Login = () => {
    const { navigation } = this.props;
    const { UserType } = this;

    if (this.state.password.trim().length < 10) {
      Alert.alert('Error', 'Please enter a 10 character password.');
      return;
    }

    //sends an alert when the username field is not 6 characters long
    if (this.state.username.trim().length < 6) {
      Alert.alert('Error', 'Please enter a 6 character username.');
      return;
    }

    //sends a POST request with the login details
    axios
      .post('http://192.168.1.156:8000/login/', {
        Usertype: UserType,
        Username: this.state.username,
        Password: this.state.password,
      })
      .then((response) => {
        //Checks the user type and navigates accordingly
        if (response && response.data) {
          if (UserType === 'Parent') {
            navigation.navigate('HomepagePar', {
              Name: response.data.Parent_FirstName,
              ParentID: response.data.ParentID,
            });
          } else {
            navigation.navigate('HomepageChild', {
              Name: response.data.Child_FirstName,
              ChildID: response.data.ChildID,
            });
          }
        } 
      })
      .catch((error) => {
        //error handling
        console.error('Login failed:', error.response ? error.response.data.message : error.message);
        Alert.alert('There seems to be an error - Try Again');
      });
  };

  //navigates to the reset screen
  ResetPassword = () => {
    const { navigation } = this.props;
    navigation.navigate('Reset');
  };

  render() {
    const { UserType} = this;

    return (
      <View style={styles.container}>
        <Text style={styles.loginHeading}>{UserType} Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={this.state.username}
          //updates the state with the inputted value
          onChangeText={(text) => this.setState({ username: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          //password masking for security
          secureTextEntry={true}
          value={this.state.password}
          onChangeText={(text) => this.setState({ password: text })}
        />
        {/* calls function which navigates user to homepage */}
        <TouchableOpacity style={styles.button} onPress={this.Login}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        {/* calls the ResetPassword function which navigate to the reset screen */}
        <TouchableOpacity onPress={this.ResetPassword}>
          <Text style={styles.Link}>Forgot Password? Click here to reset</Text>
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
    fontSize: 24,
    marginBottom: 20,
    color: '#68a4f2', 
    fontWeight: 'bold', 
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
export default LoginScreen;