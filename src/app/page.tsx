"use client";
import React, { useState, useEffect } from 'react';
import { BookOpen, Map, Users, Code, Plus, Sparkles, BrainCircuit, FileText, Lightbulb, Bot, Package, WandSparkles, Send, BookCopy, Search, FileSignature, MessageSquareQuote } from 'lucide-react';
import { answerCareerQuestion } from '@/ai/flows/answer-career-questions';
import { useToast } from "@/hooks/use-toast";
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// --- TYPE DEFINITIONS --- //

type ActiveView = 'tutor' | 'roadmap' | 'mentor' | 'coder' | 'content-generator' | 'idea-generator' | null;

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  subtext: string;
  active?: boolean;
  onClick?: () => void;
}

interface StatItemProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

interface BadgeProps {
  icon: React.ReactNode;
  label: string;
}

interface SuggestionProps {
  icon: React.ReactNode;
  text: string;
  onClick: (text: string) => void;
}

interface RecommendedToolProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'yellow' | 'green' | 'blue' | 'purple';
}

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}


// --- SVG ICONS --- //

const DesignerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm10.293 9.293a1 1 0 011.414 0l2 2a1 1 0 01-1.414 1.414L14 12.414V14a1 1 0 11-2 0v-1.586l-2.293 2.293a1 1 0 01-1.414-1.414l2-2a1 1 0 010-1.414l-2-2a1 1 0 011.414-1.414L12 8.586V7a1 1 0 112 0v1.586l2.293-2.293zM8 6a2 2 0 100 4 2 2 0 000-4z" clipRule="evenodd" />
    </svg>
);


// --- COMPONENTS --- //

// Header Component for the default view
const DefaultHeader = () => (
  <header className="bg-gradient-to-r from-orange-400 to-red-500 rounded-xl p-6 text-white shadow-lg flex justify-between items-center">
    <div className="flex items-center gap-4">
      <div className="bg-white/20 p-3 rounded-lg">
        <Package size={28} className="text-white" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">Select an AI Tool</h1>
        <p className="text-white/80">Choose a tool to start your AI-powered journey</p>
      </div>
    </div>
    <button className="bg-white/90 text-orange-500 font-semibold py-2 px-4 rounded-full shadow-md hover:bg-white transition-colors duration-300 flex items-center gap-2 text-sm">
      <WandSparkles size={16} />
      AI Powered
    </button>
  </header>
);

// Welcome Message Component for the default view
const WelcomeMessage = () => (
  <div className="bg-white rounded-xl shadow-md p-8 lg:p-16 text-center flex flex-col items-center justify-center">
    <div className="bg-gray-100 p-6 rounded-full mb-6">
       <Bot size={48} className="text-gray-600" />
    </div>
    <h2 className="text-3xl font-bold text-gray-800">Welcome to AI Tools</h2>
    <p className="text-gray-500 mt-2 max-w-md">
      Select an AI tool from the sidebar to start creating amazing content!
    </p>
  </div>
);

// Reusable Stat Card Component for the default view
const StatCard = ({ value, label, color }: { value: number; label: string; color: string }) => (
  <div className="flex flex-col items-center">
    <p className={`text-4xl font-bold ${color}`}>{value}</p>
    <p className="text-gray-500 mt-2 text-sm font-medium">{label}</p>
  </div>
);

// Stats Section Component for the default view
const StatsSection = () => {
  const stats = [
    { value: 24, label: 'AI Interactions', color: 'text-red-500' },
    { value: 236, label: 'Total XP', color: 'text-blue-500' },
    { value: 1, label: 'Current Level', color: 'text-yellow-500' },
    { value: 3, label: 'Badges Earned', color: 'text-green-500' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Your AI Stats</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((stat, index) => (
          <StatCard key={index} value={stat.value} label={stat.label} color={stat.color} />
        ))}
      </div>
    </div>
  );
};


