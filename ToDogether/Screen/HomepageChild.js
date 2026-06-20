import React, { Component } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet,Modal } from 'react-native';
import axios from 'axios';

class HomepageChild extends Component {
  state = {
    activities: [],
    totalPoints: null,
    showEmojiModal: false,
    selectedEmoji: null,
  };

  //fetches total points and activities when the screen opens
  componentDidMount() {
    this.fetchEmoji();
    this.fetchTotalPoints();
    this.fetchActivities();
  }

  //handles emoji click by updating the component state
  EmojiClick = (emoji) => {
    this.setState({ selectedEmoji: emoji, showEmojiModal: false }, () => {
      this.updateProfileEmoji(emoji);
    });
  };

  //sends a PUT request to update the child profile emoji
  updateProfileEmoji = (selectedEmoji) => {
    const { ChildID } = this.props.route.params;
    axios.put(`http://192.168.1.156:8000/data/${ChildID}/update/`, {
      Usertype: 'Child',
      ProfileEmoji: selectedEmoji,
    })
    .then(response => {
      if (response.status === 200) {
        console.log('ProfileEmoji updated:', selectedEmoji);
      }
    })
    .catch(error => {
      console.error('Error updating ProfileEmoji:', error);
    });
  };
  
  //sends a GET request to fetch the child's profile emoji
  fetchEmoji = () => {
    const { ChildID } = this.props.route.params;
    axios.get(`http://192.168.1.156:8000/child/${ChildID}/`)
    .then(response => {
      if (response.data && response.data.ProfileEmoji) {
        this.setState({ selectedEmoji: response.data.ProfileEmoji });
      }
    })
    .catch(error => {
      console.error('Error fetching selected emoji:', error);
    });
  };

  //sends a GET request to fetch total points from the db
  fetchTotalPoints = () => {
    const { ChildID } = this.props.route.params;
    axios
      .get(`http://192.168.1.156:8000/child/${ChildID}/`)
      .then(response => {
        if (response.data && response.data.TotalPoints) {
          this.setState({ totalPoints: response.data.TotalPoints });
        } else {
          this.setState({ totalPoints: 0 });
        }
      })
      .catch(error => {
        console.error('Error fetching total points:', error);
      });
  };

  //sends a GET request to fetch activities from the db
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

  //manages task completion functionality
  toggleComplete = async (activityID, currentCompleted) => {
    const { activities } = this.state;
    const updatedActivities = activities.map((activity) =>
      activity.ActivityID === activityID ? { ...activity, Completed: !currentCompleted } : activity
    );
    this.setState({ activities: updatedActivities });

    //sends a PUT request to update the completion status
    console.log(!currentCompleted)
    axios
    .put(`http://192.168.1.156:8000/activities/${activityID}/update/`, {
      Completed: !currentCompleted,
    })
    .then((response) => {
      if (response.data && response.data.points && response.data.points.TotalPoints) {
        this.setState({ totalPoints: response.data.points.TotalPoints });
      }
      const nowISO = new Date().toISOString();
      console.log(nowISO)
      //sends a POST request to update the total points
      return axios
      .post(`http://192.168.1.156:8000/update/points/`, {
        ActivityID: activityID,
        completedDateTime: nowISO,
      });
    })
    .then(() => {
      //calls the fetchTotalPoints again
      this.fetchTotalPoints();
    })
    .catch((error) => {
      console.error('Error toggling completion:', error);
    });
  };

  //groups activities by due date 
  groupActivitiesByDate = (activities) => {
    const groupedActivities = {};
    activities.forEach((activity) => {
      const dueDate = activity.DueDate;
      if (!groupedActivities[dueDate]) {
        groupedActivities[dueDate] = [];
      }
      groupedActivities[dueDate].push(activity);
    });
    return groupedActivities;
  };   

