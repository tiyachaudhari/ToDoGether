import React, { Component } from 'react';
import {View,Text,FlatList,StyleSheet,TouchableOpacity,
  Button,RefreshControl,Alert,Modal,TextInput,} from 'react-native';
import axios from 'axios';

class ParentDashboard extends Component {
  state = {
    //states to hold the fetched values and other properties 
    activities: [],
    CompletedActivities: true,
    refreshing: false,
    Activity: null,
    searchText: '',
  };

  //uses the GET method to fetch activities from the db
  fetchActivities = () => {
    const { ChildID } = this.props.route.params;

    axios
      .get(`http://192.168.1.156:8000/activities/${ChildID}/`)
      .then((response) => {
        const data = response.data;
        if (data) {
          //saves both habits and activities in the activities array
          const combinedActivities = [...data.activities, ...data.habits];
          this.setState({ activities: combinedActivities });
        }
      })
      //error handling
      .catch((error) => console.error('Error fetching activities:', error))
      .finally(() => this.setState({ refreshing: false }));
  };

  //calls the fetchActivities function when screen opens
  componentDidMount() {
    this.fetchActivities();
  }

  //formats time
  formatCompletedTime = (completedTime) => {
    if (!completedTime) {
      return 'N/A';
    }
    const date = new Date(completedTime);
    return date.toLocaleString();
  };

  //calculates days overdue for an activity 
  OverDueDays = (dueDate) => {
    const now = new Date();
    const dueDateTime = new Date(dueDate);
    const timeDiff = now - dueDateTime;
    const daysOverdue = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    return daysOverdue;
  };

