"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Book,
  Send,
  Loader2,
  Map,
  Pin,
  Search,
  FlaskConical,
  Lightbulb,
  GraduationCap,
  Code
} from "lucide-react";
import { AppLogo, YellowIcon, GreenIcon } from "@/components/icons";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { answerCareerQuestion } from '@/ai/flows/answer-career-questions';
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  role: 'user' | 'ai';
  content: string;
}

export default function AICareerNavigator() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const result = await answerCareerQuestion({ question: currentInput });
      const aiMessage: Message = { id: Date.now() + 1, role: 'ai', content: result.answer };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: "There was a problem with the AI response. Please try again.",
      });
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: 'ai',
        content: "I'm sorry, but I'm having trouble connecting right now. Please try again later.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const suggestedQuestions = [
    "What roadmap should I pick?",
    "What are the best jobs for me?",
    "Recommend me a project based on my expertise",
    "Recommend me a topic I can learn in an hour"
  ];
  

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader className="bg-orange-400 text-white rounded-t-xl flex flex-row items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              <div>
                <CardTitle className="text-lg">AI Tutor</CardTitle>
                <CardDescription className="text-orange-100 text-xs">Your personalized learning companion for any topic</CardDescription>
              </div>
            </div>
            <Badge className="bg-blue-500 text-white">+15 XP per session</Badge>
          </CardHeader>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">How can I help you?</h3>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start bg-[#FFF6F2]"><Pin className="mr-2" /> Help select a career path</Button>
              <Button variant="outline" className="justify-start bg-[#FFF6F2]"><Search className="mr-2" /> Help me find a job</Button>
              <Button variant="outline" className="justify-start bg-[#FFF6F2]"><Lightbulb className="mr-2" /> Learn a Topic</Button>
              <Button variant="outline" className="justify-start bg-[#FFF6F2]"><FlaskConical className="mr-2" /> Test my Knowledge</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Suggested Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
             {suggestedQuestions.map((q, i) => (
                <Card key={i} className="p-4">{q}</Card>
            ))}
          </CardContent>
          <CardFooter>
            <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
              <Input
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="bg-gray-100"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="bg-blue-400 text-white rounded-t-xl flex flex-row items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              <CardTitle className="text-lg">AI Roadmap</CardTitle>
            </div>
            <Badge className="bg-blue-500 text-white">+10 XP per update</Badge>
          </CardHeader>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg">Your UX Designer Roadmap</h3>
            <p className="text-muted-foreground text-sm mt-2 mb-4">
              Get a personalized career roadmap with skill recommendations, learning resources, and milestone tracking.
            </p>
            <Button className="w-full bg-blue-500 hover:bg-blue-600">Explore Your Roadmap</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommended AI Tools</CardTitle>
            <CardDescription>Based on your profile and career goals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <YellowIcon />
                </div>
                <div>
                  <h4 className="font-semibold">AI Mentor</h4>
                  <p className="text-sm text-muted-foreground">Work with an expert specialized in UX</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-green-100 rounded-full">
                    <GreenIcon />
                  </div>
                <div>
                  <h4 className="font-semibold">AI Coder</h4>
                  <p className="text-sm text-muted-foreground">Leverage coding to complement design</p>
                </div>
              </div>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
