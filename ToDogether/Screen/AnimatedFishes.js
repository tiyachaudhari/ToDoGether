import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const AnimatedFishes = ({ selectedFishes }) => {
  console.log('AnimatedFishes - selectedFishes:', selectedFishes);
  const animatedPositions = selectedFishes.map(() => {
    return {
      x: useSharedValue(0),
    };
  });

  animatedPositions.forEach((pos) => {
    pos.x.value = withRepeat(
      withTiming(500, { duration: 4000, easing: Easing.linear }),
      -1 // repeats indefinitely
    );
  });

  return (
    <View style={styles.container}>
      {selectedFishes.map((fish, index) => {
        const animatedStyle = useAnimatedStyle(() => {
          return {
            transform: [{ translateX: animatedPositions[index].x.value }],
          };
        });

        return (
          <Animated.View
            key={`${fish.FishID}_${index}`}
            style={[
              styles.selectedFishesContainer,
              animatedStyle,
              { top: 50 * index },
            ]}
          >
            <Image
              source={{ uri: fish.FishImage }}
              style={styles.selectedFishImage}
            />
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 20,
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
  
export default AnimatedFishes;