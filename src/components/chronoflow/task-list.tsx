"use client";

import { useMemo } from "react";
import { isSameDay } from "date-fns";
import { ClipboardList } from "lucide-react";
import type { Task } from "@/lib/types";
import TaskCard from "./task-card";

interface TaskListProps {
  tasks: Task[];
  selectedDate: Date;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
}

export default function TaskList({
  tasks,
  selectedDate,
  onUpdateTask,
  onDeleteTask,
  onEditTask,
}: TaskListProps) {
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => isSameDay(new Date(task.date), selectedDate))
      .sort((a, b) => a.status.localeCompare(b.status));
  }, [tasks, selectedDate]);

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center glassmorphism rounded-xl p-10">
        <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No tasks for this day</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Enjoy your free time or add a new task to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredTasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
          onEditTask={onEditTask}
        />
      ))}
    </div>
  );
}
