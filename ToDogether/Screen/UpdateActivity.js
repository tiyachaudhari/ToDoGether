import React, { Component } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

class UpdateActivity extends Component {
  state = {
    activities: {},
    DatePickerVisibilty: {},
    TimePickerVisibilty: {},
    repeatDays: [],

  };

  componentDidMount() {
    // Fetches the activity data when component mounts
    this.fetchActivities();
  }

  //sends a GET request to fetch the activities from the backend
  fetchActivities = () => {
    const { ActivityID } = this.props.route.params;
  
    axios
      .get(`http://192.168.1.156:8000/activity/${ActivityID}/`)
      .then((response) => {
        const { activity, habit } = response.data;
        const combinedData = {
          ...activity,
          ...habit,
        };
  
        this.setState({ activities: combinedData });
      })
      .catch((error) => {
        console.error('Error fetching activity data:', error);
      });
  };

  //sends a PUT request to send the updated activity data to the backend
  updateActivity = () => {
    const { activities } = this.state;
    const { ActivityID } = this.props.route.params;
    
    console.log(activities)

     // Check if description is empty
    if (!activities.description || activities.description.trim() === '') {
      Alert.alert('Description cannot be empty');
      return; // Stop execution if description is empty
    }

    axios
      .put(`http://192.168.1.156:8000/activities/${ActivityID}/update/2/`, activities)
      .then((response) => {
        console.log('Activity updated successfully:', response.data);
        Alert.alert('Activity updated successfully'); 
      })
      .catch((error) => {
        console.error('Error updating activity:', error);
      });
  };

  //formats time in hh:mm format
  formatTime = (time) => {
    if (!time) return null;

    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
  };

  //formats date in yyyy-mm-dd format
  formatDate = (date) => {
    if (!date) return null;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };


  handleInputChange = (key, value) => {
    const { activities } = this.state;
  
    this.setState({
      activities: {
        ...activities,
        [key]: value,
      },
    });
  };

  showDatePicker = (key) => {
    this.setState((prevState) => ({
      DatePickerVisibilty: {
        ...prevState.DatePickerVisibilty,
        [key]: true,
      },
    }));
  };

  hideDatePicker = (key) => {
    this.setState((prevState) => ({
      DatePickerVisibilty: {
        ...prevState.DatePickerVisibilty,
        [key]: false,
      },
    }));
  };

  showTimePicker = (key) => {
    this.setState((prevState) => ({
      TimePickerVisibilty: {
        ...prevState.TimePickerVisibilty,
        [key]: true,
      },
    }));
  };

  hideTimePicker = (key) => {
    this.setState((prevState) => ({
      TimePickerVisibilty: {
        ...prevState.TimePickerVisibilty,
        [key]: false,
      },
    }));
  };

  handleDate = (key, date) => {
    const formattedDate = this.formatDate(date); // Formats the date
    this.handleInputChange(key, formattedDate); // Updates the activities with the formatted date
    this.hideDatePicker(key);
  };
  
  handleTime = (key, time) => {
    const formattedTime = this.formatTime(time); // Formats the time
    this.handleInputChange(key, formattedTime); // Updates the activities with the formatted time
    this.hideTimePicker(key);
  };

  handleRepeatDayChange = (updatedDays) => {
    this.setState({ repeatDays: updatedDays });
  };


