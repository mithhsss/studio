
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Send, Paperclip, Loader, Bot, User, Briefcase, Building, MessageSquare } from 'lucide-react';
import type { ChatMessage, MentorMode, TutorChatHistory } from '@/app/page';
import { useToast } from "@/hooks/use-toast";
import { answerCareerQuestion } from '@/ai/flows/answer-career-questions';
import { analyzeResume } from '@/ai/flows/analyze-resume-flow';
import AIMockInterviewView from './AIMockInterviewView';
import AIBusinessSimulatorView from './AIBusinessSimulatorView';
import { marked } from 'marked';
import mammoth from 'mammoth';

interface AIMentorViewProps {
    mentorMode: MentorMode;
    setMentorMode: (mode: MentorMode) => void;
    
    // Chat Mode state
    chatHistory: ChatMessage[];
    setChatHistory: (history: ChatMessage[]) => void;
    userInput: string;
    setUserInput: (input: string) => void;
    resumeText: string | null;
    setResumeText: (text: string | null) => void;
    resumeFileName: string | null;
    setResumeFileName: (name: string | null) => void;

    // Interview Mode state
    interviewChatHistory: TutorChatHistory[];
    setInterviewChatHistory: (history: TutorChatHistory[]) => void;
    jobDescription: string;
    setJobDescription: (desc: string) => void;
    interviewResumeText: string;
    setInterviewResumeText: (text: string) => void;
    interviewResumeFileName: string;
    setInterviewResumeFileName: (name: string) => void;

    // General
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
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

const ChatView: React.FC<Pick<AIMentorViewProps, 'chatHistory' | 'setChatHistory' | 'isLoading' | 'userInput' | 'setUserInput' | 'resumeText' | 'setResumeText' | 'resumeFileName' | 'setResumeFileName' | 'error' | 'setIsLoading'>> = ({
    chatHistory,
    setChatHistory,
    isLoading,
    setIsLoading,
    userInput,
    setUserInput,
    resumeText,
    setResumeText,
    resumeFileName,
    setResumeFileName,
    error,
}) => {
    const { toast } = useToast();

    const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setResumeFileName(file.name);
        setIsLoading(true);
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
                        setIsLoading(false);
                    }
                };
                reader.readAsArrayBuffer(file);
                return;
            } else if (file.name.endsWith('.docx')) {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    if(e.target?.result) {
                        const arrayBuffer = e.target.result as ArrayBuffer;
                        const result = await mammoth.extractRawText({ arrayBuffer });
                        setResumeText(result.value);
                        toast({ title: "Resume Uploaded!", description: `${file.name} is now part of the conversation context.` });
                        setIsLoading(false);
                    }
                };
                reader.readAsArrayBuffer(file);
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                setResumeText(text);
                toast({ title: "Resume Uploaded", description: `${file.name} is now part of the conversation context.` });
                setIsLoading(false);
            };
            reader.readAsText(file);
        } catch (e) {
            console.error("Error parsing resume:", e);
            toast({ variant: "destructive", title: "Parsing Failed", description: "Could not read the resume file. Please try a different format." });
            setResumeFileName(null);
            setResumeText(null);
            setIsLoading(false);
        }
    };

    const handleMentorSubmit = async () => {
        if (!userInput.trim()) return;

        setIsLoading(true);
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
        } finally {
            setIsLoading(false);
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
                <div className="flex items-center gap-3">
                    <div className="bg-yellow-100 text-yellow-600 p-2 rounded-lg">
                        <MessageSquare size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Career Chat</h3>
                        <p className="text-gray-500 text-sm">Ask questions, get advice, and upload your resume for analysis.</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[60vh] flex flex-col">
                    <div className="flex-grow space-y-4 overflow-y-auto pr-4 mb-4">
                        {chatHistory.map((msg, index) => (
                            <div key={index} className={`flex gap-3 items-start ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-yellow-500 text-white flex items-center justify-center flex-shrink-0"><Bot size={16} /></div>}
                                <div
                                    className={`max-w-lg p-3 rounded-lg prose prose-sm ${msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-800'}`}
                                    dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }}
                                />
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
                            <input id="resume-upload" type="file" className="absolute w-full h-full opacity-0 top-0 left-0 cursor-pointer" onChange={handleResumeUpload} accept=".txt,.md,.pdf,.docx" />
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


const AIMentorView: React.FC<AIMentorViewProps> = (props) => {

    const renderContent = () => {
        switch (props.mentorMode) {
            case 'chat':
                return <ChatView {...props} />;
            case 'interview_prep':
                return (
                    <AIMockInterviewView
                        chatHistory={props.interviewChatHistory}
                        setChatHistory={props.setInterviewChatHistory}
                        isLoading={props.isLoading}
                        setIsLoading={props.setIsLoading}
                        jobDescription={props.jobDescription}
                        setJobDescription={props.setJobDescription}
                        resumeText={props.interviewResumeText}
                        setResumeText={props.setInterviewResumeText}
                        resumeFileName={props.interviewResumeFileName}
                        setResumeFileName={props.setInterviewResumeFileName}
                    />
                );
            case 'business_simulator':
                return (
                    <AIBusinessSimulatorView />
                );
            default:
                return <ChatView {...props} />;
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
                        <p className="text-sm text-gray-500 ml-10">Your personal AI guide for career growth.</p>
                    </div>
                     <div className="border-b">
                        <nav className="-mb-px flex space-x-4">
                            <button onClick={() => props.setMentorMode('chat')} className={`py-2 px-3 flex items-center gap-2 font-medium text-sm rounded-md ${props.mentorMode === 'chat' ? 'bg-yellow-100 text-yellow-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
                                <MessageSquare size={16} /> Career Chat
                            </button>
                            <button onClick={() => props.setMentorMode('interview_prep')} className={`py-2 px-3 flex items-center gap-2 font-medium text-sm rounded-md ${props.mentorMode === 'interview_prep' ? 'bg-yellow-100 text-yellow-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
                                <Briefcase size={16} /> Mock Interview
                            </button>
                            <button onClick={() => props.setMentorMode('business_simulator')} className={`py-2 px-3 flex items-center gap-2 font-medium text-sm rounded-md ${props.mentorMode === 'business_simulator' ? 'bg-yellow-100 text-yellow-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
                               <Building size={16} /> Business Strategy
                            </button>
                        </nav>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {renderContent()}
            </CardContent>
        </Card>
    );
};

export default AIMentorView;
