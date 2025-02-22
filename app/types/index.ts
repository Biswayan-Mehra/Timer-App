export interface Timer {
  id: string;
  name: string;
  duration: number;
  categoryId: string;
  status: 'running' | 'paused' | 'completed';
  remainingTime: number;
  halfwayAlert?: boolean;
}

export interface Category {
  id: string;
  name: string;
  isExpanded: boolean;
}

export interface TimerHistory {
  id: string;
  timerId: string;
  timerName: string;
  categoryName: string;
  completedAt: string;
}

const types = {};
export default types;