const NavItem: React.FC<NavItemProps> = ({ icon, label, subtext, active = false, onClick }) => (
  <div onClick={onClick} className={`flex items-center p-3 rounded-lg cursor-pointer ${active ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}>
    <div className={`p-2 rounded-lg ${active ? 'bg-white' : 'bg-gray-100'}`}>
      {icon}
    </div>
    <div className="ml-3">
      <p className="font-semibold text-sm">{label}</p>
      <p className="text-xs text-gray-500">{subtext}</p>
    </div>
  </div>
);

const StatItem: React.FC<StatItemProps> = ({ label, value, highlight = false }) => (
  <div className={`flex justify-between items-center text-sm py-2 ${highlight ? 'text-indigo-600 font-bold' : 'text-gray-600'}`}>
    <span>{label}</span>
    <span className={`px-2 py-0.5 rounded-full ${highlight ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-800'}`}>{value}</span>
  </div>
);

const Badge: React.FC<BadgeProps> = ({ icon, label }) => (
  <div className="flex flex-col items-center space-y-1 text-gray-600">
    <div className="p-3 bg-gray-100 rounded-full">
      {icon}
    </div>
    <p className="text-xs font-medium">{label}</p>
  </div>
);

const Suggestion: React.FC<SuggestionProps> = ({ icon, text, onClick }) => (
  <div onClick={() => onClick(text)} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
    <div className="text-red-500">{icon}</div>
    <p className="ml-3 font-medium text-gray-700">{text}</p>
  </div>
);

const RecommendedTool: React.FC<RecommendedToolProps> = ({ icon, title, description, color }) => {
    const colorClasses = {
        yellow: 'border-yellow-400 bg-yellow-50',
        green: 'border-green-400 bg-green-50',
        blue: 'border-blue-400 bg-blue-50',
        purple: 'border-purple-400 bg-purple-50'
    };
    const iconColorClasses = {
        yellow: 'text-yellow-600',
        green: 'text-green-600',
        blue: 'text-blue-600',
        purple: 'text-purple-600'
    };
    
    return (
        <div className={`p-4 rounded-lg border-l-4 ${colorClasses[color]} w-full`}>
            <div className="flex items-center mb-2">
                <div className={`p-1 rounded-md ${iconColorClasses[color]}`}>
                    {icon}
                </div>
                <h4 className="ml-2 font-bold text-gray-800">{title}</h4>
            </div>
            <p className="text-sm text-gray-600">{description}</p>
        </div>
    );
};

const RecommendedToolsSection = () => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold text-gray-800">Recommended AI Tools</h2>
        <p className="text-gray-500 mb-6">Based on your profile and career goals</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RecommendedTool 
                icon={<Users />}
                title="AI Mentor"
                description="Work with an AI mentor specialized in UX to design and advance your career."
                color="yellow"
            />
            <RecommendedTool 
                icon={<Code />}
                title="AI Coder"
                description="Leverage the power of AI to complement your UX design skills and post your entries."
                color="green"
            />
             <RecommendedTool
                icon={<FileText />}
                title="Content Generator"
                description="Generate text content for your projects and career materials."
                color="blue"
            />
            <RecommendedTool
                icon={<Lightbulb />}
                title="Idea Generator"
                description="Brainstorm new ideas for projects and career opportunities."
                color="purple"
            />
        </div>
    </div>
);

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
);


// --- MAIN APP COMPONENT --- //

