import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Users, BookCopy, Search, MessageSquareQuote, FileSignature, Paperclip, Send } from 'lucide-react';
import type { ChatMessage } from '@/app/page';

interface AIMentorViewProps {
    chatHistory: ChatMessage[];
    isLoading: boolean;
    userInput: string;
    setUserInput: (input: string) => void;
    handleTutorSubmit: (prompt: string) => void;
    handleResumeUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    resumeFileName: string | null;
    setResumeText: (text: string | null) => void;
    setResumeFileName: (name: string | null) => void;
    error: string | null;
}

const Suggestion = ({ icon, text, onClick }: { icon: React.ReactNode, text: string, onClick: (text: string) => void }) => (
    <div onClick={() => onClick(text)} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
      <div className="text-red-500">{icon}</div>
      <p className="ml-3 font-medium text-gray-700">{text}</p>
    </div>
);
  
const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
);

const AIMentorView: React.FC<AIMentorViewProps> = ({
    chatHistory,
    isLoading,
    userInput,
    setUserInput,
    handleTutorSubmit,
    handleResumeUpload,
    resumeFileName,
    setResumeText,
    setResumeFileName,
    error,
}) => {
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 flex items-center">
                            <span className="p-2 bg-yellow-100 text-yellow-500 rounded-lg mr-3"><Users className="h-5 w-5" /></span>
                            AI Mentor
                        </h2>
                        <p className="text-sm text-gray-500 ml-10">Guidance on career growth and decisions</p>
                    </div>
                    <button className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">5 XP per question</button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mt-6">
                    {chatHistory.length === 0 ? (
                        <>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">What's on your mind?</h1>
                            <p className="text-gray-600 mb-6">Ask for advice or use a suggestion below. For best results, upload your resume!</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                <Suggestion icon={<BookCopy size={24} />} text="How do I prepare for a promotion?" onClick={handleTutorSubmit} />
                                <Suggestion icon={<Search size={24} />} text="Review my resume for a UX role" onClick={handleTutorSubmit} />
                                <Suggestion icon={<MessageSquareQuote size={24} />} text="Give me feedback on a project idea" onClick={handleTutorSubmit} />
                                <Suggestion icon={<FileSignature size={24} />} text="Help me negotiate a job offer" onClick={handleTutorSubmit} />
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4 h-96 overflow-y-auto pr-4 mb-4">
                            {chatHistory.map((msg, index) => (
                                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-lg p-3 rounded-lg ${msg.role === 'user' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                                        <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && <LoadingSpinner />}
                        </div>
                    )}
                    <div className="mt-6 flex items-center gap-2">
                        <Button asChild variant="outline" className="relative">
                            <div>
                                <label htmlFor="resume-upload" className="flex items-center cursor-pointer">
                                    <Paperclip size={18} />
                                    <span className="sr-only">Upload Resume</span>
                                </label>
                                <Input id="resume-upload" type="file" className="absolute w-full h-full opacity-0 cursor-pointer" onChange={handleResumeUpload} accept=".txt,.pdf,.md" />
                            </div>
                        </Button>
                        <div className="flex-grow relative">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleTutorSubmit(userInput)}
                                placeholder={resumeFileName ? `Asking about ${resumeFileName}...` : "💬 Ask for career advice..."}
                                className="w-full border-gray-300 border rounded-lg p-3 focus:ring-yellow-500 focus:border-yellow-500"
                                disabled={isLoading}
                            />
                            {resumeFileName && (
                                <button
                                    onClick={() => { setResumeText(null); setResumeFileName(null); }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    &times;
                                </button>
                            )}
                        </div>
                        <Button onClick={() => handleTutorSubmit(userInput)} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded-lg" disabled={isLoading}>
                            <Send size={18} />
                        </Button>
                    </div>
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                </div>
            </CardContent>
        </Card>
    );
};

export default AIMentorView;
