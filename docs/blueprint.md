# **App Name**: ChronoFlow

## Core Features:

- Task Display: Display tasks for the selected date using a glassmorphism-style UI.
- Pomodoro Timer: Pomodoro timer integrated into task cards, allowing users to track focus time.
- Local Storage Persistence: Persist tasks and settings in the browser's localStorage.
- Task Input: Input form to add new tasks including title, description, category, duration and date using react-hook-form.
- Date Navigator: A button allowing user to select current date.
- Animated Background: Use an animated gradient background to add a modern and visually appealing touch.
- AI Task Categorization: AI-powered tool which automatically categorize new tasks based on their titles using LLM, using user defined tags or other data extracted by scraping the website mentioned in the description of the task.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to convey focus and productivity.
- Background color: Light gray (#F5F5F5) with 20% saturation for a soft, unobtrusive backdrop.
- Accent color: Teal (#00BCD4) to highlight interactive elements.
- Body and headline font: 'Space Grotesk' sans-serif for a techy, scientific feel.
- lucide-react icons should be used consistently for all interactive elements.
- Glassmorphism effect achieved using semi-transparent backgrounds with backdrop blur.
- Use subtle animations when the task timer is started/stopped. Use spring-based animation for the transition.