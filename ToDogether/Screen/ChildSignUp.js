import React, { Component } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';

class ChildSignupScreen extends Component {
  state = {
    //states to hold the Input values
    childFirstName: '',
    childSurname: '',
    childUsername: '',
    childPassword: '',
    ParentID: [''],
  };

  ChildSignup = () => {
    const childData = {
      Child_FirstName: this.state.childFirstName,
      Child_SurName: this.state.childSurname,
      Child_username: this.state.childUsername,
      ChildPassword: this.state.childPassword,
      ParentID: this.state.ParentID,
    };

     //sends a POST request with the 'childData' to the backend with the data to create a Child Account
    axios
      .post('http://192.168.1.156:8000/signup/child/', childData)
      .then((response) => {
        console.log('Child signed up successfully:', response.data);
        alert('Child signed up successfully!');
      })
      //Error Handling
      .catch((error) => {
        console.error('Error signing up child:', error);
      });
  };

  //adds an empty string to the ParentID array
  addParentID = () => {
    //checks the length of ParentID array 
    if (this.state.ParentID.length < 4) {
      this.setState((prevState) => ({
        ParentID: [...prevState.ParentID, ''],
      }));
    } else {
      //displaya an alert if the max length has been reached 
      alert('You can only attach a maximum of four parent accounts.');
    }
  };

  //adds the inputted ParentID to the array 
  ParentIDs = (i, value) => {
    const { ParentID } = this.state;
    const newParentID = [...ParentID];
    newParentID[i] = value;
    this.setState({ ParentID: newParentID });
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.signupHeading}>Child Sign Up</Text>
        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={this.state.childFirstName}
          //updates the state with the inputted value
          onChangeText={(text) => this.setState({ childFirstName: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Surname"
          value={this.state.childSurname}
          onChangeText={(text) => this.setState({ childSurname: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={this.state.childUsername}
          onChangeText={(text) => this.setState({ childUsername: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={this.state.childPassword}
          onChangeText={(text) => this.setState({ childPassword: text })}
        />
        {/* outputs an empty input field using the ParentID array */}
        {this.state.ParentID.map((parentID, i) => (
          <TextInput
            key={i}
            style={styles.input}
            placeholder={`Parent ID ${i + 1}`}
            value={parentID}
            //sends the inputted ParentID to the ParentIDs function
            onChangeText={(text) => this.ParentIDs(i, text)}
          />
        ))}
         
         {/* calls the addParentID function when the button is clicked */}
        <TouchableOpacity style={styles.button1} onPress={this.addParentID}>
          <Text style={styles.buttonText}>Attach another Parent account</Text>
        </TouchableOpacity>

         {/* calls the ChildSignup function when the button is clicked */}
        <TouchableOpacity style={styles.button} onPress={this.ChildSignup}>
          <Text style={styles.buttonText}>Child Sign Up</Text>
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
      signupHeading: {
        fontSize: 24,
        marginBottom: 20,
        color: '#8b71de', 
        fontWeight:'bold',
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
      button1: {
        backgroundColor: '#9c84e8', 
        padding: 10,
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

export default ChildSignupScreen;
