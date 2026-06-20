import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';

class HomepagePar extends Component {
  state = {
    ChildrenData: [],
  };

  //Fetches children data when the screen opens
  componentDidMount() {
    const { ParentID } = this.props.route.params;

    axios.get(`http://192.168.1.156:8000/parents/${ParentID}/children/`)
      .then(response => {
        const data = response.data;
        if (data && data.Children) {
          this.setState({ ChildrenData: data.Children });
        }
      })
      .catch(error => console.error('Error fetching kids data:', error));
  }

  //navigates to Parent Dashboard with child details
  navigateToParentDashboard = (child) => {
    const { ParentID } = this.props.route.params;
    this.props.navigation.navigate('ParentDashboard', {
      ChildName: child.Child_FirstName,
      ParentID: ParentID,
      ChildID: child.ChildID,
    });
  };

  render() {
    const { ChildrenData } = this.state;
    const { Name } = this.props.route.params;

    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Welcome, {Name}!</Text>
        <Text style={styles.text}>Which child would you like to set Activities for today?</Text>

        {/* Displays the list of connected child users with their details */}
        <ScrollView contentContainerStyle={styles.childrenContainer}>
          {ChildrenData.map((child, i) => (
            <TouchableOpacity
              key={i}
              style={styles.childBox}
              onPress={() => this.navigateToParentDashboard(child)}>
              <View style={styles.childInfo}>
                <Text style={styles.childName}>{child.Child_FirstName} ({child.TotalPoints} points)</Text>
                <Text style={styles.childEmoji}>{child.ProfileEmoji}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* Button to add a new child */}
          <View style={styles.addButton}>
            <TouchableOpacity onPress={() => this.props.navigation.navigate('ChildSignup')}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Button to log out */}
        <View style={styles.button}>
          <TouchableOpacity onPress={() => this.props.navigation.navigate('Home')}>
            <Text style={styles.buttonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  heading: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#B79FF1',
  },
  text: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#B79FF1', 
  },
  childrenContainer: {
    marginTop: 10,
  },
  childBox: {
    backgroundColor: '#FBEEDF',
    padding: 10,
    margin: 5,
    borderRadius: 20,
  },
  childInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  childName: {
    fontSize: 20,
    color: '#8384DF',
    fontWeight: 'bold',
    marginLeft:5,
  },
  childEmoji: {
    fontSize: 24,
  },
  button: {
    backgroundColor: '#8384DF',
    padding: 15,
    width: '100%',
    borderRadius: 20,
    marginBottom: 10,
  },
  buttonText: {
    color: '#FBEEDF',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 20,
  },
  addButton:{
    backgroundColor: '#FBEEDF',
    width: 50,
    height: 50,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    top: 20,
    marginLeft: 180,
    marginBottom: 100,
  },
  addButtonText:{
    fontSize: 30,
    color: '#000',
  },
});
export default HomepagePar;


