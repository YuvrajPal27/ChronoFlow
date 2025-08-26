"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SplashScreenProps {
  onNameSubmit: (name: string) => void;
}

export default function SplashScreen({ onNameSubmit }: SplashScreenProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onNameSubmit(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center animated-gradient">
      <div className="text-center p-8 rounded-lg glassmorphism">
        <h1 className="font-headline text-5xl font-bold text-primary mb-4">
          Welcome to ChronoFlow
        </h1>
        <p className="text-muted-foreground mb-8">What should we call you?</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto">
          <Input
            type="text"
            placeholder="Enter your name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-center"
            aria-label="Your name"
          />
          <Button type="submit" size="lg">
            Let's Get Started
          </Button>
        </form>
      </div>
    </div>
  );
}
