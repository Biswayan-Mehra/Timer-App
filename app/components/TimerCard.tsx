import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Timer } from "../src/types";

interface Props {
  timer: Timer;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export default function TimerCard({ timer, onStart, onPause, onReset }: Props) {
  const progress = (timer.remainingTime / timer.duration) * 100;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{timer.name}</Text>
        <Text style={styles.category}>{timer.categoryId}</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
        <Text style={styles.time}>{timer.remainingTime}s</Text>
      </View>

      <View style={styles.controls}>
        {timer.status === 'paused' ? (
          <TouchableOpacity style={styles.button} onPress={onStart}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={onPause}>
            <Text style={styles.buttonText}>Pause</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.button} onPress={onReset}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  name: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  category: {
    color: '#666',
    fontSize: 14,
  },
  progressContainer: {
    height: 20,
    backgroundColor: '#333',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    position: 'absolute',
  },
  time: {
    color: 'white',
    textAlign: 'center',
    lineHeight: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: '#333',
    padding: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
  },
});
