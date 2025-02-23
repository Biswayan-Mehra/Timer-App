import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { Timer } from "../app/src/types";
import { saveTimers, loadTimers } from "./src/utils/storage";

export default function AddTimer() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [category, setCategory] = useState("");
  const [halfwayAlert, setHalfwayAlert] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSubmit = async () => {
    if (isSaving) return;

    if (!name || !duration || !category) {
      console.error("🚨 Missing fields: Name, Duration, or Category");
      return;
    }

    try {
      setIsSaving(true);

      const newTimer: Timer = {
        id: Date.now().toString(),
        name,
        duration: parseInt(duration, 10),
        categoryId: category,
        status: "paused" as const,
        remainingTime: parseInt(duration, 10),
        halfwayAlert,
        halfwayAlertShown: false,
      };

      const existingTimers = await loadTimers();
      const updatedTimers = [...existingTimers, newTimer];
      const success = await saveTimers(updatedTimers);

      if (success) {
        router.replace("/");
      } else {
        console.error("Failed to save timer");
      }
    } catch (error) {
      console.error("❌ Error saving timer:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="black" barStyle="light-content" />
      <Text style={styles.header}>New Timer</Text>
      <ScrollView style={styles.container}>
        <Animated.View style={[styles.form, { opacity: fadeAnim }]}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Timer Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter timer name"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Duration (seconds)</Text>
            <TextInput
              style={styles.input}
              value={duration}
              onChangeText={setDuration}
              placeholder="Enter duration in seconds"
              keyboardType="numeric"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              value={category}
              onChangeText={setCategory}
              placeholder="Enter category"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={[styles.checkbox, halfwayAlert && styles.checkboxChecked]}
              onPress={() => setHalfwayAlert(!halfwayAlert)}
            >
              {halfwayAlert && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>Enable halfway alert</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Create Timer</Text>
          </TouchableOpacity>
        </Animated.View>
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
    marginTop: 6,
    marginBottom: 6,
    paddingHorizontal: 16,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: "white",
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#333",
    borderRadius: 8,
    padding: 12,
    color: "white",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#007AFF",
    borderRadius: 4,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#007AFF",
  },
  checkmark: {
    color: "white",
    fontSize: 16,
  },
  checkboxLabel: {
    color: "white",
    fontSize: 16,
  },
});
