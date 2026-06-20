import React, { Component } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';

class ActivityAssignment extends Component {
  //states to hold the input values and to manage picker visibility
  state = {
    activityType: '',
    description: '',
    reminderDate: null,
    dueDate: null,
    effort: '',
    priority: '',
    frequency: '',
    reminderTime: null,
    dueTime: null,
    repeatDays: [],
    dailyRepeatCount: null,
    startTime: null,
    endTime: null,
    ReminderDatePicker: false,
    ReminderTimePicker: false,
    DueDatePicker: false,
    DueTimePicker: false,
    StartTimePicker: false,
    EndTimePicker: false,
    TimePicker: false,
    DatePicker: false,
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

  //handles activity type change
  ActivityType = (selectedType) => {
    this.setState({ activityType: selectedType });
  };

  //handles the time change for different time fields
  Time = (selectedTime, pickerType) => {
    //performs different actions for different cases (time fields)
    switch (pickerType) {
      case 'reminder':
        //hides the picker and updates the state with the selected time for each field
        this.setState({ ReminderTimePicker: false, reminderTime: selectedTime });
        break;
      case 'due':
        this.setState({ DueTimePicker: false, dueTime: selectedTime });
        break;
      case 'start':
        this.setState({ StartTimePicker: false, startTime: selectedTime });
        break;
      case 'end':
        this.setState({ EndTimePicker: false, endTime: selectedTime });
        break;
      default:
        break;
    }
  };

  //handles the date change for different date fields
  Date = (selectedDate, pickerType) => {
    //performs different actions for different cases (date fields)
    switch (pickerType) {
      case 'reminder':
        //hides the picker and updates the state with the selected date for each field
        this.setState({ ReminderDatePicker: false, reminderDate: selectedDate });
        break;
      case 'due':
        this.setState({ DueDatePicker: false, dueDate: selectedDate });
        break;
      default:
        break;
    }
  };

  //renders the time picker component
  TimePicker = (pickerType, selectedTime) => {
    return (
      <>
      {/* outputs the time picker */}
        <TouchableOpacity onPress={() => this.setState({ TimePicker: pickerType })} style={styles.input}>
          <TextInput
            editable={false}
            placeholder={`${pickerType} time`}
            //outputs the formatted selected time
            value={selectedTime ? this.formatTime(selectedTime) : `${pickerType} time`}
            style={styles.PickerText}
          />
        </TouchableOpacity>
        {this.state.TimePicker === pickerType && (
          <DateTimePickerModal
            isVisible={true}
            mode="time"
            display="default"
            onConfirm={(time) => {
              //sends the date and picker type to the time function
              this.Time(time, pickerType);
              this.setState({ TimePicker: null });
            }}
            onCancel={() => this.setState({ TimePicker: null })}
          />
        )}
      </>
    );
  };

  //renders the date picker component
  DatePicker = (pickerType, selectedDate) => {
    return (
      <>
      {/* outputs the date picker */}
        <TouchableOpacity onPress={() => this.setState({ DatePicker: pickerType })} style={styles.input}>
          <TextInput
            editable={false}
            placeholder={`${pickerType} Date`}
            //outputs the formatted selected date
            value={selectedDate ? this.formatDate(selectedDate) : `${pickerType} Date`}
            style={styles.PickerText}
          />
        </TouchableOpacity>
        {this.state.DatePicker === pickerType && (
          <DateTimePickerModal
            isVisible={true}
            mode="date"
            display="default"
            onConfirm={(date) => {
              //sends the date and picker type to the Date function
              this.Date(date, pickerType);
              this.setState({ DatePicker: null });
            }}
            onCancel={() => this.setState({ DatePicker: null })}
          />
        )}
      </>
    );
  };

  //handles the repeat day change 
  RepeatDay = (selectedDays) => {
    this.setState({ repeatDays: selectedDays });
  };

  //renders the effort picker components 
  EffortPicker = () => {
    return (
      <View>
        <Picker
          style={styles.picker}
          selectedValue={this.state.effort}
          //updates the state with the selected value
          onValueChange={(itemValue) => this.setState({ effort: itemValue })}
        >
          <Picker.Item label="Select Effort" value="" />
          <Picker.Item label="Low" value="Low" />
          <Picker.Item label="Medium" value="Medium" />
          <Picker.Item label="High" value="High" />
        </Picker>
      </View>
    );
  };

  //renders the piority picker components 
  PriorityPicker = () => {
    return (
      <View>
        <Picker
          style={styles.picker}
          selectedValue={this.state.priority}
          onValueChange={(itemValue) => this.setState({ priority: itemValue })}
        >
          <Picker.Item label="Select Priority" value="" />
          <Picker.Item label="Low" value="Low" />
          <Picker.Item label="Medium" value="Medium" />
          <Picker.Item label="High" value="High" />
        </Picker>
      </View>
    );
  };

  //renders the frequency picker components 
  FrequencyPicker = () => {
    return (
      <View>
        <Picker
          style={styles.picker}
          selectedValue={this.state.frequency}
          onValueChange={(itemValue) => this.setState({ frequency: itemValue })}
        >
          <Picker.Item label="Select Frequency" value="" />
          <Picker.Item label="Daily" value="Daily" />
          <Picker.Item label="Weekly" value="Weekly" />
        </Picker>
      </View>
    );
  };

  //renders the repeat days picker components 
  RepeatDaysPicker = () => {
    return (
      <View>
        <Picker
          style={styles.picker}
          selectedValue={this.state.repeatDays}
          //adds the selected day into the list 
          onValueChange={(itemValue) => {
            const i = this.state.repeatDays.indexOf(itemValue);
            //checks whether the selected day is in the list or not
            if (i === -1) {
              this.RepeatDay([...this.state.repeatDays, itemValue]);
            } else {
              const updatedDays = [...this.state.repeatDays];
              updatedDays.splice(i, 1);
              this.RepeatDay(updatedDays);
            }
          }}
          //allows multiple inputs 
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

  //function for rendering the task fields
  renderTaskFields = () => {
    return (
      <View>
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={this.state.description}
          onChangeText={(text) => this.setState({ description: text })}
        />
        {/* calls the DatePicker function with the picker type parameters */}
        <Text style={styles.text}>Reminder Date: </Text>
        {this.DatePicker('reminder', this.state.reminderDate)}
        {/* calls the TimePicker function with the picker type parameters */}
        <Text style={styles.text}>Reminder Time: </Text>
        {this.TimePicker('reminder', this.state.reminderTime)}

        <Text style={styles.text}>Due Date: </Text>
        {this.DatePicker('due', this.state.dueDate)}
        <Text style={styles.text}>Due Time: </Text>
        {this.TimePicker('due', this.state.dueTime)}

        {this.EffortPicker()}
        {this.PriorityPicker()}
      </View>
    );
  };
 
  //function for rendering the habit fields
  renderHabitFields = () => {
    return (
      <View>
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={this.state.description}
          onChangeText={(text) => this.setState({ description: text })}
        />
        {this.EffortPicker()}
        {this.PriorityPicker()}
        <Text style={styles.text}>repeat this habit: </Text>
        {this.FrequencyPicker()}
        {/* checks which frequency was selected and renders fields accordingly */}
        {this.state.frequency === 'Daily' && (
          <>
            <Text style={styles.text}>the following times: </Text>
            <TextInput
              style={styles.input}
              placeholder="Repeat Count"
              value={this.state.dailyRepeatCount !== null ? this.state.dailyRepeatCount.toString() : ''}
              onChangeText={(integer) => {
                const parsedInteger = parseInt(integer, 10);
                //input validation: only allows input from 0 to 24
                if (integer === '' || (!isNaN(parsedInteger) && parsedInteger >= 0 && parsedInteger <= 24)) {
                  this.setState({ dailyRepeatCount: integer === '' ? null : parsedInteger });
                }
              }}
              keyboardType="numeric"
              maxLength={2}
            />
            {/* outputs the different fields with dailyrepeatcount has been set to 1 */}
            {this.state.dailyRepeatCount === 1 ? (
              <>
                <Text style={styles.text}>reminder time: </Text>
                {this.TimePicker('reminder', this.state.reminderTime)}
                <Text>the habit would be due at 23.59 every day until deleted</Text>
              </>
            ) : (
              //outputs these fields if dailyrepeatcount is not 1
              <>
                <Text style={styles.text}>Start at: </Text>
                {this.TimePicker('start', this.state.startTime)}
                <Text style={styles.text}>End at: </Text>
                {this.TimePicker('end', this.state.endTime)}
              </>
            )}
          </>
        )}

        {this.state.frequency === 'Weekly' && (
          <>
            <Text style={styles.text}>on the following days: </Text>
            {this.RepeatDaysPicker()}
            <View>
              {/* outputs the selected days in a form of a list */}
              <Text style={styles.text}>Selected days:</Text>
              {this.state.repeatDays.map((day, i) => (
                <Text key={i}>{day}</Text>
              ))}
            </View>
            <Text style={styles.text}>at the following time: </Text>
            {this.TimePicker('due', this.state.dueTime)}
          </>
        )}
      </View>
    );
  };

  //submits the Activity Data to the backend server
  Activity = () => {
    const selectedFrequency = this.state.frequency ? this.state.frequency.toLowerCase() : null;
    
    //Validation checks for task
    if (this.state.activityType === 'task') {
      if (!this.state.description || !this.state.effort || !this.state.priority) {
        alert('Please fill in all mandatory fields (Description, effort and priority) for task.');
        return;
      }
    }
    //validation checks for habit
    if (this.state.activityType == 'habit') {
      if (!this.state.description || !this.state.frequency || 
        !this.state.effort || !this.state.priority ) {
        alert('Please fill in all mandatory fields (description, frequency, effort and priority) for habit');
        return;
      }
    }

    //validation checks for habit with daily frequency
    if (this.state.activityType === 'habit' && this.state.frequency === 'Daily') {
      if (!this.state.dailyRepeatCount) {
        alert('Please fill in all mandatory fields (daily repeat count) for daily habit.');
        return;
      }

      //Validation checks for habit with daily repeat count as 1
      if (this.state.dailyRepeatCount !== 1) {
        if (!this.state.startTime || !this.state.endTime) {
          alert('Please fill in all mandatory fields ( start time and end time) for daily habit.');
          return;
        }
      }
    }

     //validation checks for habit with weekly frequency
    if (this.state.activityType === 'habit' && this.state.frequency === 'Weekly') {
      if (!this.state.effort || !this.state.priority || this.state.repeatDays.length === 0 || !this.state.dueTime) {
        alert('Please fill in all mandatory fields (repeat days and due time) for weekly habit.');
        return;
      }
    }
    
    const ActivityData = {
      ActivityType: this.state.activityType.toLowerCase(),
      Description: this.state.description,
      ReminderDate: this.formatDate(this.state.reminderDate),
      ReminderTime: this.formatTime(this.state.reminderTime),
      DueDate: this.formatDate(this.state.dueDate),
      DueTime: this.formatTime(this.state.dueTime),
      Effort: this.state.effort.toLowerCase(),
      Priority: this.state.priority.toLowerCase(),
      Frequency: selectedFrequency,
      RepeatDay: this.state.repeatDays,
      DailyRepeatCount: this.state.dailyRepeatCount,
      StartTime: this.formatTime(this.state.startTime),
      EndTime: this.formatTime(this.state.endTime),
      ParentID: this.props.route.params.ParentID,
      ChildID: this.props.route.params.ChildID,
    };

    //sends a POST request to the backend with the data to create the Activity
    axios
      .post('http://192.168.1.156:8000/activities/create/', ActivityData)
      .then((response) => {
        console.log('Activity set successfully:', response.data);
        alert(`${this.state.activityType} set successfully to ${this.props.route.params.ChildName}`);
      })
      //errro handling
      .catch((error) => {
        console.error('Error setting up Activity:', error);
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

  //renders the initial components 
  render() {
    const { activityType } = this.state;

    return (
      <View style={styles.container}>
        {/* renders the Activity type picker components  */}
        <Picker
          style={styles.picker}
          selectedValue={activityType}
          onValueChange={this.ActivityType}
        >
          <Picker.Item label="Select Activity Type" value="" />
          <Picker.Item label="Habit" value="habit" />
          <Picker.Item label="Task" value="task" />
        </Picker>
        {/* checks what activity has been selected and calls a function accordingly */}
        {activityType === 'task' ? this.renderTaskFields() : null}
        {activityType === 'habit' ? this.renderHabitFields() : null}
        {/* calls the Activity function when save button is clicked */}
        <TouchableOpacity style={styles.button} onPress={this.Activity}>
          <Text style={styles.buttonText}>Save {activityType}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#FFF0D5',
    justifyContent: 'center'
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
  PickerText: {
    fontSize: 16,
    color: '#000',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 10,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#68a4f2',
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
});

export default ActivityAssignment;


