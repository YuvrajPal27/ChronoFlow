"use client";

import { Trash2, GripVertical, CheckCircle, Circle, Hourglass } from "lucide-react";
import type { Task } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PomodoroTimer from "./pomodoro-timer";
import { Badge } from "../ui/badge";

interface TaskCardProps {
  task: Task;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

const statusIcons = {
  todo: <Circle className="h-4 w-4" />,
  in_progress: <Hourglass className="h-4 w-4 animate-spin" />,
  done: <CheckCircle className="h-4 w-4 text-green-500" />,
};

export default function TaskCard({ task, onUpdateTask, onDeleteTask }: TaskCardProps) {
  return (
    <Card className="glassmorphism transition-all hover:shadow-2xl">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline text-xl">{task.title}</CardTitle>
                <CardDescription>{task.description}</CardDescription>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => onDeleteTask(task.id)}
                aria-label="Delete task"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <PomodoroTimer task={task} onUpdateTask={onUpdateTask} />
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Badge variant={task.status === 'done' ? 'default' : 'secondary'} className="capitalize">
            {statusIcons[task.status]}
            <span className="ml-2">{task.status.replace('_', ' ')}</span>
        </Badge>
        <Badge variant="outline">{task.category}</Badge>
      </CardFooter>
    </Card>
  );
}
