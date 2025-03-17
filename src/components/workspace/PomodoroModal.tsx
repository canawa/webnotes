import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { useTheme } from "@/lib/theme";
import { Clock, Play, Settings } from "lucide-react";
import { usePomodoroTimer } from "@/lib/pomodoro";

interface PomodoroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PomodoroModal = ({ isOpen, onClose }: PomodoroModalProps) => {
  const { theme } = useTheme();
  const {
    workDuration,
    setWorkDuration,
    breakDuration,
    setBreakDuration,
    longBreakDuration,
    setLongBreakDuration,
    pomodorosUntilLongBreak,
    setPomodorosUntilLongBreak,
    startTimer,
    isActive,
  } = usePomodoroTimer();

  const [activeTab, setActiveTab] = useState<"timer" | "settings">("timer");

  const handleStartTimer = () => {
    startTimer();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={`${theme === "dark" ? "bg-gray-800 text-white border-gray-700" : "bg-[rgb(241,238,231)] text-gray-800 border-gray-300"} sm:max-w-md`}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pomodoro Timer
          </DialogTitle>
          <DialogDescription
            className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
          >
            Boost your productivity with focused work sessions
          </DialogDescription>
        </DialogHeader>

        <div className="flex border-b mb-4">
          <button
            className={`px-4 py-2 ${activeTab === "timer" ? (theme === "dark" ? "border-b-2 border-blue-500 text-blue-400" : "border-b-2 border-[rgb(211,153,132)] text-[rgb(180,120,100)]") : "text-gray-500"}`}
            onClick={() => setActiveTab("timer")}
          >
            Timer
          </button>
          <button
            className={`px-4 py-2 ${activeTab === "settings" ? (theme === "dark" ? "border-b-2 border-blue-500 text-blue-400" : "border-b-2 border-[rgb(211,153,132)] text-[rgb(180,120,100)]") : "text-gray-500"}`}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </button>
        </div>

        {activeTab === "timer" ? (
          <div className="py-4 flex flex-col items-center">
            <div
              className={`w-48 h-48 rounded-full flex items-center justify-center mb-6 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}
            >
              <div className="text-4xl font-bold">
                {Math.floor(workDuration / 60)}:00
              </div>
            </div>

            <div className="text-center mb-4">
              <h3 className="text-lg font-medium">Work Session</h3>
              <p
                className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
              >
                Focus on your task until the timer ends
              </p>
            </div>

            <Button
              onClick={handleStartTimer}
              disabled={isActive}
              className={`w-full ${theme === "dark" ? "bg-blue-600 hover:bg-blue-700" : "bg-[rgb(211,153,132)] hover:bg-[rgb(191,133,112)]"}`}
            >
              <Play className="mr-2 h-4 w-4" />
              Start Pomodoro
            </Button>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="work-duration">Work Duration (minutes)</Label>
                <span
                  className={`text-sm font-medium ${theme === "dark" ? "text-blue-400" : "text-[rgb(180,120,100)]"}`}
                >
                  {Math.floor(workDuration / 60)}
                </span>
              </div>
              <Slider
                id="work-duration"
                min={5}
                max={60}
                step={5}
                value={[Math.floor(workDuration / 60)]}
                onValueChange={(value) => setWorkDuration(value[0] * 60)}
                className={theme === "dark" ? "" : ""}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="break-duration">Break Duration (minutes)</Label>
                <span
                  className={`text-sm font-medium ${theme === "dark" ? "text-blue-400" : "text-[rgb(180,120,100)]"}`}
                >
                  {Math.floor(breakDuration / 60)}
                </span>
              </div>
              <Slider
                id="break-duration"
                min={1}
                max={15}
                step={1}
                value={[Math.floor(breakDuration / 60)]}
                onValueChange={(value) => setBreakDuration(value[0] * 60)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="long-break-duration">
                  Long Break Duration (minutes)
                </Label>
                <span
                  className={`text-sm font-medium ${theme === "dark" ? "text-blue-400" : "text-[rgb(180,120,100)]"}`}
                >
                  {Math.floor(longBreakDuration / 60)}
                </span>
              </div>
              <Slider
                id="long-break-duration"
                min={5}
                max={30}
                step={5}
                value={[Math.floor(longBreakDuration / 60)]}
                onValueChange={(value) => setLongBreakDuration(value[0] * 60)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="pomodoros-until-long-break">
                  Pomodoros until long break
                </Label>
                <span
                  className={`text-sm font-medium ${theme === "dark" ? "text-blue-400" : "text-[rgb(180,120,100)]"}`}
                >
                  {pomodorosUntilLongBreak}
                </span>
              </div>
              <Slider
                id="pomodoros-until-long-break"
                min={2}
                max={6}
                step={1}
                value={[pomodorosUntilLongBreak]}
                onValueChange={(value) => setPomodorosUntilLongBreak(value[0])}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          {activeTab === "settings" && (
            <Button
              variant="outline"
              onClick={() => setActiveTab("timer")}
              className={
                theme === "dark" ? "border-gray-600" : "border-gray-300"
              }
            >
              Back to Timer
            </Button>
          )}
          {activeTab === "timer" && (
            <Button
              variant="outline"
              onClick={() => setActiveTab("settings")}
              className={`${theme === "dark" ? "border-gray-600" : "border-gray-300"} gap-2`}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PomodoroModal;
