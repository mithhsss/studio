
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Briefcase, FileText, Loader, Paperclip, Send, User, Bot, Mic, Video } from 'lucide-react';
import type { TutorChatHistory } from '@/app/page';
import { useToast } from "@/hooks/use-toast";
import { mockInterview } from '@/ai/flows/mock-interview-flow';
import { Label } from '@/components/ui/label';

const SetupView = ({ onStart, isLoading, jobDescription, setJobDescription, resumeText, setResumeText, resumeFileName, setResumeFileName }) => {
  const { toast } = useToast();

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setResumeFileName(file.name);
    toast({ title: "Processing Resume...", description: `Reading ${file.name}...` });

    try {
        if (file.type === 'application/pdf') {
            const pdfjs = await import('pdfjs-dist/build/pdf');
            await import('pdfjs-dist/build/pdf.worker.mjs');
            pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.mjs`;

            const reader = new FileReader();
            reader.onload = async (e) => {
                if (e.target?.result) {
                    const typedArray = new Uint8Array(e.target.result as ArrayBuffer);
                    const pdf = await pdfjs.getDocument(typedArray).promise;
                    let fullText = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const content = await page.getTextContent();
                        fullText += content.items.map((item: any) => item.str).join(' ');
                    }
                    setResumeText(fullText);
                    toast({ title: "Resume Uploaded!", description: `${file.name} is now part of the conversation context.` });
                }
            };
            reader.readAsArrayBuffer(file);
            return;
        }

        // Fallback for .txt and .md
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            setResumeText(text);
            toast({ title: "Resume Uploaded", description: `${file.name} is now part of the conversation context.` });
        };
        reader.readAsText(file);
    } catch (e) {
        console.error("Error parsing resume:", e);
        toast({ variant: "destructive", title: "Parsing Failed", description: "Could not read the resume file. Please try a different format." });
        setResumeFileName(null);
        setResumeText('');
    }
  };

  const canStart = jobDescription.trim() && resumeText.trim();

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800">Mock Interview Setup</h3>
        <p className="text-gray-500">Provide a job description and your resume to begin.</p>
      </div>
      <div className="space-y-4">
        <div>
          <Label htmlFor="job-desc" className="flex items-center gap-2 mb-1"><Briefcase size={16}/> Job Description</Label>
          <Textarea id="job-desc" placeholder="Paste the job description here..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={8} />
        </div>
        <div>
          <Label htmlFor="resume-upload" className="flex items-center gap-2 mb-1"><FileText size={16}/> Your Resume</Label>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="w-full justify-center">
                <label htmlFor="resume-upload-input" className="cursor-pointer flex items-center gap-2">
                    <Paperclip size={14}/>
                    {resumeFileName ? resumeFileName : 'Upload Resume (.txt, .md, .pdf)'}
                </label>
            </Button>
            <input id="resume-upload-input" type="file" className="hidden" onChange={handleResumeUpload} accept=".txt,.md,.pdf" />
          </div>
        </div>
        <Button onClick={onStart} disabled={isLoading || !canStart} className="w-full !mt-6">
          {isLoading ? <Loader className="animate-spin" /> : 'Start Interview'}
        </Button>
      </div>
    </div>
  );
};

const InterviewView = ({ chatHistory, onSendMessage, isLoading }) => {
    const [userInput, setUserInput] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
        chatContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [chatHistory]);

    const handleSend = () => {
        if (!userInput.trim()) return;
        onSendMessage(userInput);
        setUserInput('');
    };

    return (
        <div className="h-[65vh] flex flex-col">
            <div className="flex-grow overflow-y-auto pr-4 space-y-4">
                 {chatHistory.map((msg, index) => (
                    <div key={index} className={`flex gap-3 items-start ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center flex-shrink-0"><Bot size={16} /></div>}
                        <p className={`max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                           {msg.content}
                        </p>
                        {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0"><User size={16} /></div>}
                    </div>
                ))}
                 {isLoading && <div className="flex justify-start"><Loader className="animate-spin text-indigo-500" /></div>}
            </div>
            <div className="mt-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Input 
                        value={userInput} 
                        onChange={(e) => setUserInput(e.target.value)} 
                        onKeyPress={e => e.key === 'Enter' && handleSend()} 
                        placeholder="Your answer..."
                        disabled={isLoading} 
                    />
                    <Button onClick={handleSend} disabled={isLoading}><Send size={16}/></Button>
                    <Button variant="outline" size="icon" disabled={isLoading}><Mic size={16}/></Button>
                    <Button variant="outline" size="icon" disabled={isLoading}><Video size={16}/></Button>
                </div>
            </div>
        </div>
    );
};


interface AIMockInterviewViewProps {
  chatHistory: TutorChatHistory[];
  setChatHistory: (history: TutorChatHistory[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  jobDescription: string;
  setJobDescription: (desc: string) => void;
  resumeText: string;
  setResumeText: (text: string) => void;
  resumeFileName: string;
  setResumeFileName: (name: string) => void;
}


const AIMockInterviewView: React.FC<AIMockInterviewViewProps> = ({
  chatHistory,
  setChatHistory,
  isLoading,
  setIsLoading,
  jobDescription,
  setJobDescription,
  resumeText,
  setResumeText,
  resumeFileName,
  setResumeFileName,
}) => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const { toast } = useToast();

  const startInterview = async () => {
    setIsLoading(true);
    setChatHistory([]);
    try {
      const result = await mockInterview({
        resumeText,
        jobDescription,
        chatHistory: [],
      });
      setChatHistory([{ role: 'model', content: result.response }]);
      setIsSessionActive(true);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to start interview.' });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (message: string) => {
    setIsLoading(true);
    const newHistory: TutorChatHistory[] = [...chatHistory, { role: 'user', content: message }];
    setChatHistory(newHistory);
    try {
      const result = await mockInterview({
        resumeText,
        jobDescription,
        chatHistory: newHistory,
      });
      setChatHistory(prev => [...prev, { role: 'model', content: result.response }]);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to get response.' });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="animate-in fade-in">
        {!isSessionActive ? (
            <SetupView
                onStart={startInterview}
                isLoading={isLoading}
                jobDescription={jobDescription}
                setJobDescription={setJobDescription}
                resumeText={resumeText}
                setResumeText={setResumeText}
                resumeFileName={resumeFileName}
                setResumeFileName={setResumeFileName}
            />
        ) : (
            <InterviewView
                chatHistory={chatHistory}
                onSendMessage={sendMessage}
                isLoading={isLoading}
            />
        )}
      </div>
  );
};

export default AIMockInterviewView;
