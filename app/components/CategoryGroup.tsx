import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { TimerGroup } from "../src/types";
import TimerCard from "./TimerCard";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  group: TimerGroup;
  onToggle: () => void;
  onStartAll: () => void;
  onPauseAll: () => void;
  onResetAll: () => void;
  onTimerAction: (timerId: string, action: "start" | "pause" | "reset") => void;
}

export default function CategoryGroup({
  group,
  onToggle,
  onStartAll,
  onPauseAll,
  onResetAll,
  onTimerAction,
}: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={onToggle}>
        <Text style={styles.title}>{group.category.name}</Text>
        <Text style={styles.count}>{group.timers.length} timers</Text>
      </TouchableOpacity>

      {group.category.isExpanded && (
        <>
          <View style={styles.bulkActions}>
            <TouchableOpacity style={styles.bulkButton} onPress={onStartAll}>
              <Ionicons name="play" size={20} color="white" />
              <Text style={styles.buttonText}>Start All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bulkButton} onPress={onPauseAll}>
              <Ionicons name="pause" size={20} color="white" />
              <Text style={styles.buttonText}>Pause All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bulkButton} onPress={onResetAll}>
              <Ionicons name="refresh" size={20} color="white" />
              <Text style={styles.buttonText}>Reset All</Text>
            </TouchableOpacity>
          </View>

          {group.timers.map((timer) => (
            <TimerCard
              key={timer.id}
              timer={timer}
              onStart={() => onTimerAction(timer.id, "start")}
              onPause={() => onTimerAction(timer.id, "pause")}
              onReset={() => onTimerAction(timer.id, "reset")}
            />
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#333",
    borderRadius: 12,
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  count: {
    color: "#888",
  },
  bulkActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 12,
    backgroundColor: "#1E1E1E",
    marginTop: 8,
    borderRadius: 8,
  },
  bulkButton: {
    backgroundColor: "#333",
    padding: 8,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonText: {
    color: "white",
  },
});
