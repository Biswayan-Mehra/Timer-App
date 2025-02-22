import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { Timer, TimerHistory, TimerGroup } from "./src/types";
import {
  loadTimers,
  saveTimers,
  loadHistory,
  saveHistory,
} from "./src/utils/storage";
import CategoryGroup from "./components/CategoryGroup";

export default function HomeScreen() {
  const router = useRouter();
  const [timers, setTimers] = useState<Timer[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedTimer, setCompletedTimer] = useState<Timer | null>(null);
  const [categoryStates, setCategoryStates] = useState<{
    [key: string]: boolean;
  }>({});
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const intervalRef = useRef<NodeJS.Timeout>();
  const isLoadingRef = useRef(false);

  const loadStoredTimers = useCallback(async () => {
    if (isLoadingRef.current) return;

    try {
      isLoadingRef.current = true;
      const storedTimers = await loadTimers();

      // Sort timers by ID to maintain consistent order
      const sortedTimers = [...storedTimers].sort(
        (a, b) => parseInt(a.id) - parseInt(b.id)
      );

      setTimers(sortedTimers);

      // Update category states while preserving existing states
      const categories = [
        ...new Set(sortedTimers.map((timer) => timer.categoryId)),
      ];
      setCategoryStates((prevStates) => {
        const newStates = { ...prevStates };
        categories.forEach((cat) => {
          if (!(cat in newStates)) newStates[cat] = true;
        });
        return newStates;
      });
    } finally {
      isLoadingRef.current = false;
    }
  }, []);

  const addToHistory = useCallback(async (timer: Timer): Promise<boolean> => {
    try {
      const historyEntry: TimerHistory = {
        id: Date.now().toString(),
        timerName: timer.name,
        categoryName: timer.categoryId,
        completedAt: new Date().toISOString(),
        duration: timer.duration,
      };

      const existingHistory = await loadHistory();
      const updatedHistory = [...existingHistory, historyEntry];
      const success = await saveHistory(updatedHistory);

      if (!success) {
        console.error("Failed to save history");
        return false;
      }

      return true;
    } catch (error) {
      console.error("❌ Error adding to history:", error);
      return false;
    }
  }, []);

  const handleTimerCompletion = useCallback(
    async (timer: Timer) => {
      // First, add to history
      const historySuccess = await addToHistory(timer);
      if (!historySuccess) {
        console.error("Failed to add timer to history");
        return;
      }

      // Then update the timers list
      setTimers((currentTimers) => {
        const updatedTimers = currentTimers.filter((t) => t.id !== timer.id);
        saveTimers(updatedTimers); // Fire and forget
        return updatedTimers;
      });

      // Show completion modal
      setCompletedTimer(timer);
      setShowCompletionModal(true);
    },
    [addToHistory]
  );

  // Timer interval effect
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimers((currentTimers: Timer[]) => {
        let needsUpdate = false;
        const updatedTimers = currentTimers.map((timer) => {
          if (timer.status !== "running") return timer;

          const newRemainingTime = timer.remainingTime - 1;

          if (
            timer.halfwayAlert &&
            !timer.halfwayAlertShown &&
            newRemainingTime <= timer.duration / 2
          ) {
            setAlertMessage(`${timer.name} is halfway complete!`);
            setShowAlertModal(true);
            needsUpdate = true;
            return {
              ...timer,
              remainingTime: newRemainingTime,
              halfwayAlertShown: true,
            };
          }

          if (newRemainingTime <= 1) {
            handleTimerCompletion(timer);
            needsUpdate = true;
            return {
              ...timer,
              status: "completed" as const,
              remainingTime: 0,
            };
          }

          needsUpdate = true;
          return { ...timer, remainingTime: newRemainingTime };
        });

        if (needsUpdate) {
          saveTimers(updatedTimers); // Fire and forget
        }

        return updatedTimers;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [handleTimerCompletion]);

  const onRefresh = useCallback(async () => {
    if (refreshing) return;

    setRefreshing(true);
    await loadStoredTimers();
    setRefreshing(false);
  }, [loadStoredTimers, refreshing]);

  // Initial load
  useEffect(() => {
    loadStoredTimers();
  }, [loadStoredTimers]);

  const handleCompletionModalClose = useCallback(() => {
    setShowCompletionModal(false);
  }, []);

  // Timer management
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      // In the interval effect, modify the setTimers call:
      setTimers((currentTimers: Timer[]) => {
        const updatedTimers = currentTimers.map((timer) => {
          if (timer.status !== "running") return timer;

          const newRemainingTime = timer.remainingTime - 1;
          if (newRemainingTime <= 0) {
            setCompletedTimer(timer);
            setShowCompletionModal(true);
            return { ...timer, status: "completed" as const, remainingTime: 0 };
          }
          return { ...timer, remainingTime: newRemainingTime };
        });

        //saveTimers(updatedTimers);
        return updatedTimers;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  const handleTimerAction = async (
    timerId: string,
    action: "start" | "pause" | "reset"
  ) => {
    const updatedTimers = timers.map((timer) => {
      if (timer.id !== timerId) return timer;

      switch (action) {
        case "start":
          return { ...timer, status: "running" as "running" };
        case "pause":
          return { ...timer, status: "paused" as "paused" };
        case "reset":
          return {
            ...timer,
            status: "paused" as "paused",
            remainingTime: timer.duration,
          };
        default:
          return timer;
      }
    });

    console.log("🔄 Updated timers state:", updatedTimers);

    setTimers([...updatedTimers]); // Updates UI immediately
    await saveTimers(updatedTimers); // Saves updated timers to storage
  };

  const handleCategoryAction = async (
    categoryId: string,
    action: "start" | "pause" | "reset"
  ) => {
    const updatedTimers = timers.map((timer) => {
      if (timer.categoryId !== categoryId) return timer;

      switch (action) {
        case "start":
          return { ...timer, status: "running" as "running" };
        case "pause":
          return { ...timer, status: "paused" as "paused" };
        case "reset":
          return {
            ...timer,
            status: "paused" as "paused",
            remainingTime: timer.duration,
          };
        default:
          return timer;
      }
    });

    setTimers(updatedTimers);
    await saveTimers(updatedTimers);
  };

  const toggleCategory = (categoryId: string) => {
    setCategoryStates((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Group timers by category
  const timerGroups: TimerGroup[] = Object.values(
    timers.reduce((groups: { [key: string]: TimerGroup }, timer) => {
      if (!groups[timer.categoryId]) {
        groups[timer.categoryId] = {
          category: {
            id: timer.categoryId,
            name: timer.categoryId,
            isExpanded: categoryStates[timer.categoryId] ?? true,
          },
          timers: [],
        };
      }
      groups[timer.categoryId].timers.push(timer);
      return groups;
    }, {})
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {timerGroups.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No timers yet</Text>
            <Text style={styles.emptyStateSubText}>
              Create your first timer to get started
            </Text>
          </View>
        ) : (
          timerGroups.map((group) => (
            <CategoryGroup
              key={group.category.id}
              group={group}
              onToggle={() => toggleCategory(group.category.id)}
              onStartAll={() =>
                handleCategoryAction(group.category.id, "start")
              }
              onPauseAll={() =>
                handleCategoryAction(group.category.id, "pause")
              }
              onResetAll={() =>
                handleCategoryAction(group.category.id, "reset")
              }
              onTimerAction={handleTimerAction}
            />
          ))
        )}
      </ScrollView>

      <Modal visible={showCompletionModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Timer Completed!</Text>
            <Text style={styles.modalText}>
              {completedTimer?.name} has finished.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowCompletionModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Halfway Alert Modal */}
      <Modal visible={showAlertModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Timer Alert</Text>
            <Text style={styles.modalText}>{alertMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowAlertModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/add-timer")}
        >
          <Text style={styles.addButtonText}>Add Timer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => router.push("/history")}
        >
          <Text style={styles.buttonText}>History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  content: {
    flex: 1,
    padding: 16,
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
    fontWeight: "bold",
  },
  emptyStateSubText: {
    color: "#888",
    fontSize: 16,
    textAlign: "center",
  },
  timerList: {
    gap: 12,
  },
  timerCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  timerName: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  timerDuration: {
    color: "#007AFF",
    fontSize: 16,
    marginBottom: 4,
  },
  timerCategory: {
    color: "#666",
    fontSize: 14,
  },
  bottomBar: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#333",
    backgroundColor: "#121212",
  },
  addButton: {
    flex: 2,
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 12,
    marginRight: 8,
    alignItems: "center",
  },
  historyButton: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#1E1E1E",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 300,
  },
  modalTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  modalText: {
    color: "#888",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