  renderPickers = () => {
    const { activities, DatePickerVisibilty, TimePickerVisibilty } = this.state;
  
    const Effort_PriorityPicker = ({ fieldName, fieldValue, onValueChange }) => {
      return (
        <View>
          <Picker
            selectedValue={fieldValue}
            onValueChange={(itemValue) => onValueChange(fieldName, itemValue)}
          >
            <Picker.Item label={`Update ${fieldName}`} value="" />
            <Picker.Item label="Low" value="low" />
            <Picker.Item label="Medium" value="medium" />
            <Picker.Item label="High" value="high" />
          </Picker>
        </View>
      );
    };
  
    const RepeatDayPicker = ({ repeatDays, handleRepeatDayChange }) => {
      return (
        <View>
          <Picker
            style={styles.picker}
            selectedValue={repeatDays}
            onValueChange={(itemValue) => {
              const i = repeatDays.indexOf(itemValue);
              if (i === -1) {
                handleRepeatDayChange([...repeatDays, itemValue]);
              } else {
                const updatedDays = [...repeatDays];
                updatedDays.splice(i, 1);
                handleRepeatDayChange(updatedDays);
              }
            }}
            mode="multiple"
          >
            <Picker.Item label="Select Repeat Day" value="" />
            <Picker.Item label="Monday" value="mon" />
            <Picker.Item label="Tuesday" value="tue" />
            <Picker.Item label="Wednesday" value="wed" />
            <Picker.Item label="Thursday" value="thu" />
            <Picker.Item label="Friday" value="fri" />
            <Picker.Item label="Saturday" value="sat" />
            <Picker.Item label="Sunday" value="sun" />
          </Picker>
        </View>  
      );
    };
  
    //iterates over activities keys and renders appropriate components 
    return Object.keys(activities).map((key) => { 
      if (typeof activities[key] === 'string' && key !== 'CompletedDateTime' &&
      key !== 'ActivityType') {
        if (key === 'ReminderDate' || key === 'DueDate') {
          return (
            <View key={key}>
              <Text style={styles.text}>{key}</Text>
              <TouchableOpacity onPress={() => this.showDatePicker(key)}>
                <Text>{String(activities[key])}</Text>
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={DatePickerVisibilty[key] || false}
                mode="date"
                onConfirm={(date) => this.handleDate(key, date)}
                onCancel={() => this.hideDatePicker(key)}
              />
            </View>
          );
        } else if (key == 'ReminderTime' || key == 'DueTime' ||
             key == 'StartTime' || key == 'EndTime') { 
          return (
            <View key={key}>
              <Text style={styles.text}>{key}</Text>
              <TouchableOpacity onPress={() => this.showTimePicker(key)}>
                <Text>{String(activities[key])}</Text>
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={TimePickerVisibilty[key] || false}
                mode="time"
                onConfirm={(date) => this.handleTime(key, date)}
                onCancel={() => this.hideTimePicker(key)}
              />
            </View>
          );  
        } else if (key == 'Effort' || key == 'Priority') { 
          return (
            <View key={key}>
            <Text>{key}</Text>
            <Effort_PriorityPicker
              fieldName={key}
              fieldValue={activities[key]}
              onValueChange={(field, value) => this.handleInputChange(field, value)}
            />
          </View>
          );
        } else if (key == 'RepeatDay') { 
          return (
            <View key={key}>
            <Text>{key}</Text>
            <RepeatDayPicker
              fieldName={key}
              fieldValue={activities[key]}
              onValueChange={(field, value) => this.handleInputChange(field, value)}
            />
            <Text>{"['tue', 'wed', 'sun']"}</Text>
          </View>
          );  
        } else {
          return (
            <View key={key}>
              <Text style={styles.text}>{key}</Text>
              <TextInput
                value={activities[key] || ''}
                style={styles.input}
                onChangeText={(text) => this.handleInputChange(key, text)}
                // does not allow input for the frequency field  
                editable={key !== 'Frequency'} 
              />
            </View>
          );
        }
      }
      return null;
    });
  };
  
  //renders all the components together
  render() {
    const { activities } = this.state;
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Activity Type: {activities.ActivityType} </Text> 
        {this.renderPickers()}
        <TouchableOpacity style={styles.button} onPress={this.updateActivity}>
          <Text style={styles.buttonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#2196f3',
    padding: 15,
    width: '100%',
    borderRadius: 20,
    marginBottom: 10,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  datePickerText: {
    fontSize: 16,
    color: '#000',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 10,
    backgroundColor: 'white',
  },
});

export default UpdateActivity;