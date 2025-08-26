"use client";

import { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";
import { format } from "date-fns";

import type { Task } from "@/lib/types";
import useLocalStorage from "@/hooks/use-local-storage";
import DateNavigator from "@/components/chronoflow/date-navigator";
import TaskList from "@/components/chronoflow/task-list";
import { TaskForm } from "@/components/chronoflow/task-form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Home() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("chrono-flow-tasks", []);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  const addTask = (task: Omit<Task, "id" | "status">) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      status: "todo",
      timeLeft: task.duration * 60,
    };
    setTasks((prevTasks) => [...prevTasks, newTask]);
    setIsFormOpen(false); 
  };

  const updateTask = (updatedTask: Task) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  if (!selectedDate) {
    return null; // or a loading spinner
  }

  return (
    <div className="container mx-auto min-h-screen max-w-5xl p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="font-headline text-5xl font-bold text-primary">
          ChronoFlow
        </h1>
        <p className="text-muted-foreground mt-2">
          Focus, Track, and Achieve on {format(selectedDate, "PPP")}
        </p>
      </header>

      <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <DateNavigator
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
        <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
          <SheetTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Task
            </Button>
          </SheetTrigger>
          <SheetContent className="glassmorphism w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle className="font-headline text-2xl">Create a New Task</SheetTitle>
            </SheetHeader>
            <TaskForm onAddTask={addTask} selectedDate={selectedDate} />
          </SheetContent>
        </Sheet>
      </div>

      <TaskList
        tasks={tasks}
        selectedDate={selectedDate}
        onUpdateTask={updateTask}
        onDeleteTask={deleteTask}
      />
    </div>
  );
}
