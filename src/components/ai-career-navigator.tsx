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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpenCheck,
  GitPullRequestArrow,
  Star,
  Send,
  Loader2,
  BadgeCheck,
  X,
  PlusCircle,
  CheckCircle2,
  Wand2,
  Sparkles,
  Code,
  GraduationCap,
} from "lucide-react";
import { AppLogo } from "@/components/icons";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { answerCareerQuestion } from '@/ai/flows/answer-career-questions';
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  role: 'user' | 'ai';
  content: string;
}

const StatCard = ({ icon, title, value, description }: { icon: React.ReactNode, title: string, value: string, description: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default function AICareerNavigator() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
      { id: 1, role: 'ai', content: 'Hello! I am your AI Career Navigator. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [badges, setBadges] = useState([
    { id: 1, name: 'Pro Learner', icon: <BadgeCheck className="h-4 w-4 text-green-500" /> },
    { id: 2, name: 'AI Innovator', icon: <BadgeCheck className="h-4 w-4 text-blue-500" /> },
    { id: 3, name: 'Roadmap Master', icon: <BadgeCheck className="h-4 w-4 text-purple-500" /> },
  ]);

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

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };
  
  const addBadge = () => {
    const newBadge = { id: Date.now(), name: 'Newbie Badge', icon: <BadgeCheck className="h-4 w-4 text-gray-500" /> };
    setBadges(prev => [...prev, newBadge]);
  };

  const deleteBadge = (id: number) => {
    setBadges(prev => prev.filter(b => b.id !== id));
  };


  const roadmapSkills = [
    { name: 'React Fundamentals', progress: 80 },
    { name: 'Advanced TypeScript', progress: 60 },
    { name: 'Next.js App Router', progress: 75 },
    { name: 'AI Prompt Engineering', progress: 40 },
  ];

  const suggestedQuestions = [
    "What are the key skills for a front-end developer in 2024?",
    "Suggest a project to practice my React skills.",
    "How do I start learning about AI?",
    "Compare Python and JavaScript for backend development."
  ];

  const toolRecommendations = [
    { name: 'AI Code Reviewer', description: 'Get instant feedback on your code quality.', icon: <Code className="h-6 w-6 text-primary" />},
    { name: 'Mock Interviewer', description: 'Practice interviews with an AI.', icon: <GraduationCap className="h-6 w-6 text-primary" />},
  ]

  return (
    <div className="flex h-full flex-col">
       <header className="flex h-14 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur-sm">
         <SidebarTrigger className="lg:hidden" />
         <div className="flex-1">
           <h1 className="text-lg font-semibold">AI Tutor</h1>
         </div>
       </header>
       <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="grid gap-6">
           <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
             <StatCard icon={<BookOpenCheck />} title="AI Tutor Sessions" value="42" description="+5 this week" />
             <StatCard icon={<GitPullRequestArrow />} title="AI Roadmap Updates" value="12" description="+2 this month" />
             <StatCard icon={<Star />} title="XP From All Tools" value="1,250" description="You're on a roll!" />
           </div>
 
           <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
             <div className="lg:col-span-2">
              <Card className="flex h-[600px] flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Ask Me Anything</CardTitle>
                  <CardDescription>I can help with career advice, technical questions, and more.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full pr-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div key={message.id} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                          {message.role === 'ai' && (
                            <Avatar className="h-8 w-8 border">
                               <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                                <AppLogo className="h-5 w-5" />
                               </div>
                            </Avatar>
                          )}
                          <div className={`max-w-xs rounded-lg px-4 py-2 md:max-w-md ${ message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                           {message.role === 'user' && (
                            <Avatar className="h-8 w-8 border">
                              <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="profile picture" />
                              <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex items-start gap-3">
                           <Avatar className="h-8 w-8 border">
                               <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                                <AppLogo className="h-5 w-5" />
                               </div>
                            </Avatar>
                          <div className="rounded-lg bg-muted px-4 py-2">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter>
                  <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
                    <Input
                      autoFocus
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="What's the difference between REST and GraphQL?"
                      disabled={isLoading}
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </CardFooter>
              </Card>
              <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Suggested Questions</CardTitle>
                    <CardDescription>Click one to start a conversation.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((q, i) => (
                        <Button key={i} variant="outline" size="sm" onClick={() => handleSuggestedQuestion(q)}>{q}</Button>
                    ))}
                </CardContent>
              </Card>
             </div>
             <div className="flex flex-col gap-6">
               <Card>
                 <CardHeader className="flex flex-row items-center justify-between pb-2">
                   <CardTitle className="text-base font-semibold">AI Badges</CardTitle>
                   <Button variant="ghost" size="icon" className="h-7 w-7" onClick={addBadge}>
                    <PlusCircle className="h-4 w-4" />
                   </Button>
                 </CardHeader>
                 <CardContent className="space-y-3">
                   {badges.map((badge) => (
                     <div key={badge.id} className="flex items-center justify-between group">
                       <div className="flex items-center gap-3">
                         {badge.icon}
                         <span className="text-sm font-medium">{badge.name}</span>
                       </div>
                       <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => deleteBadge(badge.id)}>
                        <X className="h-4 w-4 text-muted-foreground" />
                       </Button>
                     </div>
                   ))}
                 </CardContent>
               </Card>
               <Card>
                 <CardHeader>
                   <CardTitle>Personalized Roadmap</CardTitle>
                   <CardDescription>Your path to mastery.</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   {roadmapSkills.map((skill) => (
                     <div key={skill.name}>
                       <div className="mb-1 flex items-center justify-between">
                         <span className="text-sm font-medium">{skill.name}</span>
                         <span className="text-sm text-muted-foreground">{skill.progress}%</span>
                       </div>
                       <Progress value={skill.progress} className="h-2" />
                     </div>
                   ))}
                 </CardContent>
                 <CardFooter>
                    <Button variant="outline" className="w-full">View Full Roadmap</Button>
                 </CardFooter>
               </Card>
               <Card>
                <CardHeader>
                    <CardTitle>Tool Recommendations</CardTitle>
                    <CardDescription>AI tools to boost your productivity.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {toolRecommendations.map((tool) => (
                    <div key={tool.name} className="flex items-start gap-4">
                        {tool.icon}
                        <div>
                            <p className="font-semibold">{tool.name}</p>
                            <p className="text-sm text-muted-foreground">{tool.description}</p>
                        </div>
                    </div>
                  ))}
                </CardContent>
               </Card>
             </div>
           </div>
         </div>
       </main>
    </div>
  );
}