  //deletes an activity using the axios DELETE method 
  deleteActivity = async (activityId) => {
    try {
      await axios.delete(`http://192.168.1.156:8000/activities/${activityId}/delete/`);
      this.setState((prevState) => ({
        activities: prevState.activities.filter(
          (activity) => activity.ActivityID !== activityId
        ),
      }));
      Alert.alert('Activity Deleted', 'The activity has been deleted successfully.');
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  //toggles the state of showing completed activities
  ShowCompleted = () => {
    this.setState((prevState) => ({
      CompletedActivities: !prevState.CompletedActivities,
    }));
  };

  //manages refresh action
  Refresh = () => {
    this.setState({ refreshing: true });
    this.fetchActivities();
  };

  //handles opening of the activity modal
  openModal = (activity) => {
    this.setState({ Activity: activity });
  };

  //handles closing of the activity modal
  closeModal = () => {
    this.setState({ Activity: null });
  };

  render() {
    const { activities, CompletedActivities, refreshing, Activity, searchText } = this.state;
    const { ChildName,ParentID,ChildID } = this.props.route.params;
    const { navigation } = this.props;

    return (
      console.log(this.state.activities),
      <View style={styles.container}>
        <View style={styles.dashboardBox}>
          <Text style={styles.headerText}>{ChildName}'s Dashboard</Text>
          <Text style={styles.dashboardtext}>
            {/* outputs the number of incomplete tasks */}
            Tasks to be completed: {activities.filter(activity => activity.ActivityType === 'task' && !activity.Completed).length}
          </Text>
          <Text style={styles.dashboardtext}>
            Habits to be completed: {activities.filter(activity => activity.ActivityType === 'habit' && !activity.Completed).length}
          </Text>
        </View>
        <TextInput
          style = {styles.searchInput}
          placeholder = "Search by Description"
          value = {searchText}
          //updates the state with the inputted value
          onChangeText = {(text) => this.setState({ searchText: text })}
        />
        <Button
        //filters the incomplete activities on the screen
          title={CompletedActivities ? 'Show Incomplete Activities' : 'Show All Activities'}
          onPress={this.ShowCompleted}
        />
        <Text style={styles.subtext}>Scheduled Activities: </Text>
        <FlatList
          data={activities.filter(
            item =>
              (CompletedActivities || !item.Completed) &&
              item.Description &&
              item.Description.toLowerCase().includes(searchText.toLowerCase())
          )}
          //reloads the activities flatlist 
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={this.Refresh} />
          }
          keyExtractor={(item) => item.ActivityID.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => this.openModal(item)}>
              <View style={styles.activityItem}>
                <Text style={styles.text}>{`${item.ActivityType}: ${item.Description}`}</Text>
                <Text style={styles.text}>
                  {/* conditional rendering for outputs according to the completed status  */}
                  {item?.Completed
                    ? `Completed on: ${this.formatCompletedTime(item?.CompletedDateTime)}`
                    // conditional rendering for outputs according to due date and time  
                    : item?.DueDate && item?.DueTime
                    ? new Date() > new Date(`${item?.DueDate} ${item?.DueTime}`)
                      ? `Overdue by: ${this.OverDueDays(item?.DueDate, item?.DueTime)} days`
                      : 'Activity is yet to complete'
                      // conditional rendering for outputs according to activity type
                    : item?.ActivityType === 'habit'
                    ? (
                      <TouchableOpacity onPress={() => navigation.navigate('HabitDetails')}>
                        <Text style={styles.Link}>Habit completion progress</Text>
                      </TouchableOpacity>
                    )
                    : 'No due date or due time set'
                  }
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
        {/* navigates the user to Activity creation screen when "Set Activity" is clicked */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            navigation.navigate('ActivityAssignment', {
              ChildName: ChildName,
              ChildID: ChildID,
              ParentID: ParentID,
            });
          }}
        >
          <Text style={styles.buttonText}>Set Activity</Text>
        </TouchableOpacity>

        {/* Modal to display full activity details */}
        <Modal
          visible={Activity !== null}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {/* outputs the activity details in the modal */}
              <Text style={styles.modalText}>{`${Activity?.ActivityType} : ${Activity?.Description}`}</Text>
              <Text style={styles.modalText}>{`Due Date: ${Activity?.DueDate}`}</Text>
              <Text style={styles.modalText}>{`Due Time: ${Activity?.DueTime}`}</Text>
              <Text style={styles.modalText}>{`Points Available: ${Activity?.Points}`}</Text>
              <Text style={styles.dashboardtext}>{`Effort: ${Activity?.Effort}!!`}</Text>
              <Text style={styles.dashboardtext}>{`Priority: ${Activity?.Priority}!!`}</Text>

              <Text style={styles.modalText}>
                {/* conditional rendering for what to display according to completed status and activity type */}
                {Activity?.Completed
                  ? `Completed on: ${this.formatCompletedTime(Activity?.CompletedDateTime)}`
                  : Activity?.DueDate && Activity?.DueTime
                  ? new Date() > new Date(`${Activity?.DueDate} ${Activity?.DueTime}`)
                    ? `Overdue by: ${this.OverDueDays(Activity?.DueDate, Activity?.DueTime)} days`
                    : 'Activity is yet to complete'
                  : Activity?.ActivityType === 'habit'
                  ? (
                    <TouchableOpacity onPress={() => navigation.navigate('HabitTracking')}>
                      <Text style={styles.Link}>Habit completion progress</Text>
                    </TouchableOpacity>
                  )
                  : 'No due date or due time set'
                }
              </Text>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => {
                    this.closeModal();
                    Alert.alert(
                      'Confirm Deletion',
                      'Are you sure you want to delete this activity?',
                      [
                        {
                          text: 'Cancel',
                          style: 'cancel',
                        },
                        {
                          text: 'Delete',
                          onPress: () => this.deleteActivity(Activity?.ActivityID),
                          style: 'destructive',
                        },
                      ]
                    );
                  }}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
                {/* navigates the user to update activity screen when update button is clicked for activities with due date is present */}
                  <TouchableOpacity
                    style={styles.updateButton}
                    onPress={() => {
                      this.closeModal();
                      navigation.navigate('UpdateActivity', {
                        ActivityID: Activity?.ActivityID,
                      });
                    }}
                  >
                    <Text style={styles.updateButtonText}>Update</Text>
                  </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={this.closeModal}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  headerText: {
    fontSize: 24,
    marginLeft: 5,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'white',
  },
  dashboardBox: {
    backgroundColor: '#88CDF6', 
    padding: 5,
    borderRadius: 15,
    width: '100%',
    marginBottom: 10,
  },
  dashboardtext: {
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 5,
    marginBottom: 5,
    color: 'darkblue'
  },
  subtext: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 5,
  },
  activityItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#FFF0D5',
    borderRadius: 15,
    borderBottomWidth: 3,
    borderBottomColor: '#ccc',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  deleteButton: {
    backgroundColor: 'pink',
    padding: 5,
    borderRadius: 10,
    width: '40%',
  },
  deleteButtonText: {
    color: 'red',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: '#D6CC99', 
    padding: 5,
    borderRadius: 10,
    width: '40%',
    marginLeft: 6,
  },
  updateButtonText: {
    color: 'darkgreen',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
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
    color: '#000',
    textAlign: 'left',
    fontSize: 13,
    fontWeight: 'bold',
  },
  Link: {
    color: '#2196f3',
    textAlign: 'left',
    fontSize: 13,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  closeButton: {
    backgroundColor: 'lightgray',
    padding: 5,
    borderRadius: 10,
    width: '40%',
    marginLeft: 6,
  },
  closeButtonText: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',   
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    width: 300,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 9
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 30,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ParentDashboard;

