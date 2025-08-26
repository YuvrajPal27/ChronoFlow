"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useTransition, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { Task } from "@/lib/types";
import { scrapeWebsiteForTaskDetails } from "@/ai/flows/scrape-website-for-task-details";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  description: z.string().optional(),
  date: z.date(),
  durationHours: z.coerce.number().min(0).optional(),
  durationMinutes: z.coerce.number().min(0).optional(),
  category: z.string().min(2, "Category is required."),
}).refine(data => (data.durationHours || 0) + (data.durationMinutes || 0) > 0, {
  message: "Duration must be at least 1 minute.",
  path: ["durationMinutes"],
});

type FormValues = z.infer<typeof formSchema>;

interface TaskFormProps {
  onSaveTask: (task: Omit<Task, "id" | "status" | "timeLeft">, id?: string) => void;
  selectedDate: Date;
  taskToEdit: Task | null;
}

export function TaskForm({ onSaveTask, selectedDate, taskToEdit }: TaskFormProps) {
  const [isAiSuggesting, startAiSuggestion] = useTransition();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      date: selectedDate,
      durationHours: 0,
      durationMinutes: 25,
      category: "Work",
    },
  });

  useEffect(() => {
    if (taskToEdit) {
      form.reset({
        title: taskToEdit.title,
        description: taskToEdit.description,
        date: new Date(taskToEdit.date),
        durationHours: Math.floor(taskToEdit.duration / 60),
        durationMinutes: taskToEdit.duration % 60,
        category: taskToEdit.category,
      });
    } else {
      form.reset({
        title: "",
        description: "",
        date: selectedDate,
        durationHours: 0,
        durationMinutes: 25,
        category: "Work",
      });
    }
  }, [taskToEdit, form, selectedDate]);

  function onSubmit(values: FormValues) {
    const totalMinutes = (values.durationHours || 0) * 60 + (values.durationMinutes || 0);
    onSaveTask({
      title: values.title,
      description: values.description || "",
      date: values.date.toISOString(),
      duration: totalMinutes,
      category: values.category,
    }, taskToEdit?.id);
  }

  const handleAiCategorize = () => {
    const taskTitle = form.getValues("title");
    const taskDescription = form.getValues("description") || "";
    if (!taskTitle) {
      toast({
        variant: "destructive",
        title: "Title is required",
        description: "Please enter a title before using AI suggestion.",
      });
      return;
    }

    startAiSuggestion(async () => {
      try {
        const result = await scrapeWebsiteForTaskDetails({ taskTitle, taskDescription });
        if (result.suggestedCategory) {
          form.setValue("category", result.suggestedCategory, { shouldValidate: true });
          toast({
            title: "AI Suggestion",
            description: `Category set to "${result.suggestedCategory}".`,
          });
        }
      } catch (error) {
        console.error("AI categorization failed:", error);
        toast({
          variant: "destructive",
          title: "AI Suggestion Failed",
          description: "Could not get a suggestion at this time.",
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Design new dashboard" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Add more details or a URL to scrape..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4">
          <div className="flex-1 space-y-2">
            <FormLabel>Duration</FormLabel>
            <div className="flex items-center gap-2">
              <FormField
                control={form.control}
                name="durationHours"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input type="number" placeholder="Hours" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="durationMinutes"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input type="number" placeholder="Minutes" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
             <FormMessage>{form.formState.errors.durationMinutes?.message}</FormMessage>
          </div>
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex-1">
                 <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input placeholder="e.g., Work" {...field} />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAiCategorize}
                  disabled={isAiSuggesting}
                  aria-label="Suggest Category with AI"
                >
                  <Sparkles className={cn("h-4 w-4", isAiSuggesting && "animate-spin")} />
                </Button>
              </div>
              <FormDescription>
                Enter a category or get an AI suggestion.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {taskToEdit ? "Save Changes" : "Add Task"}
        </Button>
      </form>
    </Form>
  );
}
