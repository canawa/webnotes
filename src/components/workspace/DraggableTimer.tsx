import React, { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { useTheme } from "@/lib/theme";
import { usePomodoroTimer } from "@/lib/pomodoro";
import { Pause, Play, X, Minimize2, Maximize2 } from "lucide-react";

const DraggableTimer: React.FC = () => {
  const { theme } = useTheme();
  const {
    isActive,
    isPaused,
    currentPhase,
    remainingTime,
    completedPomodoros,
    pauseTimer,
    resumeTimer,
    resetTimer,
    pomodorosUntilLongBreak,
  } = usePomodoroTimer();

  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const timerRef = useRef<HTMLDivElement>(null);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (timerRef.current) {
      setIsDragging(true);
      const rect = timerRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Don't render if timer is not active
  if (!isActive && !isPaused) return null;

  // Get phase color
  const getPhaseColor = () => {
    switch (currentPhase) {
      case "work":
        return theme === "dark" ? "bg-blue-600" : "bg-[rgb(211,153,132)]";
      case "break":
        return theme === "dark" ? "bg-green-600" : "bg-green-500";
      case "longBreak":
        return theme === "dark" ? "bg-purple-600" : "bg-purple-500";
      default:
        return theme === "dark" ? "bg-blue-600" : "bg-[rgb(211,153,132)]";
    }
  };

  // Get phase text
  const getPhaseText = () => {
    switch (currentPhase) {
      case "work":
        return "Focus Time";
      case "break":
        return "Short Break";
      case "longBreak":
        return "Long Break";
      default:
        return "Pomodoro";
    }
  };

  return (
    <div
      ref={timerRef}
      className={`fixed z-50 ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-300"} border rounded-lg shadow-lg ${isDragging ? "cursor-grabbing" : "cursor-grab"} ${isMinimized ? "w-auto" : "w-64"}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div
        className={`p-2 ${getPhaseColor()} text-white rounded-t-lg flex justify-between items-center`}
        onMouseDown={handleMouseDown}
      >
        <div className="font-medium text-sm">{getPhaseText()}</div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-white hover:bg-white/20"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? (
              <Maximize2 className="h-3 w-3" />
            ) : (
              <Minimize2 className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-white hover:bg-white/20"
            onClick={resetTimer}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="p-4">
            <div className="text-center mb-2">
              <div
                className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-800"}`}
              >
                {formatTime(remainingTime)}
              </div>
            </div>

            <div className="flex justify-center mb-3">
              <div
                className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
              >
                Pomodoros: {completedPomodoros}/{pomodorosUntilLongBreak}
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                className={`${theme === "dark" ? "border-gray-700 hover:bg-gray-700 text-white" : "border-gray-300 hover:bg-gray-200 text-gray-800"}`}
                onClick={isPaused ? resumeTimer : pauseTimer}
              >
                {isPaused ? (
                  <>
                    <Play className="mr-1 h-3 w-3" /> Resume
                  </>
                ) : (
                  <>
                    <Pause className="mr-1 h-3 w-3" /> Pause
                  </>
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DraggableTimer;
