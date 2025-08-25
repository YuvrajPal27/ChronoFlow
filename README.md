# 🌊 ChronoFlow

A personal time and task management application designed to help you focus, track, and achieve your goals, one pomodoro at a time.

This project was **vibe coded** in Firebase Studio.

## ✨ Features

*   **AI-Powered Task Categorization**: Automatically categorizes your tasks based on their description, and can even scrape URLs for context.
*   **Pomodoro Timer**: Stay focused with a built-in Pomodoro timer for each task.
*   **Daily Task Management**: View and manage your tasks for any given day with a simple, clean interface.
*   **PWA Enabled**: Installable on your devices for an app-like experience with offline support.
*   **Sleek, Modern UI**: Built with ShadCN UI and Tailwind CSS for a beautiful and responsive design.

## 🛠️ Tech Stack

*   **Framework**: [Next.js](https://nextjs.org/)
*   **AI**: [Google's Gemini via Genkit](https://firebase.google.com/docs/genkit)
*   **UI**: [React](https://react.dev/), [ShadCN UI](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/)
*   **PWA**: [@ducanh2912/next-pwa](https://github.com/DuCanh2912/next-pwa)

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You'll need [Node.js](https://nodejs.org/) (version 18 or later) and `npm` installed on your machine.

### Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/your-repository-name.git
    cd your-repository-name
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up your environment variables:**
    Create a file named `.env` in the root of your project and add your Gemini API Key. You can get a free key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    ```env
    GEMINI_API_KEY="YOUR_API_KEY"
    ```

4.  **Run the development server:**
    ```sh
    npm run dev
    ```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result. You can start editing the page by modifying `src/app/page.tsx`.
