import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Send } from 'lucide-react';
import type { ChatMessage } from '@/app/page';

interface AITutorViewProps {
    chatHistory: ChatMessage[];
    isLoading: boolean;
    userInput: string;
    setUserInput: (input: string) => void;
    handleTutorSubmit: (prompt: string) => void;
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

const AITutorView: React.FC<AITutorViewProps> = ({
    chatHistory,
    isLoading,
    userInput,
    setUserInput,
    handleTutorSubmit,
    error,
}) => {
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 flex items-center">
                            <span className="p-2 bg-orange-100 text-orange-500 rounded-lg mr-3"><BookOpen className="h-5 w-5" /></span>
                            AI Tutor
                        </h2>
                        <p className="text-sm text-gray-500 ml-10">Your personalized caring companion</p>
                    </div>
                    <button className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">2 XP per search</button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mt-6">
                    {chatHistory.length === 0 ? (
                        <>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">How can I help you?</h1>
                            <p className="text-gray-600 mb-6">Ask me anything or use one of the suggestions below</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                <Suggestion icon={<span className="text-2xl">🎓</span>} text="Help select a career path" onClick={handleTutorSubmit} />
                                <Suggestion icon={<span className="text-2xl">🔍</span>} text="What are the best jobs for me?" onClick={handleTutorSubmit} />
                                <Suggestion icon={<span className="text-2xl">📚</span>} text="Recommend me a topic I can learn in an hour" onClick={handleTutorSubmit} />
                                <Suggestion icon={<span className="text-2xl">🧪</span>} text="Test my Knowledge on UX Design" onClick={handleTutorSubmit} />
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4 h-96 overflow-y-auto pr-4 mb-4">
                            {chatHistory.map((msg, index) => (
                                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-lg p-3 rounded-lg ${msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                                        <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && <LoadingSpinner />}
                        </div>
                    )}
                    <div className="mt-6 flex">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleTutorSubmit(userInput)}
                            placeholder="✨ Ask me anything..."
                            className="flex-grow border-gray-300 border rounded-l-lg p-3 focus:ring-indigo-500 focus:border-indigo-500"
                            disabled={isLoading}
                        />
                        <Button onClick={() => handleTutorSubmit(userInput)} className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-r-lg hover:bg-indigo-700 transition-colors" disabled={isLoading}>
                            <Send size={18} />
                        </Button>
                    </div>
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                </div>
            </CardContent>
        </Card>
    );
};

export default AITutorView;
