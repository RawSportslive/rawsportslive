import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const SkeletonLoader = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.thumbnail, { opacity }]} />
      <View style={styles.textContainer}>
        <Animated.View style={[styles.title, { opacity }]} />
        <Animated.View style={[styles.subtitle, { opacity }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
    borderColor: '#333',
    borderWidth: 1,
  },
  thumbnail: {
    width: '100%',
    height: width * 0.5625, // 16:9 aspect ratio
    backgroundColor: '#333',
  },
  textContainer: {
    padding: 15,
  },
  title: {
    width: '80%',
    height: 20,
    backgroundColor: '#333',
    borderRadius: 4,
    marginBottom: 10,
  },
  subtitle: {
    width: '40%',
    height: 15,
    backgroundColor: '#333',
    borderRadius: 4,
  }
});
