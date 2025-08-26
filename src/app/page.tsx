"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Edit, Check, X } from "lucide-react";
import { format } from "date-fns";

import type { Task } from "@/lib/types";
import useLocalStorage from "@/hooks/use-local-storage";
import DateNavigator from "@/components/chronoflow/date-navigator";
import TaskList from "@/components/chronoflow/task-list";
import { TaskForm } from "@/components/chronoflow/task-form";
import SplashScreen from "@/components/chronoflow/splash-screen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Home() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("chrono-flow-tasks", []);
  const [userName, setUserName] = useLocalStorage<string | null>("chrono-flow-user", null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState(userName || "");

  useEffect(() => {
    if (userName === null) {
      setShowSplash(true);
    } else {
      setEditingName(userName);
    }
  }, [userName]);

  const handleNameSubmit = (name: string) => {
    setUserName(name);
    setEditingName(name);
    setShowSplash(false);
  };
  
  const handleNameEdit = () => {
    if (editingName.trim()) {
      setUserName(editingName.trim());
      setIsEditingName(false);
    }
  }

  const handleOpenFormForEdit = (task: Task) => {
    setTaskToEdit(task);
    setIsFormOpen(true);
  };

  const handleOpenFormForAdd = () => {
    setTaskToEdit(null);
    setIsFormOpen(true);
  }

  const upsertTask = (task: Omit<Task, "id" | "status" | "timeLeft">, id?: string) => {
    const taskData = {
      ...task,
      timeLeft: task.duration * 60,
    };
  
    if (id) {
      // Update existing task, keeping its original status unless it's done
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === id
            ? { ...t, ...taskData }
            : t
        )
      );
    } else {
      // Add new task
      const newTask: Task = {
        ...taskData,
        id: crypto.randomUUID(),
        status: "todo",
      };
      setTasks(prevTasks => [...prevTasks, newTask]);
    }
    setIsFormOpen(false);
    setTaskToEdit(null);
  };

  const updateTaskStatus = (updatedTask: Task) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };
  
  if (showSplash) {
    return <SplashScreen onNameSubmit={handleNameSubmit} />;
  }

  return (
    <div className="container mx-auto min-h-screen max-w-5xl p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="font-headline text-5xl font-bold text-primary">
          ChronoFlow
        </h1>
        {userName && (
          <div className="mt-4 flex items-center justify-center gap-2 text-lg">
            {isEditingName ? (
              <>
                <Input 
                  value={editingName} 
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-48 text-center"
                  onKeyDown={(e) => e.key === 'Enter' && handleNameEdit()}
                />
                <Button size="icon" variant="ghost" onClick={handleNameEdit}><Check className="h-4 w-4"/></Button>
                <Button size="icon" variant="ghost" onClick={() => setIsEditingName(false)}><X className="h-4 w-4" /></Button>
              </>
            ) : (
              <>
                <p className="text-muted-foreground">Welcome, {userName}!</p>
                <Button size="icon" variant="ghost" onClick={() => setIsEditingName(true)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        )}
        <p className="text-muted-foreground mt-2">
          Focus, Track, and Achieve on {format(selectedDate, "PPP")}
        </p>
      </header>

      <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <DateNavigator
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
        <Sheet open={isFormOpen} onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setTaskToEdit(null);
        }}>
          <SheetTrigger asChild>
            <Button onClick={handleOpenFormForAdd}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Task
            </Button>
          </SheetTrigger>
          <SheetContent className="glassmorphism w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle className="font-headline text-2xl">
                {taskToEdit ? "Edit Task" : "Create a New Task"}
              </SheetTitle>
            </SheetHeader>
            <TaskForm 
              onSaveTask={upsertTask} 
              selectedDate={selectedDate} 
              taskToEdit={taskToEdit}
            />
          </SheetContent>
        </Sheet>
      </div>

      <TaskList
        tasks={tasks}
        selectedDate={selectedDate}
        onUpdateTask={updateTaskStatus}
        onDeleteTask={deleteTask}
        onEditTask={handleOpenFormForEdit}
      />
    </div>
  );
}
