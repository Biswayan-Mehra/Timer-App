import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Timer } from "../src/types";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  timer: Timer;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export default function TimerCard({ timer, onStart, onPause, onReset }: Props) {
  const progressAnim = useRef(
    new Animated.Value((timer.remainingTime / timer.duration) * 100)
  ).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (timer.remainingTime / timer.duration) * 100,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [timer.remainingTime]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{timer.name}</Text>
        <Text style={styles.category}>{timer.categoryId}</Text>
      </View>

      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
        <Text style={styles.time}>{timer.remainingTime}s</Text>
      </View>

      <View style={styles.controls}>
        {timer.status === "paused" ? (
          <TouchableOpacity style={styles.button} onPress={onStart}>
            <Ionicons name="play" size={20} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={onPause}>
            <Ionicons name="pause" size={20} color="white" />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.button} onPress={onReset}>
          <Ionicons name="refresh" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 16,
    marginTop: 6,
    marginBottom: 6,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  name: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  category: {
    color: "#666",
    fontSize: 14,
  },
  progressContainer: {
    height: 20,
    backgroundColor: "#333",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#007AFF",
    position: "absolute",
  },
  time: {
    color: "white",
    textAlign: "center",
    lineHeight: 20,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  button: {
    backgroundColor: "#333",
    padding: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
  },
});
