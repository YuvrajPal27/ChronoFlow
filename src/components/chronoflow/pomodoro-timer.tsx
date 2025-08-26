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
    setTimeLeft(task.timeLeft ?? task.duration * 60);
    setIsActive(false);
  }, [task.id, task.duration, task.timeLeft]);

  // Main timer tick and persistence effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1;
          onUpdateTask({ ...task, timeLeft: newTime });
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      onUpdateTask({ ...task, status: "done", timeLeft: 0 });
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, timeLeft, onUpdateTask]);


  const toggleTimer = () => {
    // If task is done and timer is at 0, reset it and start it.
    if (task.status === "done" && timeLeft === 0) {
      const newTime = task.duration * 60;
      setTimeLeft(newTime);
      onUpdateTask({ ...task, status: "in_progress", timeLeft: newTime });
      setIsActive(true);
      return;
    }
    
    const newIsActive = !isActive;
    setIsActive(newIsActive);

    if (newIsActive && task.status !== "in_progress") {
      onUpdateTask({ ...task, status: "in_progress" });
    } else if (!newIsActive && task.status === 'in_progress') {
      // If pausing, just update the time, don't change status from in_progress
       onUpdateTask({ ...task, timeLeft });
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
          disabled={task.status === 'done' && timeLeft > 0}
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
