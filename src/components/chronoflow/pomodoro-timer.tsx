"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Task } from "@/lib/types";

interface PomodoroTimerProps {
  task: Task;
  onUpdateTask: (task: Task) => void;
}

export default function PomodoroTimer({ task, onUpdateTask }: PomodoroTimerProps) {
  const [timeLeft, setTimeLeft] = useState(task.timeLeft ?? task.duration * 60);
  const [isActive, setIsActive] = useState(false);
  const onUpdateTaskRef = useRef(onUpdateTask);

  useEffect(() => {
    onUpdateTaskRef.current = onUpdateTask;
  }, [onUpdateTask]);
  

  const resetTimer = useCallback(() => {
    setIsActive(false);
    const newTime = task.duration * 60;
    setTimeLeft(newTime);
    onUpdateTaskRef.current({ ...task, status: "todo", timeLeft: newTime });
  }, [task]);

  // Effect to reset timer when task duration or ID changes
  useEffect(() => {
    setTimeLeft(task.timeLeft ?? task.duration * 60);
    // If the task is active in another component, we should reflect it here.
    // A simple way is to check if it's in progress, but we will keep it simple
    // and set it to false to avoid timers running in the background unexpectedly.
    setIsActive(false); 
  }, [task.id, task.duration, task.timeLeft]);

  // Main timer tick effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      onUpdateTaskRef.current({ ...task, status: "done", timeLeft: 0 });
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, timeLeft, task]);

  // Effect to persist time left to local storage
  useEffect(() => {
    // This prevents the update from running on initial render
    if (isActive) {
        onUpdateTaskRef.current({ ...task, timeLeft });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);


  const toggleTimer = () => {
    // If task is done and timer is at 0, reset it and start it.
    if (task.status === "done" && timeLeft === 0) {
      const newTime = task.duration * 60;
      setTimeLeft(newTime);
      onUpdateTaskRef.current({ ...task, status: "in_progress", timeLeft: newTime });
      setIsActive(true);
      return;
    }
    
    const newIsActive = !isActive;
    setIsActive(newIsActive);

    if (newIsActive && task.status !== "in_progress") {
        onUpdateTaskRef.current({ ...task, status: "in_progress" });
    } else if (!newIsActive) {
      // Persist the paused time.
       onUpdateTaskRef.current({ ...task, timeLeft });
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
