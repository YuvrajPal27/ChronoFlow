"use client";

import { useState, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Task } from "@/lib/types";

interface PomodoroTimerProps {
  task: Task;
  onUpdateTask: (task: Task) => void;
}

export default function PomodoroTimer({ task, onUpdateTask }: PomodoroTimerProps) {
  const initialTime = task.timeLeft ?? task.duration * 60;
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    const newTime = task.duration * 60;
    setTimeLeft(newTime);
    onUpdateTask({ ...task, status: "todo", timeLeft: newTime });
  }, [task, onUpdateTask]);

  // Effect to reset timer when task duration or ID changes
  useEffect(() => {
    // Only reset if it's a new task or duration changed, not just a reload
    if (task.timeLeft === undefined) {
      setTimeLeft(task.duration * 60);
    } else {
      setTimeLeft(task.timeLeft);
    }
    setIsActive(false);
  }, [task.duration, task.id]);


  // Main timer tick effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      onUpdateTask({ ...task, status: "done", timeLeft: 0 });
      // Optional: Add a sound notification here
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, timeLeft, onUpdateTask, task]);

  // Effect to persist timeLeft
  useEffect(() => {
    if (timeLeft !== initialTime) {
      onUpdateTask({ ...task, timeLeft });
    }
  }, [timeLeft]);

  const toggleTimer = () => {
    if (task.status === "done" && timeLeft === 0) {
      // If task is done and timer is at 0, reset it.
      resetTimer();
      // Immediately start the timer after resetting
      setIsActive(true); 
      onUpdateTask({ ...task, status: "in_progress", timeLeft: task.duration * 60 });
      return;
    }
    
    const newIsActive = !isActive;
    setIsActive(newIsActive);

    if (newIsActive && task.status !== "in_progress") {
      onUpdateTask({ ...task, status: "in_progress" });
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex items-center gap-4">
      <div
        className={`font-mono text-4xl font-bold transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${
          isActive ? "text-accent scale-110" : "text-foreground"
        }`}
      >
        <span>{String(minutes).padStart(2, "0")}</span>:
        <span>{String(seconds).padStart(2, "0")}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={toggleTimer}
          aria-label={isActive ? "Pause timer" : "Start timer"}
        >
          {isActive ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
        </Button>
        <Button size="icon" variant="ghost" onClick={resetTimer} aria-label="Reset timer">
          <RotateCcw className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
