"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useTransition } from "react";
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
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute.").max(120),
  category: z.string().min(2, "Category is required."),
});

type FormValues = z.infer<typeof formSchema>;

interface TaskFormProps {
  onAddTask: (task: Omit<Task, "id" | "status">) => void;
  selectedDate: Date;
}

export function TaskForm({ onAddTask, selectedDate }: TaskFormProps) {
  const [isAiSuggesting, startAiSuggestion] = useTransition();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      date: selectedDate,
      duration: 25,
      category: "Work",
    },
  });

  function onSubmit(values: FormValues) {
    onAddTask({
      ...values,
      date: values.date.toISOString(),
      description: values.description || "",
    });
    form.reset({
      ...values,
      title: "",
      description: "",
      date: selectedDate, // Reset to current selected date
    });
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
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Duration (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
          Add Task
        </Button>
      </form>
    </Form>
  );
}
