"use client";
import React, { useState, useEffect } from 'react';
import { BookOpen, Map, Users, Code, Plus, Sparkles, BrainCircuit, FileText, Lightbulb, Bot, Package, WandSparkles, Wind, Hash } from 'lucide-react';

import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';

import { answerCareerQuestion } from '@/ai/flows/answer-career-questions';
import { analyzeResume } from '@/ai/flows/analyze-resume-flow';
import { generateOutline, type GenerateOutlineOutput } from '@/ai/flows/generate-outline-flow';
import { generateDraft } from '@/ai/flows/generate-draft-flow';
import { generateCode, type GenerateCodeOutput } from '@/ai/flows/generate-code-flow';
import { generateIdeas } from '@/ai/flows/generate-ideas-flow';
import { refineContent } from '@/ai/flows/refine-content-flow';
import { chatWithIdea } from '@/ai/flows/chat-with-idea-flow';
import { combineIdeas } from '@/ai/flows/combine-ideas-flow';

import type { GenerateIdeasInput, Idea } from '@/ai/schemas/idea-generation-schemas';


import AITutorView from '@/components/views/AITutorView';
import AIRoadmapView from '@/components/views/AIRoadmapView';
import AIMentorView from '@/components/views/AIMentorView';
import AIContentGeneratorView from '@/components/views/AIContentGeneratorView';
import AIIdeaGeneratorView from '@/components/views/AIIdeaGeneratorView';
import AICoderView from '@/components/views/AICoderView';
import DefaultView from '@/components/views/DefaultView';

// --- TYPE DEFINITIONS --- //

export type ActiveView = 'tutor' | 'roadmap' | 'mentor' | 'coder' | 'content-generator' | 'idea-generator' | null;
export type ContentGeneratorStep = 'idea' | 'outline' | 'draft';
export type IdeaGeneratorStep = 'input' | 'results' | 'finalized';
export type CoderStep = 'blueprint' | 'workbench';


export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export interface ContentFormData {
    topic: string;
    goal: string;
    outline: GenerateOutlineOutput | null;
    draft: string;
}

export interface IdeaWithState extends Idea {
    id: number;
    likes: number;
    isFavorited: boolean;
    column: 'ideas' | 'chat';
    chatHistory: { sender: 'user' | 'ai'; text: string }[];
}

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

interface RecommendedToolProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'yellow' | 'green' | 'blue' | 'purple';
}

// --- REUSABLE COMPONENTS --- //

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

