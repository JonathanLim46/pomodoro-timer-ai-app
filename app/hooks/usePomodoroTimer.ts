import { useState, useEffect, useRef, useCallback } from 'react';

export type SessionType = 'focus' | 'shortBreak' | 'longBreak';

export interface PomodoroState {
  timeLeft: number; // in seconds
  isRunning: boolean;
  sessionType: SessionType;
  completedSessions: number;
  totalFocusTime: number; // in seconds
}

const SESSION_DURATIONS = {
  focus: 25 * 60, // 25 minutes
  shortBreak: 5 * 60, // 5 minutes
  longBreak: 15 * 60 // 15 minutes
};

export function usePomodoroTimer() {
  const [state, setState] = useState<PomodoroState>({
    timeLeft: SESSION_DURATIONS.focus,
    isRunning: false,
    sessionType: 'focus',
    completedSessions: 0,
    totalFocusTime: 0
  });
  
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  
  const start = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: true }));
    startTimeRef.current = Date.now();
  }, []);
  
  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: false }));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  
  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      timeLeft: SESSION_DURATIONS[prev.sessionType],
      isRunning: false
    }));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  
  const skipBreak = useCallback(() => {
    setState(prev => {
      const nextSessionType: SessionType = 'focus';
      return {
        ...prev,
        sessionType: nextSessionType,
        timeLeft: SESSION_DURATIONS[nextSessionType],
        isRunning: false
      };
    });
  }, []);
  
  const getProgress = useCallback(() => {
    const totalDuration = SESSION_DURATIONS[state.sessionType];
    return ((totalDuration - state.timeLeft) / totalDuration) * 100;
  }, [state.sessionType, state.timeLeft]);
  
  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = window.setInterval(() => {
        setState(prev => {
          if (prev.timeLeft <= 1) {
            // Session completed
            const isCompletedFocusSession = prev.sessionType === 'focus';
            const newCompletedSessions = isCompletedFocusSession 
              ? prev.completedSessions + 1 
              : prev.completedSessions;
            
            // Determine next session type
            let nextSessionType: SessionType;
            if (prev.sessionType === 'focus') {
              nextSessionType = newCompletedSessions % 4 === 0 ? 'longBreak' : 'shortBreak';
            } else {
              nextSessionType = 'focus';
            }
            
            const newTotalFocusTime = isCompletedFocusSession 
              ? prev.totalFocusTime + SESSION_DURATIONS.focus 
              : prev.totalFocusTime;
            
            return {
              ...prev,
              timeLeft: SESSION_DURATIONS[nextSessionType],
              sessionType: nextSessionType,
              completedSessions: newCompletedSessions,
              totalFocusTime: newTotalFocusTime,
              isRunning: false
            };
          }
          
          return {
            ...prev,
            timeLeft: prev.timeLeft - 1
          };
        });
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning]);
  
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);
  
  return {
    ...state,
    start,
    pause,
    reset,
    skipBreak,
    getProgress,
    formatTime
  };
}
