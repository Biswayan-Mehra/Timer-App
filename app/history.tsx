import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { TimerHistory } from "./src/types";
import { loadHistory } from "./src/utils/storage";

export default function History() {
  const [history, setHistory] = useState<TimerHistory[]>([]);
  const [loading, setLoading] = useState(true); // Add a loading state
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadHistoryData = async () => {
      console.log("Loading history data..."); // Debugging
      const historyData = await loadHistory();
      console.log("History Data:", historyData); // Debugging

      // Simulate a delay of 3 seconds (3000 milliseconds) before updating the state
      setTimeout(() => {
        setHistory(historyData);
        setLoading(false); // Data has been loaded, set loading to false

        // Fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      }, 600); // 3-second delay
    };

    loadHistoryData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#121212" barStyle="light-content" />
      <Text style={styles.header}>History</Text>
      <ScrollView style={styles.scrollContainer}>
        {loading ? (
          // Show a loading indicator while data is being fetched
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading history...</Text>
          </View>
        ) : history.length === 0 ? (
          // Show "No completed timers yet" if history is empty
          <Animated.View style={[styles.emptyState, { opacity: fadeAnim }]}>
            <Text style={styles.emptyStateText}>No completed timers yet</Text>
            <Text style={styles.emptyStateSubText}>
              Complete some timers to see them here
            </Text>
          </Animated.View>
        ) : (
          // Show history items if data is available
          history.map((item) => (
            <Animated.View
              key={item.id}
              style={[styles.historyItem, { opacity: fadeAnim }]}
            >
              <Text style={styles.timerName}>{item.timerName}</Text>
              <Text style={styles.categoryName}>{item.categoryName}</Text>
              <Text style={styles.durationText}>
                Duration: {item.duration} seconds
              </Text>
              <Text style={styles.completedAt}>
                Completed: {formatDate(item.completedAt)}
              </Text>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  loadingText: {
    color: "white",
    fontSize: 16,
    marginTop: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  emptyStateText: {
    color: "white",
    fontSize: 24,
    marginBottom: 8,
  },
  emptyStateSubText: {
    color: "#888",
    fontSize: 16,
    textAlign: "center",
  },
  historyItem: {
    backgroundColor: "#333",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  timerName: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  categoryName: {
    color: "#888",
    fontSize: 14,
    marginBottom: 4,
  },
  durationText: {
    color: "#888",
    fontSize: 14,
    marginBottom: 4,
  },
  completedAt: {
    color: "#666",
    fontSize: 12,
  },
});
