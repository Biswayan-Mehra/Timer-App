import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { TimerHistory } from './src/types';  // Updated import path
import { loadHistory } from './src/utils/storage';  // Updated import path

export default function History() {
  const [history, setHistory] = useState<TimerHistory[]>([]);

  useEffect(() => {
    const loadHistoryData = async () => {
      const historyData = await loadHistory();
      setHistory(historyData);
    };

    loadHistoryData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <ScrollView style={styles.container}>
      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No completed timers yet</Text>
          <Text style={styles.emptyStateSubText}>
            Complete some timers to see them here
          </Text>
        </View>
      ) : (
        history.map((item) => (
          <View key={item.id} style={styles.historyItem}>
            <Text style={styles.timerName}>{item.timerName}</Text>
            <Text style={styles.categoryName}>{item.categoryName}</Text>
            <Text style={styles.durationText}>Duration: {item.duration} seconds</Text>
            <Text style={styles.completedAt}>
              Completed: {formatDate(item.completedAt)}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyStateText: {
    color: 'white',
    fontSize: 24,
    marginBottom: 8,
  },
  emptyStateSubText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
  historyItem: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  timerName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  categoryName: {
    color: '#888',
    fontSize: 14,
    marginBottom: 4,
  },
  durationText: {  // Added durationText style
    color: '#888',
    fontSize: 14,
    marginBottom: 4,
  },
  completedAt: {
    color: '#666',
    fontSize: 12,
  },
});