// Reusable Stat Card Component for the default view
const StatCard = ({ value, label, color }: { value: number; label: string; color: string }) => (
    <div className="flex flex-col items-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
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


// --- MAIN APP COMPONENT --- //

export default function Home() {
    const { toast } = useToast();
    const [activeView, setActiveView] = useState<ActiveView>(null);
    const [userInput, setUserInput] = useState('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [roadmapContent, setRoadmapContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resumeText, setResumeText] = useState<string | null>(null);
    const [resumeFileName, setResumeFileName] = useState<string | null>(null);

    // State for Content Generator
    const [contentGeneratorStep, setContentGeneratorStep] = useState<ContentGeneratorStep>('idea');
    const [contentFormData, setContentFormData] = useState<ContentFormData>({
        topic: 'The future of AI in UX Design',
        goal: 'Educate an audience',
        outline: null,
        draft: '',
    });

    // State for Idea Generator
    const [ideaGeneratorStep, setIdeaGeneratorStep] = useState<IdeaGeneratorStep>('input');
    const [ideas, setIdeas] = useState<IdeaWithState[]>([]);
    const [activeChatIdea, setActiveChatIdea] = useState<IdeaWithState | null>(null);
    const [combinePair, setCombinePair] = useState<IdeaWithState[]>([]);
    const [finalizedIdea, setFinalizedIdea] = useState<any | null>(null);
    const [dragOverId, setDragOverId] = useState<number | null>(null);
    const [ideaFormData, setIdeaFormData] = useState<GenerateIdeasInput>({ 
        subject: 'Annual company retreat', 
        audience: 'Remote-first tech employees', 
        constraints: 'Budget under $10k', 
        other: 'Focus on mental wellness', 
        lens: 'What If?',
        detailedDescription: ''
    });

    // State for AI Coder
    const [coderStep, setCoderStep] = useState<CoderStep>('blueprint');
    const [generatedCode, setGeneratedCode] = useState<GenerateCodeOutput | null>(null);
    const [coderChatHistory, setCoderChatHistory] = useState<any[]>([]);
    const [coderFormData, setCoderFormData] = useState({
        description: 'A responsive pricing table with three tiers and a selected state',
        framework: 'React',
        language: 'JavaScript',
        styling: 'CSS Modules',
        techStack: 'Next.js, Vercel',
        schema: `[{
  "id": 1,
  "name": "Basic",
  "price": 10,
  "features": ["Feature A", "Feature B"]
}]`
    });

    const handleViewChange = (view: ActiveView) => {
        setActiveView(view);
        setChatHistory([]);
        setUserInput('');
        setError(null);
        setResumeText(null);
        setResumeFileName(null);
    };

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
                  description: `${file.name} has been successfully uploaded and read.`,
                })
            };
            reader.readAsText(file);
        }
    };

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
        setUserInput('');

        let responseText: string | null = null;

        if (activeView === 'mentor' && resumeText) {
             setIsLoading(true);
             setError(null);
             try {
                const result = await analyzeResume({ question: prompt, resumeText });
                responseText = result.analysis;
             } catch (err: any) {
                 console.error("AI flow failed:", err);
                 setError(err.message || "Failed to get a response from the AI. Please try again.");
                 toast({
                   variant: "destructive",
                   title: "Oh no! Something went wrong.",
                   description: "There was a problem with the AI response. Please try again.",
                 });
             } finally {
                setIsLoading(false);
             }
        } else {
            responseText = await callAIFlow(prompt);
        }


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

    const handleGenerateOutline = async () => {
        setIsLoading(true);
        try {
            const result = await generateOutline({ 
                topic: contentFormData.topic, 
                goal: contentFormData.goal 
            });
            setContentFormData(prev => ({ ...prev, outline: result }));
            setContentGeneratorStep('outline');
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Outline Generation Failed",
                description: "There was a problem generating the outline. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateDraft = async () => {
        if (!contentFormData.outline) return;
        setIsLoading(true);
        try {
            const result = await generateDraft(contentFormData.outline);
            setContentFormData(prev => ({ ...prev, draft: result.draft }));
            setContentGeneratorStep('draft');
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Draft Generation Failed",
                description: "There was a problem generating the draft. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefineContent = async (command: string) => {
        setIsLoading(true);
        try {
            const result = await refineContent({ text: contentFormData.draft, command });
            setContentFormData(prev => ({ ...prev, draft: result.refinedText }));
            toast({
                title: "Content Refined!",
                description: "The draft has been updated.",
            });
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Refinement Failed",
                description: "The AI could not refine the content. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleContentStartOver = () => {
        setContentGeneratorStep('idea');
        setContentFormData({
            topic: 'The future of AI in UX Design',
            goal: 'Educate an audience',
            outline: null,
            draft: '',
        });
    };

    // Idea Generator Functions
    const handleGenerateIdeas = async () => {
        setIsLoading(true);
        try {
            const result = await generateIdeas(ideaFormData);
            const ideasWithState: IdeaWithState[] = result.ideas.map((idea, index) => ({
                ...idea,
                id: index + 1, // Add a unique ID
                likes: 0,
                isFavorited: false,
                column: 'ideas',
                chatHistory: [],
            }));
            setIdeas(ideasWithState);
            setIdeaGeneratorStep('results');
        } catch (err) {
             toast({
                variant: "destructive",
                title: "Idea Generation Failed",
                description: "There was a problem generating ideas. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleIdeaAction = async (action: string, id: number, data?: any) => {
        setIsLoading(true);
        try {
            switch (action) {
              case 'like':
                setIdeas(ideas.map(i => i.id === id ? { ...i, likes: i.likes + 1 } : i));
                break;
              case 'favorite':
                setIdeas(ideas.map(i => i.id === id ? { ...i, isFavorited: !i.isFavorited } : i));
                break;
              case 'chat':
                const ideaToChat = ideas.find(i => i.id === id);
                setActiveChatIdea(ideaToChat as IdeaWithState);
                setIdeas(ideas.map(i => i.id === id ? { ...i, column: 'chat' } : i));
                break;
              case 'message':
                const currentIdea = ideas.find(i => i.id === id);
                if (!currentIdea) return;
                
                const userMessage = { sender: 'user' as const, text: data };
                const updatedChatHistory = [...currentIdea.chatHistory, userMessage];
                setIdeas(ideas.map(i => i.id === id ? { ...i, chatHistory: updatedChatHistory } : i));
                setActiveChatIdea(prev => prev ? {...prev, chatHistory: updatedChatHistory} : null);

                const result = await chatWithIdea({ idea: currentIdea, message: data });
                const aiResponse = { sender: 'ai' as const, text: result.response };

                const finalChatHistory = [...updatedChatHistory, aiResponse];
                setIdeas(ideas.map(i => i.id === id ? { ...i, chatHistory: finalChatHistory } : i));
                setActiveChatIdea(prev => prev ? {...prev, chatHistory: finalChatHistory} : null);
                break;
            }
        } catch (err) {
             toast({ variant: "destructive", title: "Action Failed", description: "An error occurred. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDragStart = (e: React.DragEvent, id: number) => {
        e.dataTransfer.setData("ideaId", id.toString());
    };

    const handleDragEnd = () => {
        setDragOverId(null);
    };

    const handleDrop = (e: React.DragEvent, targetId: number) => {
        e.preventDefault();
        setDragOverId(null);
        const draggedId = parseInt(e.dataTransfer.getData("ideaId"));
        
        if (draggedId && targetId && draggedId !== targetId) {
          const idea1 = ideas.find(i => i.id === draggedId);
          const idea2 = ideas.find(i => i.id === targetId);
          if (idea1 && idea2) {
            setCombinePair([idea1, idea2]);
          }
        }
    };
  
    const handleCombine = async () => {
      setIsLoading(true);
      const [idea1, idea2] = combinePair;
      
      try {
        const result = await combineIdeas({ idea1, idea2 });
        const newIdea: IdeaWithState = {
            ...result.combinedIdea,
            id: Date.now(),
            likes: 1, 
            isFavorited: true, 
            column: 'chat',
            chatHistory: [{ sender: 'ai', text: 'I\'ve combined these two ideas. What would you like to refine first?' }]
        };
        setIdeas([...ideas.filter(i => i.id !== idea1.id && i.id !== idea2.id), newIdea]);
        setActiveChatIdea(newIdea);
        setCombinePair([]);
      } catch (err) {
        toast({ variant: "destructive", title: "Combine Error", description: "Failed to combine ideas." });
      } finally {
        setIsLoading(false);
      }
    };
  
    const handleFinalize = (idea: any) => {
      setFinalizedIdea(idea);
      setIdeaGeneratorStep('finalized');
    };
  
    const handleIdeaRestart = () => {
      setIdeaGeneratorStep('input');
      setIdeas([]);
      setActiveChatIdea(null);
      setFinalizedIdea(null);
    };

    // AI Coder functions
    const handleCoderGenerate = async () => {
        setIsLoading(true);
        // This is where the call to the real AI flow will happen
        // For now, it's just a delay.
        // await simulateAICall(1500); 
        setIsLoading(false);
        setCoderStep('workbench');
    };
    
    const handleCoderGoBack = () => {
        setCoderStep('blueprint');
        setGeneratedCode(null);
    };

    // --- RENDER LOGIC --- //

    const renderMainContent = () => {
        if (activeView === null) {
            return <DefaultView />;
        }
        
        switch (activeView) {
            case 'tutor':
                return (
                    <AITutorView
                        chatHistory={chatHistory}
                        isLoading={isLoading}
                        userInput={userInput}
                        setUserInput={setUserInput}
                        handleTutorSubmit={handleTutorSubmit}
                        error={error}
                    />
                );
            case 'roadmap':
                return (
                    <AIRoadmapView
                        isLoading={isLoading}
                        roadmapContent={roadmapContent}
                        handleGenerateRoadmap={handleGenerateRoadmap}
                        error={error}
                    />
                );
            case 'mentor':
                 return (
                    <AIMentorView
                        chatHistory={chatHistory}
                        isLoading={isLoading}
                        userInput={userInput}
                        setUserInput={setUserInput}
                        handleTutorSubmit={handleTutorSubmit}
                        handleResumeUpload={handleResumeUpload}
                        resumeFileName={resumeFileName}
                        setResumeText={setResumeText}
                        setResumeFileName={setResumeFileName}
                        error={error}
                    />
                 );
            case 'content-generator':
                return (
                    <AIContentGeneratorView
                        step={contentGeneratorStep}
                        setStep={setContentGeneratorStep}
                        formData={contentFormData}
                        setFormData={setContentFormData}
                        isLoading={isLoading}
                        handleGenerateOutline={handleGenerateOutline}
                        handleGenerateDraft={handleGenerateDraft}
                        handleRefineContent={handleRefineContent}
                        handleStartOver={handleContentStartOver}
                    />
                );

            case 'idea-generator':
                return (
                    <AIIdeaGeneratorView
                        step={ideaGeneratorStep}
                        isLoading={isLoading}
                        ideas={ideas}
                        activeChatIdea={activeChatIdea}
                        combinePair={combinePair}
                        finalizedIdea={finalizedIdea}
                        dragOverId={dragOverId}
                        formData={ideaFormData}
                        setFormData={setIdeaFormData}
                        handleGenerateIdeas={handleGenerateIdeas}
                        handleAction={handleIdeaAction}
                        handleDragStart={handleDragStart}
                        handleDragEnd={handleDragEnd}
                        handleDrop={handleDrop}
                        setDragOverId={setDragOverId}
                        handleCombine={handleCombine}
                        setCombinePair={setCombinePair}
                        handleFinalize={handleFinalize}
                        handleRestart={handleIdeaRestart}
                    />
                );
            case 'coder':
                 return (
                    <AICoderView
                        step={coderStep}
                        isLoading={isLoading}
                        generatedCode={generatedCode}
                        setGeneratedCode={(code) => {
                            setGeneratedCode(code);
                            if (code) {
                                setIsLoading(false);
                                setCoderStep('workbench');
                            }
                        }}
                        chatHistory={coderChatHistory}
                        setCoderChatHistory={setCoderChatHistory}
                        formData={coderFormData}
                        setFormData={setCoderFormData}
                        onGenerate={() => setIsLoading(true)}
                        onGoBack={handleCoderGoBack}
                    />
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
                <NavItem icon={<BookOpen className="h-5 w-5" />} label="AI Tutor" subtext="Personalized learning" active={activeView === 'tutor'} onClick={() => handleViewChange('tutor')} />
                <NavItem icon={<Map className="h-5 w-5" />} label="AI Roadmap" subtext="Career pathing" active={activeView === 'roadmap'} onClick={() => handleViewChange('roadmap')} />
                <NavItem icon={<Users className="h-5 w-5" />} label="AI Mentor" subtext="Guidance and behavior" active={activeView === 'mentor'} onClick={() => handleViewChange('mentor')} />
                <NavItem icon={<FileText className="h-5 w-5" />} label="Content Generator" subtext="Generate text content" active={activeView === 'content-generator'} onClick={() => handleViewChange('content-generator')} />
                <NavItem icon={<Lightbulb className="h-5 w-5" />} label="Idea Generator" subtext="Brainstorm new ideas" active={activeView === 'idea-generator'} onClick={() => handleViewChange('idea-generator')} />
                <NavItem icon={<Code className="h-5 w-5" />} label="AI Coder" subtext="Coding Companion" active={activeView === 'coder'} onClick={() => handleViewChange('coder')} />
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
          <main className="lg:col-span-9">
            <div className="space-y-8">
              {renderMainContent()}
              {activeView === null && (
                <>
                  <StatsSection />
                  <RecommendedToolsSection />
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
