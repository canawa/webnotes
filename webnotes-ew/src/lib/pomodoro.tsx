import React, { createContext, useContext, useState, useEffect } from "react";

type PomodoroPhase = "work" | "break" | "longBreak";

interface PomodoroContextType {
  // Timer state
  isActive: boolean;
  isPaused: boolean;
  currentPhase: PomodoroPhase;
  remainingTime: number;
  completedPomodoros: number;

  // Timer settings
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  pomodorosUntilLongBreak: number;

  // Timer actions
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;

  // Settings actions
  setWorkDuration: (seconds: number) => void;
  setBreakDuration: (seconds: number) => void;
  setLongBreakDuration: (seconds: number) => void;
  setPomodorosUntilLongBreak: (count: number) => void;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(
  undefined,
);

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  // Timer state
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<PomodoroPhase>("work");
  const [remainingTime, setRemainingTime] = useState(25 * 60); // 25 minutes in seconds
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  // Timer settings
  const [workDuration, setWorkDuration] = useState(25 * 60); // 25 minutes in seconds
  const [breakDuration, setBreakDuration] = useState(5 * 60); // 5 minutes in seconds
  const [longBreakDuration, setLongBreakDuration] = useState(15 * 60); // 15 minutes in seconds
  const [pomodorosUntilLongBreak, setPomodorosUntilLongBreak] = useState(4);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime <= 1) {
            // Timer completed
            clearInterval(interval!);

            // Handle phase transition
            if (currentPhase === "work") {
              // Completed a work session
              const newCompletedPomodoros = completedPomodoros + 1;
              setCompletedPomodoros(newCompletedPomodoros);

              // Check if it's time for a long break
              if (newCompletedPomodoros % pomodorosUntilLongBreak === 0) {
                setCurrentPhase("longBreak");
                return longBreakDuration;
              } else {
                setCurrentPhase("break");
                return breakDuration;
              }
            } else {
              // Completed a break, start a new work session
              setCurrentPhase("work");
              return workDuration;
            }
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    isActive,
    isPaused,
    currentPhase,
    completedPomodoros,
    workDuration,
    breakDuration,
    longBreakDuration,
    pomodorosUntilLongBreak,
  ]);

  // Timer actions
  const startTimer = () => {
    setIsActive(true);
    setIsPaused(false);
    setCurrentPhase("work");
    setRemainingTime(workDuration);
  };

  const pauseTimer = () => {
    setIsPaused(true);
  };

  const resumeTimer = () => {
    setIsPaused(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setCurrentPhase("work");
    setRemainingTime(workDuration);
    setCompletedPomodoros(0);
  };

  // Update remaining time when duration settings change
  useEffect(() => {
    if (!isActive) {
      setRemainingTime(workDuration);
    } else if (currentPhase === "work" && !isPaused) {
      // Don't update if timer is running
    } else if (currentPhase === "break") {
      // Don't update if timer is running
    } else if (currentPhase === "longBreak") {
      // Don't update if timer is running
    }
  }, [
    workDuration,
    breakDuration,
    longBreakDuration,
    isActive,
    isPaused,
    currentPhase,
  ]);

  const value = {
    // Timer state
    isActive,
    isPaused,
    currentPhase,
    remainingTime,
    completedPomodoros,

    // Timer settings
    workDuration,
    breakDuration,
    longBreakDuration,
    pomodorosUntilLongBreak,

    // Timer actions
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,

    // Settings actions
    setWorkDuration,
    setBreakDuration,
    setLongBreakDuration,
    setPomodorosUntilLongBreak,
  };

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoroTimer() {
  const context = useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error("usePomodoroTimer must be used within a PomodoroProvider");
  }
  return context;
}
