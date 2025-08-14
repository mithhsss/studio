import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Send, Paperclip, Loader, Bot, User } from 'lucide-react';
import type { ChatMessage } from '@/app/page';
import { useToast } from "@/hooks/use-toast";
import { answerCareerQuestion } from '@/ai/flows/answer-career-questions';
import { analyzeResume } from '@/ai/flows/analyze-resume-flow';

interface AIMentorViewProps {
    chatHistory: ChatMessage[];
    setChatHistory: (history: ChatMessage[]) => void;
    isLoading: boolean;
    userInput: string;
    setUserInput: (input: string) => void;
    resumeText: string | null;
    setResumeText: (text: string | null) => void;
    resumeFileName: string | null;
    setResumeFileName: (name: string | null) => void;
    error: string | null;
}
  
const LoadingSpinner = () => (
    <div className="flex items-center gap-3 justify-start">
        <div className="w-8 h-8 rounded-full bg-yellow-500 text-white flex items-center justify-center flex-shrink-0"><Bot size={16} /></div>
        <div className="p-3 bg-gray-100 rounded-lg">
            <Loader className="animate-spin text-gray-500" />
        </div>
    </div>
);

const AIMentorView: React.FC<AIMentorViewProps> = ({
    chatHistory,
    setChatHistory,
    isLoading,
    userInput,
    setUserInput,
    resumeText,
    setResumeText,
    resumeFileName,
    setResumeFileName,
    error,
}) => {
    const { toast } = useToast();

    const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setResumeFileName(file.name);
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                setResumeText(text);
                toast({
                  title: "Resume Uploaded",
                  description: `${file.name} is now part of the conversation context.`,
                })
            };
            reader.readAsText(file);
        }
    };

    const handleMentorSubmit = async () => {
        if (!userInput.trim()) return;

        const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', text: userInput }];
        setChatHistory(newHistory);
        const currentInput = userInput;
        setUserInput('');

        let responseText: string | null = null;
        
        try {
            if (resumeText) {
                const result = await analyzeResume({ question: currentInput, resumeText: resumeText });
                responseText = result.analysis;
            } else {
                const result = await answerCareerQuestion({ question: currentInput });
                responseText = result.answer;
            }
        } catch (err: any) {
             console.error("AI flow failed:", err);
             toast({
               variant: "destructive",
               title: "Oh no! Something went wrong.",
               description: "There was a problem with the AI response. Please try again.",
             });
        }

        if (responseText) {
            setChatHistory([...newHistory, { role: 'model', text: responseText }]);
        } else {
             setChatHistory([...newHistory, { role: 'model', text: "Sorry, I couldn't get a response. Please try again." }]);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 flex items-center">
                            <span className="p-2 bg-yellow-100 text-yellow-500 rounded-lg mr-3"><Users className="h-5 w-5" /></span>
                            AI Mentor
                        </h2>
                        <p className="text-sm text-gray-500 ml-10">Get career advice from your personal AI guide.</p>
                    </div>
                    <button className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">5 XP per question</button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[60vh] flex flex-col">
                    <div className="flex-grow space-y-4 overflow-y-auto pr-4 mb-4">
                        {chatHistory.map((msg, index) => (
                            <div key={index} className={`flex gap-3 items-start ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-yellow-500 text-white flex items-center justify-center flex-shrink-0"><Bot size={16} /></div>}
                                <div className={`max-w-lg p-3 rounded-lg prose prose-sm ${msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                                    <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                                </div>
                                 {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0"><User size={16} /></div>}
                            </div>
                        ))}
                        {isLoading && <LoadingSpinner />}
                        {chatHistory.length === 0 && (
                             <div className="text-center text-gray-500 h-full flex flex-col justify-center">
                                <Users size={40} className="mx-auto text-gray-300 mb-2"/>
                                <h3 className="font-semibold text-lg">Ask me anything about your career.</h3>
                                <p className="text-sm">For personalized advice, upload your resume first.</p>
                             </div>
                        )}
                    </div>

                    <div className="mt-auto flex items-center gap-2">
                         <div className="relative">
                            <Button asChild variant="outline" size="icon">
                                <label htmlFor="resume-upload" className="cursor-pointer">
                                    <Paperclip size={18} />
                                    <span className="sr-only">Upload Resume</span>
                                </label>
                            </Button>
                            <input id="resume-upload" type="file" className="absolute w-full h-full opacity-0 top-0 left-0 cursor-pointer" onChange={handleResumeUpload} accept=".txt,.pdf,.md" />
                        </div>
                        <div className="flex-grow relative">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleMentorSubmit()}
                                placeholder={resumeFileName ? `Asking about ${resumeFileName}...` : "Ask a career question..."}
                                className="w-full border-gray-300 border rounded-lg p-3 pr-12 focus:ring-yellow-500 focus:border-yellow-500"
                                disabled={isLoading}
                            />
                            {resumeFileName && (
                                <button
                                    onClick={() => { setResumeText(null); setResumeFileName(null); toast({ title: "Resume Cleared" }) }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-800 text-xl font-bold p-1 leading-none"
                                    aria-label="Clear resume"
                                >
                                    &times;
                                </button>
                            )}
                        </div>
                        <Button onClick={handleMentorSubmit} className="bg-yellow-600 hover:bg-yellow-700" size="icon" disabled={isLoading}>
                            <Send size={18} />
                        </Button>
                    </div>
                    {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
                </div>
            </CardContent>
        </Card>
    );
};

export default AIMentorView;
