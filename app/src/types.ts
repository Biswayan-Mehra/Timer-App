// src/types.ts

export interface Timer {
  id: string;
  name: string;
  duration: number;
  categoryId: string;
  status: 'running' | 'paused' | 'completed';
  remainingTime: number;
  halfwayAlert: boolean;
  halfwayAlertShown?: boolean;  // New field
}

export interface TimerHistory {
  id: string;
  timerName: string;  // Removed timerId since it's not used in your implementation
  categoryName: string;
  completedAt: string;
  duration: number;
}

export interface Category {
  id: string;
  name: string;
  isExpanded: boolean;
}

export interface TimerGroup {
  category: Category;
  timers: Timer[];
}
