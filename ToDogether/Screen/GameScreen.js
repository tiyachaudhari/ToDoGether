import React, { Component } from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity,
   Modal, FlatList, ImageBackground, Button} from 'react-native';
import axios from 'axios';

class GameScreen extends Component {
  state = {
    //states to manage the visibility of different components and hold data values
    isFishShopVisible: false,
    isFoodShopVisible: false,
    isInformationBookletVisible: false,
    currentFoodShop: null,
    currentFishShop: null,
    selectedFishes: [],
    fishes: [], 
    showModal: false, 
    totalPoints: null,
    selectedFish : null,
    selectedFishFedLevel: null,
    selectedFishMaxFoodLevel: null,
    tankTemperature: null,
    oxygenLevel: null,
  };

  //sends a GET request to get the fishe data from the db
  fetchFishes = () => {
    axios
      .get('http://192.168.1.156:8000/fishes/')
      .then(response => {
        const updatedData = response.data.map(fish => ({
          ...fish,
          FishImage: `http://192.168.1.156:8000${fish.FishImage}`,
        }));
        this.setState({ fishes: updatedData });
        console.log('Fishes from API:', this.state.fishes);
      })
      .catch((error) => {
        console.error('Error in buying the fish', error);
      });
  };

  //sends a GET request to get the user's fishes 
  fetchChildFishes = () => {
    const { ChildID } = this.props.route.params;
    axios
      .get(`http://192.168.1.156:8000/child/${ChildID}/fishes/`)
      .then(response => {
        const updatedData = response.data.map(fish => ({
          ...fish,
          FishImage: `http://192.168.1.156:8000${fish.FishImage}`,
        }));
        this.setState({ selectedFishes: updatedData });
        console.log('User\'s fishes:', this.state.selectedFishes);
      })
      .catch((error) => {
        console.error('Error in getting the user fishes', error);
      });
  };