export default function Home() {
    const { toast } = useToast();
    const [activeView, setActiveView] = useState<ActiveView>(null);
    const [tutorInput, setTutorInput] = useState('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [roadmapContent, setRoadmapContent] = useState<string>('');
    const [generatedContent, setGeneratedContent] = useState('');
    const [generatedIdeas, setGeneratedIdeas] = useState<string[]>([]);
    const [generatedCode, setGeneratedCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const callAIFlow = async (prompt: string): Promise<string | null> => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await answerCareerQuestion({ question: prompt });
            return result.answer;
        } catch (err: any) {
            console.error("AI flow failed:", err);
            setError(err.message || "Failed to get a response from the AI. Please try again.");
            toast({
              variant: "destructive",
              title: "Oh no! Something went wrong.",
              description: "There was a problem with the AI response. Please try again.",
            });
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const handleTutorSubmit = async (prompt: string) => {
        if (!prompt.trim()) return;

        const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', text: prompt }];
        setChatHistory(newHistory);
        setTutorInput('');

        const responseText = await callAIFlow(prompt);
        if (responseText) {
            setChatHistory([...newHistory, { role: 'model', text: responseText }]);
        } else {
             setChatHistory([...newHistory, { role: 'model', text: "Sorry, I couldn't get a response. Please try again." }]);
        }
    };

    const handleGenerateRoadmap = async () => {
        const prompt = `Generate a personalized career roadmap for a UX Designer. The user is a beginner. Structure the response in Markdown. Include:
        1.  **Introduction:** A brief, motivating intro to the UX design field.
        2.  **Phase 1: Foundational Skills (Months 1-3):** List core concepts (e.g., User Research, Wireframing, Prototyping) with a brief explanation and links to 1-2 high-quality free learning resources for each.
        3.  **Phase 2: Tool Proficiency (Months 4-6):** Recommend essential tools (e.g., Figma, Sketch, Adobe XD) and suggest small projects to practice. Include resource links.
        4.  **Phase 3: Building a Portfolio (Months 7-9):** Suggest 2-3 portfolio project ideas (e.g., redesign a local business website, create a new mobile app concept). Explain what to include in each case study.
        5.  **Phase 4: Job Readiness (Months 10-12):** Give advice on resume building, networking on platforms like LinkedIn, and preparing for UX interviews.`;

        const responseText = await callAIFlow(prompt);
        if (responseText) {
            setRoadmapContent(responseText);
        } else {
            setRoadmapContent("# Error\n\nCould not generate the roadmap. Please try again later.");
        }
    };

    const handleGenerateContent = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const topic = formData.get('topic') as string;
        const prompt = `Generate a short blog post about: ${topic}.`;
        const response = await callAIFlow(prompt);
        if (response) setGeneratedContent(response);
    };

    const handleGenerateIdeas = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const topic = formData.get('topic') as string;
        const prompt = `Generate 5 project ideas related to: ${topic}. Separate each idea with "|||".`;
        const response = await callAIFlow(prompt);
        if (response) setGeneratedIdeas(response.split('|||').map(idea => idea.trim()));
    };

    const handleGenerateCode = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const description = formData.get('description') as string;
        const prompt = `Generate a React component in TypeScript based on this description: "${description}". Only return the code inside a single code block.`;
        const response = await callAIFlow(prompt);
        if (response) {
            const code = response.match(/```(?:typescript|jsx|tsx)?\n([\s\S]*?)```/);
            setGeneratedCode(code ? code[1] : response);
        }
    };
    
    // --- RENDER LOGIC --- //

    const renderMainContent = () => {
        if (activeView === null) {
            return (
                <div className="space-y-8">
                    <DefaultHeader />
                    <WelcomeMessage />
                </div>
            )
        }
        
        switch (activeView) {
            case 'tutor':
                return (
                    <div className="bg-white p-6 rounded-xl shadow-sm">
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
                        <div className="mt-6">
                            {chatHistory.length === 0 ? (
                                <>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-4">How can I help you?</h1>
                                    <p className="text-gray-600 mb-6">Ask me anything or use one of the suggestions below</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                        <Suggestion icon={<span className="text-2xl">🎓</span>} text="Help select a career path" onClick={handleTutorSubmit} />
                                        <Suggestion icon={<span className="text-2xl">🔍</span>} text="What are the best jobs for me?" onClick={handleTutorSubmit} />
                                        <Suggestion icon={<span className="text-2xl">📚</span>} text="Recommend me a topic I can learn in an hour" onClick={handleTutorSubmit} />
                                        <Suggestion icon={<span className="text-2xl">🧪</span>} text="Test my Knowledge on UX Design" onClick={handleTutorSubmit}/>
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
                                    value={tutorInput}
                                    onChange={(e) => setTutorInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleTutorSubmit(tutorInput)}
                                    placeholder="✨ Ask me anything..."
                                    className="flex-grow border-gray-300 border rounded-l-lg p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                    disabled={isLoading}
                                />
                                <button onClick={() => handleTutorSubmit(tutorInput)} className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-r-lg hover:bg-indigo-700 transition-colors" disabled={isLoading}>
                                    Send
                                </button>
                            </div>
                            {error && <p className="text-red-500 mt-2">{error}</p>}
                        </div>
                    </div>
                );
            case 'roadmap':
                return (
                     <div className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="flex justify-between items-center">
                             <h2 className="text-lg font-bold text-gray-800 flex items-center">
                                <span className="p-2 bg-indigo-100 text-indigo-500 rounded-lg mr-3"><Map className="h-5 w-5" /></span>
                                AI Roadmap
                            </h2>
                             <button className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">10 XP per update</button>
                        </div>
                         <p className="text-sm text-gray-500 ml-10">Personalized career guidance and skill development</p>
                        
                        {isLoading ? <LoadingSpinner /> : roadmapContent ? (
                            <div className="prose prose-indigo mt-6 max-w-none" dangerouslySetInnerHTML={{ __html: roadmapContent.replace(/\n/g, '<br />') }}></div>
                        ) : (
                             <div className="mt-8 text-center">
                                <DesignerIcon />
                                <h3 className="text-2xl font-bold text-gray-900 mt-4">Your UX Designer Roadmap</h3>
                                <p className="text-gray-600 mt-2 max-w-md mx-auto">Get a personalized career roadmap with skill recommendations, learning resources, and milestone tracking.</p>
                                <button onClick={handleGenerateRoadmap} className="mt-6 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors flex items-center mx-auto">
                                    <Sparkles className="h-4 w-4 inline-block mr-1" /> Generate Your Roadmap
                                </button>
                            </div>
                        )}
                         {error && <p className="text-red-500 mt-2">{error}</p>}
                    </div>
                );
            case 'mentor':
                 return (
                    <div className="bg-white p-6 rounded-xl shadow-sm">
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
                         <div className="mt-6">
                            {chatHistory.length === 0 ? (
                                <>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-4">What's on your mind?</h1>
                                    <p className="text-gray-600 mb-6">Ask for advice or use a suggestion below</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                        <Suggestion icon={<BookCopy size={24} />} text="How do I prepare for a promotion?" onClick={handleTutorSubmit} />
                                        <Suggestion icon={<Search size={24} />} text="Review my resume for a UX role" onClick={handleTutorSubmit} />
                                        <Suggestion icon={<MessageSquareQuote size={24} />} text="Give me feedback on a project idea" onClick={handleTutorSubmit} />
                                        <Suggestion icon={<FileSignature size={24} />} text="Help me negotiate a job offer" onClick={handleTutorSubmit}/>
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
                             <div className="mt-6 flex">
                                <input
                                    type="text"
                                    value={tutorInput}
                                    onChange={(e) => setTutorInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleTutorSubmit(tutorInput)}
                                    placeholder="💬 Ask for career advice..."
                                    className="flex-grow border-gray-300 border rounded-l-lg p-3 focus:ring-yellow-500 focus:border-yellow-500"
                                    disabled={isLoading}
                                />
                                <Button onClick={() => handleTutorSubmit(tutorInput)} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-r-lg" disabled={isLoading}>
                                    <Send size={18} />
                                </Button>
                            </div>
                            {error && <p className="text-red-500 mt-2">{error}</p>}
                        </div>
                    </div>
                );
            case 'content-generator':
                return (
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800 flex items-center">
                                        <span className="p-2 bg-blue-100 text-blue-500 rounded-lg mr-3"><FileText className="h-5 w-5" /></span>
                                        Content Generator
                                    </h2>
                                    <p className="text-sm text-gray-500 ml-10">Generate text for blogs, emails, and more</p>
                                </div>
                                <button className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">8 XP per generation</button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleGenerateContent} className="space-y-4">
                                <Textarea name="topic" placeholder="e.g., The future of AI in UX Design" required disabled={isLoading} rows={3} />
                                <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700">
                                    {isLoading ? 'Generating...' : 'Generate Content'}
                                    <Sparkles className="ml-2" size={16} />
                                </Button>
                            </form>
                            {isLoading && !generatedContent && <LoadingSpinner />}
                            {generatedContent && (
                                <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                                     <h3 className="font-bold mb-2">Generated Content:</h3>
                                     <p className="text-gray-700 whitespace-pre-wrap">{generatedContent}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            case 'idea-generator':
                return (
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800 flex items-center">
                                        <span className="p-2 bg-purple-100 text-purple-500 rounded-lg mr-3"><Lightbulb className="h-5 w-5" /></span>
                                        Idea Generator
                                    </h2>
                                    <p className="text-sm text-gray-500 ml-10">Brainstorm new project and business ideas</p>
                                </div>
                                <button className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">5 XP per brainstorm</button>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <form onSubmit={handleGenerateIdeas} className="flex gap-2">
                                <Input name="topic" placeholder="e.g., Mobile apps for sustainability" required disabled={isLoading} className="flex-grow"/>
                                <Button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
                                    {isLoading ? <LoadingSpinner/> : 'Get Ideas'}
                                </Button>
                            </form>
                            {isLoading && generatedIdeas.length === 0 && <LoadingSpinner />}
                            {generatedIdeas.length > 0 && (
                                <div className="mt-6 space-y-3">
                                    <h3 className="font-bold">Generated Ideas:</h3>
                                    {generatedIdeas.map((idea, index) => (
                                       <div key={index} className="p-3 bg-gray-50 border rounded-lg flex items-start gap-3">
                                           <Lightbulb className="h-5 w-5 text-purple-500 mt-1" />
                                           <p className="text-gray-700 flex-1">{idea}</p>
                                       </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            case 'coder':
                 return (
                    <Card>
                        <CardHeader>
                           <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800 flex items-center">
                                        <span className="p-2 bg-green-100 text-green-500 rounded-lg mr-3"><Code className="h-5 w-5" /></span>
                                        AI Coder
                                    </h2>
                                    <p className="text-sm text-gray-500 ml-10">Your AI-powered coding assistant</p>
                                </div>
                                <button className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">12 XP per component</button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleGenerateCode} className="space-y-4">
                               <Textarea name="description" placeholder="Describe the component you want to build... e.g., 'A responsive pricing table with three tiers'" required disabled={isLoading} rows={4} />
                                <Button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700">
                                    {isLoading ? 'Writing Code...' : 'Generate Code'}
                                    <WandSparkles className="ml-2" size={16}/>
                                </Button>
                            </form>
                            {isLoading && !generatedCode && <LoadingSpinner />}
                            {generatedCode && (
                                <div className="mt-6">
                                    <h3 className="font-bold mb-2">Generated Code:</h3>
                                    <pre className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto text-sm">
                                        <code>{generatedCode}</code>
                                    </pre>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
        }
    };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="container mx-auto p-4 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Sidebar */}
          <aside className="lg:col-span-3 space-y-8">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4">AI Tools</h2>
              <nav className="space-y-2">
                <NavItem icon={<BookOpen className="h-5 w-5" />} label="AI Tutor" subtext="Personalized learning" active={activeView === 'tutor'} onClick={() => setActiveView('tutor')} />
                <NavItem icon={<Map className="h-5 w-5" />} label="AI Roadmap" subtext="Career pathing" active={activeView === 'roadmap'} onClick={() => setActiveView('roadmap')} />
                <NavItem icon={<Users className="h-5 w-5" />} label="AI Mentor" subtext="Guidance and behavior" active={activeView === 'mentor'} onClick={() => setActiveView('mentor')} />
                <NavItem icon={<FileText className="h-5 w-5" />} label="Content Generator" subtext="Generate text content" active={activeView === 'content-generator'} onClick={() => setActiveView('content-generator')} />
                <NavItem icon={<Lightbulb className="h-5 w-5" />} label="Idea Generator" subtext="Brainstorm new ideas" active={activeView === 'idea-generator'} onClick={() => setActiveView('idea-generator')} />
                <NavItem icon={<Code className="h-5 w-5" />} label="AI Coder" subtext="Coding Companion" active={activeView === 'coder'} onClick={() => setActiveView('coder')} />
              </nav>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-2">AI Usage Stats</h2>
              <div className="space-y-1">
                <StatItem label="AI Tutor Sessions" value={24} />
                <StatItem label="AI Roadmap Updates" value={12} />
                <StatItem label="XP From All Tools" value={236} highlight />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4">AI Badges Earned</h2>
              <div className="flex justify-around">
                <Badge icon={<Plus className="h-6 w-6" />} label="AI Novice" />
                <Badge icon={<BrainCircuit className="h-6 w-6" />} label="Explorer" />
                <Badge icon={<Users className="h-6 w-6" />} label="Mentor" />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9 space-y-8">
            {renderMainContent()}
            {(activeView !== null) && 
              <>
                <StatsSection />
                <RecommendedToolsSection />
              </>
            }
          </main>
        </div>
      </div>
    </div>
  );
};