  render() {
    const { route } = this.props;
    const { Name, ChildID, ParentID } = route.params;
    const { activities, totalPoints, showEmojiModal, selectedEmoji } = this.state;

    const emojis = ['🧸', '😀', '🤡', '🤖', '🤑', '🤔', '🤩', '🦄', '🐧', '🦩'];

    return (
      <View style={styles.container}>
        <View style={styles.dashboardBox}>
          <TouchableOpacity style={styles.emojiButton} onPress={() => this.setState({ showEmojiModal: true })}>
            {selectedEmoji ? (
              <Text style={styles.selectedEmoji}>{selectedEmoji}</Text>
            ) : (
              <Text style={styles.plusSign}>+</Text>
            )} 
          </TouchableOpacity> 
          <Text style={styles.heading}>Welcome, {Name}!</Text>
          <Text style={styles.subheading}>Total points: {totalPoints}</Text>
          <Text style={styles.text1}>
            Tasks to be completed: {activities.filter((activity) => activity.ActivityType === 'task' && !activity.Completed).length}
          </Text>
          <Text style={styles.text1}>
            Habits to be completed: {activities.filter((activity) => activity.ActivityType === 'habit' && !activity.Completed).length}
          </Text>
          <Text style={styles.price}> click on the emoji or the plus sign to change you profile emoji</Text>
          <Text style={styles.price}> REMEMBER ⭐: + 10 points if you complete the activity before the due date </Text>
          <Text style={styles.price}>              : - 10 points if you complete the activity after the due date </Text>
        </View>

        {/* modal for profile emoji options */}
        <Modal animationType="slide" transparent={true} visible={showEmojiModal}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.emojiHeader}>Select an Emoji</Text>
              {emojis.map((emoji, i) => (
                <TouchableOpacity key={i} style={styles.emojiItem} onPress={() => this.EmojiClick(emoji)}>
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>

      <ScrollView>
        {/* Iterate over the keys of the grouped activities 
        and display the due date as a header */}
        <Text style={styles.text}> click on the activities to mark them complete; click on them again to mark them incomplete</Text>
        {Object.keys(this.groupActivitiesByDate(activities)).map((dueDate) => (
          <View key={dueDate}>
            {dueDate !== 'null' && this.groupActivitiesByDate(activities).ActivityType !== 'habit' ? (
              <Text style={styles.dateHeader}>{dueDate}</Text>
            ) : (
              <Text style={styles.dateHeader}>A new habit has just been added!! Click to get bonus points for starting a new habit 😊</Text>
            )}
            {this.groupActivitiesByDate(activities)[dueDate].map((activity) => (
              <TouchableOpacity
                key={activity.ActivityID}
                // calls the toggleComplete 
                onPress={() => this.toggleComplete(activity.ActivityID, activity.Completed)}
              >
                {/* displays the information of the activity */}
                <View style={styles.activityItem}>
                  {/* changes styles when complete activity is set to complete */}
                  <Text style={activity.Completed ? styles.completedText : styles.text}>
                    {activity.ActivityType}: {activity.Description}
                  </Text>
                  {activity.DueDate !== null ? (
                    <Text style={styles.text}>Due: {activity.DueDate} at {activity.DueTime}</Text>
                  ) : null}
                  <Text style={styles.text}>Points available: {activity.Points}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            this.props.navigation.navigate('GameScreen', {
              Name: Name,
              ChildID: ChildID,
              ParentID: ParentID,
              totalPoints: totalPoints,
            });
          }}
        >
          <Text style={styles.buttonText}>Game Inventory</Text>
        </TouchableOpacity>
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
  dashboardBox: {
    backgroundColor: '#68a4f2',
    padding: 5,
    borderRadius: 15,
    width: '100%',
    marginBottom: 10,
    position: 'relative',
  },
  heading: {
    fontSize: 25,
    marginLeft: 5,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#FBEEDF',
  },
  subheading: {
    fontSize: 20,
    marginLeft: 5,
    fontWeight: 'bold',
    color: '#FBEEDF',
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'gray',
  },
  text1: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'darkblue',
    marginLeft: 5,
    marginBottom: 5,
  },
  selectedEmoji: {
    fontSize: 30,
    color: '#000',
  },
  activitiesContainer: {
    marginTop: 10,
  },
  dateHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'darkblue',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  activityItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f8f4f0',
    borderRadius: 15,
    padding: 10,
    borderBottomWidth: 3,
    borderBottomColor: '#ccc',
  },
  checkbox: {
    width: 15,
    height: 15,
    borderWidth: 1,
    borderColor: '#000',
    marginRight: 8,
  },
  completedText: {
    textDecorationLine: 'line-through',
    fontSize: 18,
    color: 'black',
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
    color: '#FBEEDF',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  emojiButton: {
    backgroundColor: '#FBEEDF',
    width: 50,
    height: 50,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 20,
    top: 20,
  },
  plusSign: {
    fontSize: 30,
    color: '#000',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: 'center',
  },
  emojiHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emojiItem: {
    fontSize: 24,
    padding: 10,
    borderRadius: 10,
    margin: 5,
    backgroundColor: '#FBEEDF',
  },
  emojiText: {
    fontSize: 24,
  },
  price: {
    marginTop: 5,
    marginLeft: 2,
    marginBottom: 5,
    fontSize: 15,
    color: 'white',
  },
});

export default HomepageChild;