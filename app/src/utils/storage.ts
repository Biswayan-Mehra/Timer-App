// First, let's improve our storage.ts with better error handling and atomic operations:

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Timer, TimerHistory } from '../types';

const TIMERS_KEY = 'timers';
const HISTORY_KEY = 'timer_history';

export const saveTimers = async (timers: Timer[]): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(TIMERS_KEY, JSON.stringify(timers));
    console.log("✅ Timers successfully saved:", timers);
    return true;
  } catch (error) {
    console.error('❌ Error saving timers:', error);
    return false;
  }
};

export const loadTimers = async (): Promise<Timer[]> => {
  try {
    const data = await AsyncStorage.getItem(TIMERS_KEY);
    if (!data) return [];

    const parsedData = JSON.parse(data);
    return Array.isArray(parsedData) ? parsedData : [];
  } catch (error) {
    console.error('❌ Error loading timers:', error);
    return [];
  }
};

export const saveHistory = async (history: TimerHistory[]): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    console.log("✅ History successfully saved:", history);
    return true;
  } catch (error) {
    console.error('❌ Error saving history:', error);
    return false;
  }
};

export const loadHistory = async (): Promise<TimerHistory[]> => {
  try {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    if (!data) return [];

    const parsedData = JSON.parse(data);
    return Array.isArray(parsedData) ? parsedData : [];
  } catch (error) {
    console.error('❌ Error loading history:', error);
    return [];
  }
};