  //sends a GET request to fetch a fish's food status from the db
  fetchFishStatus = (FishID) => {
    axios
      .get(`http://192.168.1.156:8000/child/fish/${FishID}/status`)
      .then(response => {
        const { fedLevel, maxFoodLevel } = response.data;
        this.setState({
          selectedFishFedLevel: fedLevel,
          selectedFishMaxFoodLevel: maxFoodLevel
        });
      })
      .catch(error => {
        console.error('Error fetching fish status:', error);
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

  //sends a GET request to get the tank adjustments 
  fetchAdjustments = () => {
    const { ChildID } = this.props.route.params;
    axios
      .get(`http://192.168.1.156:8000/child/${ChildID}/adjustments/`)
      .then(response => {
        if (response.data.OxygenLevelAdjustment && response.data.TemperatureAdjustment) {
          this.setState({ tankTemperature: response.data.TemperatureAdjustment, 
          oxygenLevel: response.data.OxygenLevelAdjustment });
        } else {
          this.setState({ tankTemperature: 0, 
            oxygenLevel: 0});
        }
      })
      .catch((error) => {
        console.error('Error in getting the users tank adjustments', error);
      });
  };

  //fetches fishes, user's fishes and tank adjustments when the screen opens
  componentDidMount() {
    this.fetchFishes();
    this.fetchChildFishes();
    this.fetchTotalPoints();
    this.fetchAdjustments();
  };

  //toggles the visibility of the fish shop modal
  toggleFishShopModal = () => {
    this.setState((prevState) => ({
      isFishShopVisible: !prevState.isFishShopVisible,
      currentFishShop: 'fish', 
    }));
  };

  //toggles the visibility of the food shop modal
  toggleFoodShopModal = () => {
    this.setState((prevState) => ({
      isFoodShopVisible: !prevState.isFoodShopVisible,
    }));
  };

  //toggles the visibility of the information booklet modal
  toggleInformationModal = () => {
    this.setState((prevState) => ({
      isInformationBookletVisible: !prevState.isInformationBookletVisible,
    }));
  }

  //function to buy a fish 
  selectFish = (fish) => {
    const { selectedFishes } = this.state;
    const { route } = this.props;
    const { ChildID } = route.params;
    const data = {
      FishID: fish.FishID,
      ChildID: ChildID,
      currentTime: this.state.currentTime,
    }
  
    // Prevents further execution if the limit is reached
    if (selectedFishes.length >= 4) {
      console.log(selectedFishes.length)
      alert('One aquarium can only fit 4 fishes!!');
      return; 
    }
    
    //sends a POST request to add the selected fish to the user's fish
    axios
    .post('http://192.168.1.156:8000/child/fish/', data)
    .then(() => {
      //sends a POST request to update the points 
      axios
        .post(`http://192.168.1.156:8000/update/points/`, data)
        .then(() => {
          this.setState(
            (prevState) => {
              const updatedFishes = [...prevState.selectedFishes, { ...fish }];
              return { selectedFishes: updatedFishes };
            },
          );
        })
        //error handling 
        .catch((error) => {
          console.error('Error updating points:', error);
        });
    })
    .catch((error) => {
      console.error('Error in buying the fish', error);
    });
};

feedFish = (foodItem) => {
  const { route } = this.props;
  const { ChildID } = route.params;

  // Get the selected fish from the state
  const selectedFish = this.state.selectedFish; 

  if (!selectedFish) {
    console.error('No fish selected');
    return;
  }

  const { FishID } = selectedFish;
  const data = {
    FishID: FishID,
    ChildID: ChildID,
    FoodPoints: parseInt(foodItem.points),
    FedTime: this.state.currentTime,
  }

  //sends a PATCH request to update the fish fedLevel
  axios
    .patch(`http://192.168.1.156:8000/fish/feed/`, data)
    .then((response) => {
      console.log(response.data)
      //handles the responses from the server and outputs them as an alert
      if (response.data.OverfedMessage) {
        alert(response.data.OverfedMessage);
      } else {
        alert(`Your fish has been fed!!`);
      }
    })
    //error handling 
    .catch((error) => {
      console.error('Error feeding the fish:', error);
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
  
  //renders the fish shop items 
  renderShopItems = () => {
    const baseImageURL = 'http://192.168.1.156:8000'; 
    const shopData = this.state.currentFishShop === 'fish' ? this.state.fishes : [];
    
    return (
      <FlatList
        data={shopData}
        keyExtractor={(item, i) => {
          if (item && item.FishID) {
            return item.FishID.toString();
          }
          return i.toString();
        }}
        renderItem={({ item }) => {
          //ensures that the image is in an url form
          const imageUrl = item.FishImage.startsWith('http') ? item.FishImage : baseImageURL + item.FishImage;
          return (
            <TouchableOpacity onPress={() => this.selectFish(item)}>
              <View style={styles.additionalInfo}>
                <Image
                  source={{ uri: imageUrl }}
                  style={{ width: 100, height: 100 }}
                  onError={(error) => console.log('Image Load Error:', error)}
                />
                <Text style={styles.name}>{item.FishName}</Text>
                <Text style={styles.
                  price}>{item.FishPrice}</Text>
                {console.log('Image Source:', imageUrl)} 
              </View>
            </TouchableOpacity>
          );
        }}
      />
    );
  };


  renderFood = () => {
    const foodItems = [
      { id: 1, image: require('../assets/food1.png'), points: '10.00' },
      { id: 2, image: require('../assets/food2.png'), points: '15.00' },
      { id: 3, image: require('../assets/food3.png'), points: '20.00' },
      { id: 4, image: require('../assets/food4.png'), points: '30.00' },
    ];
  
    const { selectedFish } = this.state; 
  
    return (
      <FlatList
        data={foodItems}
        keyExtractor={(item) => item.id.toString()}
        horizontal={true}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => this.feedFish(item, selectedFish)}>
            <View>
              <Image source={item.image} style={{ width: 100, height: 100 }} />
              <Text style={styles.name}>{item.points}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    );
  };

  //renders the selected fish 
  renderSelectedFishes = () => {
    const { selectedFishes } = this.state;

    if (!selectedFishes || selectedFishes.length === 0) {
      return <Text>No fishes selected</Text>;
    }
  
    return (
      <FlatList
        data={selectedFishes}
        keyExtractor={(fish, i) => `${fish.FishID}_${i}`}
        horizontal={true}
        renderItem={({ item }) => (
          <View style={styles.selectedFishesContainer}>
            <TouchableOpacity onPress={() => this.handleFishPress(item)}>
              <Image source={{ uri: item.FishImage }} style={styles.selectedFishImage} />
            </TouchableOpacity>
          </View>
        )}
      />
    );
  };

  handleFishPress = (fish) => {
    this.fetchFishStatus(fish.FishID);
    this.setState({
      selectedFish: fish,
    });
    this.toggleFoodShopModal();
  };

  render() {
    const { route } = this.props;
    const { Name } = route.params;
    const { totalPoints, selectedFishes, 
      selectedFishFedLevel, selectedFishMaxFoodLevel, tankTemperature, oxygenLevel} = this.state;

    // console.log('GameScreen - selectedFishes:', this.state.selectedFishes);

    return (
      <ImageBackground
        source={require('../assets/background.png')}
        style={styles.backgroundImage}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.screenTitle}>{Name}'s Aquarium</Text>
            <Text style={styles.screenTitle}>Total Points: {totalPoints}</Text>
            <TouchableOpacity onPress={() => this.toggleFishShopModal('fish')}>
              <View style={styles.buttonTopRight}> 
                <Text style={styles.buttonText}>Fish Shop</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.additionalInfo}>
          <TouchableOpacity onPress={() => this.toggleInformationModal('fish')}>
              <View style={styles.buttonTopRight}> 
                <Text style={styles.buttonText}>information booklet</Text>
              </View>
          </TouchableOpacity>
            <Text style={styles.screenTitle}>Tank Temperature: {tankTemperature} °C</Text>
            <Text style={styles.screenTitle}>Oxygen Level: {oxygenLevel} ppm</Text>
            <Button title={'Click to change water'}>
            </Button>
            <Text style={styles.screenTitle}>Your pets: </Text>
            <Text style={styles.price}>click on the fish to buy food for your fish</Text>
            <View style={styles.selectedFishesContainer}>
              {this.renderSelectedFishes()}
            </View>
          </View>

          {/* Modal for Information Booklet */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={this.state.isInformationBookletVisible}
            onRequestClose={this.toggleInformationModal}
          >
            <View style={styles.FishInfoContainer}>
              <Text style={styles.modalTitle}>Information Booklet</Text>
              <Text style={styles.screenTitle}>Ideal Tank Temperature must be between 24°C to 26°C </Text>
              <Text style={styles.screenTitle}>Ideal Oxygen Level must be between 10ppm to 20ppm </Text>
              <Text style={styles.text}>Make sure to maintain a clean tank environment by changing the water ONCE A WEEK</Text>
              <Text style={styles.text}>Avoid going above or below the given ideal values for temperature and oxygen</Text>
              <Text style={styles.text}>None ideal conditions in your tank can cause your fish harm</Text>
              <TouchableOpacity onPress={this.toggleInformationModal}>
                <View style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </View>
              </TouchableOpacity>
            </View>
          </Modal>

          {/* Modal for Fish Shop */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={this.state.isFishShopVisible}
            onRequestClose={this.toggleFishShopModal}
          >
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Fish Shop</Text>
              <Text style={styles.price}>click on the fish image to buy the fish</Text>
                {this.renderShopItems()}
              <TouchableOpacity onPress={this.toggleFishShopModal}>
                <View style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>Close Fish Shop</Text>
                </View>
              </TouchableOpacity>
            </View>
          </Modal>

          {/* modal for food shop */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={this.state.isFoodShopVisible}
            onRequestClose={this.toggleFoodShopModal}
          >
            <View style={styles.FishInfoContainer}>
              <Text style={styles.modalTitle}>Your Fish's Inventory</Text>
              <Text style={styles.screenTitle}>Fed Level: {selectedFishFedLevel}</Text>
              <Text style={styles.screenTitle}>Maximum Food Level: {selectedFishMaxFoodLevel}</Text>
              <Text style={styles.price}>Click and buy one of the food item to feed your fish: </Text>
              {this.renderFood()}
              <Text style={styles.text}>Feed your fish responsibly by staying within its 'Maximum Food level' to maintain a healthy and happy aquatic companion !!</Text>
              <TouchableOpacity onPress={this.toggleFoodShopModal}>
                <View style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>Close Food Shop</Text>
                </View>  
              </TouchableOpacity>
            </View>
          </Modal>

          <FlatList
            data={selectedFishes}
            keyExtractor={(fish, i) => `${fish.FishID}_${i}`}
            renderItem={({ item }) => (
              <View style={styles.selectedFishesContainer}>
                  <Image source={{ uri: item.FishImage }} style={styles.selectedFishImage} />
              </View>
            )}
          />
        </View>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover', 
    justifyContent: 'center',
  },
  header: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 20,
    marginLeft: 10,
    marginRight: 10,
  },
  additionalInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'column',
    alignItems: 'flex-start', 
    marginTop: 10, 
    padding: 10,
    borderRadius: 20,
    marginLeft: 10,
    marginRight: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 150,
    marginBottom: 80,
    margin: 100,
    borderRadius: 20,
  },
  FishInfoContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 300,
    marginBottom: 300,
    margin: 100,
    borderRadius: 30,
  },
  modalTitle: {
    fontSize: 20,
    color: 'white',
    marginTop: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  fishItem: {
    alignItems: 'center',
    margin: 5,
  },

  fish: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  name: {
    marginTop: 5,
    color: 'white',
    fontWeight: 'bold',
  },
  text: {
    marginTop: 5,
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    margin: 60,
    marginBottom: 10,
  },
  price: {
    marginTop: 5,
    fontSize: 15,
    color: 'white',
  },
  closeButton: {
    backgroundColor: 'grey',
    padding: 15,
    borderRadius: 9,
    marginBottom: 20,
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 15,
  },
  buttonTopRight: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    marginRight: 5,
  },
  buttonText: {
    color: 'darkgreen',
    fontWeight: 'bold',
    fontSize: 15,
  },
  screenTitle: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    margin: 10,
  },
  selectedFishesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    marginLeft: 20,
    // justifyContent: 'center',
  },
  selectedFishImage: {
    width: 80,
    height: 80,
    margin: 5,
  },
});

export default GameScreen;
