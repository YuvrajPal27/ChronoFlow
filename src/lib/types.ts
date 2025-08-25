export interface Task {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string for easy storage
  duration: number; // in minutes for pomodoro
  category: string;
  status: "todo" | "in_progress" | "done";
}
