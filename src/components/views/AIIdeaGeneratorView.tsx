
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, MessageSquare, Star, ThumbsUp, Combine, Send, Trophy, Download, Copy, Sparkles, Zap, Users, Box, PlusSquare, Filter, ArrowLeft, FileText, Check, X, ChevronsRight, AlertTriangle, ListOrdered, Loader, Target, HandCoins, Package, ShieldQuestion, Briefcase, TrendingUp } from 'lucide-react';
import type { IdeaGeneratorStep, IdeaWithState } from '@/app/page';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { expandIdea } from '@/ai/flows/expand-idea-flow';
import { chatWithIdea } from '@/ai/flows/chat-with-idea-flow';
import type { ExpandIdeaOutput } from '@/ai/schemas/idea-generation-schemas';
import { useToast } from "@/hooks/use-toast";


interface AIIdeaGeneratorViewProps {
    step: IdeaGeneratorStep;
    isLoading: boolean;
    ideas: IdeaWithState[];
    activeChatIdea: IdeaWithState | null;
    combinePair: IdeaWithState[];
    finalizedIdea: any;
    dragOverId: number | null; // This will be deprecated by the new UI but kept for compatibility
    formData: any;
    setFormData: (formData: any) => void;
    handleGenerateIdeas: () => void;
    handleAction: (action: string, id: number, data?: any) => void;
    // Drag and drop is being replaced, but we'll keep the props for now
    handleDragStart: (e: React.DragEvent, id: number) => void;
    handleDragEnd: () => void;
    handleDrop: (e: React.DragEvent, targetId: number) => void;
    setDragOverId: (id: number | null) => void;
    handleCombine: () => void;
    setCombinePair: (pair: any[]) => void;
    handleFinalize: (idea: any) => void;
    handleRestart: () => void;
}

// --- NEW UI COMPONENTS ---
const ExpandedDetailCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="bg-gray-50/50 p-4 rounded-lg border">
        <h4 className="font-semibold text-md flex items-center gap-3 mb-2">{icon} {title}</h4>
        <div className="text-sm text-gray-600 space-y-2">
            {children}
        </div>
    </div>
);

const RefinementHub = ({ idea, onOpenChange, onSendMessage, onFinalize }: { idea: IdeaWithState, onOpenChange: (open: boolean) => void, onSendMessage: (message: string) => void, onFinalize: () => void }) => {
    const [message, setMessage] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [idea.chatHistory]);
    
    const handleSend = () => {
        if (!message.trim()) return;
        onSendMessage(message);
        setMessage('');
    };

    if (!idea.expandedData) {
        return (
             <Dialog open={true} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Loading...</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center h-48">
                        <Loader className="animate-spin text-indigo-500" size={32} />
                        <p className="ml-4 text-gray-500">Expanding idea details...</p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }
    
    const { expandedIdea } = idea.expandedData;

    return (
        <Dialog open={true} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-indigo-700">Refine: {idea.title}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow overflow-hidden">
                    {/* Left Panel: Expanded Idea */}
                    <div className="h-full overflow-y-auto pr-4 space-y-4">
                        <p className="text-base mb-4 whitespace-pre-wrap">{expandedIdea.mainDescription}</p>
                        <ExpandedDetailCard icon={<Briefcase size={18} className="text-blue-500"/>} title="Core Features & Benefits">
                            <ul className="list-disc pl-5 space-y-1">{expandedIdea.coreFeatures.points.map((point, i) => <li key={i}>{point}</li>)}</ul>
                            <p className="pt-2">{expandedIdea.coreFeatures.summary}</p>
                        </ExpandedDetailCard>
                        <ExpandedDetailCard icon={<Target size={18} className="text-red-500"/>} title="Target Audience & Market Fit"><p className="whitespace-pre-wrap">{expandedIdea.targetAudience.description}</p></ExpandedDetailCard>
                        <ExpandedDetailCard icon={<ListOrdered size={18} className="text-green-500"/>} title="Implementation Roadmap"><ul className="list-disc pl-5 space-y-1">{expandedIdea.implementationRoadmap.steps.map((step, i) => <li key={i}>{step}</li>)}</ul></ExpandedDetailCard>
                        <ExpandedDetailCard icon={<HandCoins size={18} className="text-teal-500"/>} title="Monetization & Sustainability"><ul className="list-disc pl-5 space-y-1">{expandedIdea.monetization.points.map((point, i) => <li key={i}>{point}</li>)}</ul></ExpandedDetailCard>
                        <ExpandedDetailCard icon={<ShieldQuestion size={18} className="text-amber-500"/>} title="Potential Challenges & Mitigation"><ul className="list-disc pl-5 space-y-1">{expandedIdea.challenges.points.map((point, i) => <li key={i}>{point}</li>)}</ul></ExpandedDetailCard>
                        <ExpandedDetailCard icon={<TrendingUp size={18} className="text-purple-500"/>} title="Growth & Innovation Opportunities"><ul className="list-disc pl-5 space-y-1">{expandedIdea.growthOpportunities.points.map((point, i) => <li key={i}>{point}</li>)}</ul></ExpandedDetailCard>
                    </div>

                    {/* Right Panel: Chat */}
                    <div className="h-full flex flex-col bg-gray-50 rounded-lg border">
                        <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto text-sm space-y-3">
                             {idea.chatHistory.map((chat: any, i: number) => (
                                <div key={i} className={`flex items-start gap-2 ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {chat.sender === 'ai' && <div className="bg-indigo-500 text-white rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0"><Lightbulb size={14}/></div> }
                                    <div className={`p-2 rounded-lg max-w-[80%] ${chat.sender === 'user' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-200 text-gray-800'}`}>{chat.text}</div>
                                </div>
                            ))}
                             {isLoading && idea.chatHistory.length > 0 && idea.chatHistory[idea.chatHistory.length - 1].sender === 'user' && (
                                <div className="flex items-start gap-2 justify-start">
                                    <div className="bg-indigo-500 text-white rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0"><Loader size={14} className="animate-spin" /></div>
                                    <div className="p-2 rounded-lg bg-gray-200 text-gray-400">Thinking...</div>
                                </div>
                            )}
                        </div>
                         <div className="p-4 border-t bg-white">
                            <div className="flex gap-2">
                                <Input value={message} onChange={e => setMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="Discuss this idea..." disabled={isLoading} />
                                <Button onClick={handleSend} size="icon" disabled={isLoading}><Send size={16} /></Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};


const IdeaCardNew = ({ idea, onAction, onSelectCombine, isSelectedForCombine, isCombineDisabled, onExpand, onFinalize, isLoading }: { idea: any, onAction: any, onSelectCombine: () => void, isSelectedForCombine: boolean, isCombineDisabled: boolean, onExpand: (idea: any) => void, onFinalize: (idea: any) => void, isLoading: boolean }) => (
    <div className={`bg-white border rounded-xl p-4 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1 ${isSelectedForCombine ? 'ring-2 ring-indigo-500' : ''}`}>
        <div>
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-800 text-md w-5/6">{idea.title}</h3>
                <button onClick={() => onAction('favorite', idea.id)} className="text-gray-400 hover:text-amber-500 transition-colors">
                    <Star size={18} className={`transition-all ${idea.isFavorited ? "text-amber-400 fill-current" : ""}`} />
                </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">{idea.shortDesc}</p>
            <ul className="space-y-1.5 text-sm list-disc list-inside text-gray-500 mb-4">
                {idea.previewPoints.map((point: string, i: number) => <li key={i}>{point}</li>)}
            </ul>
        </div>
        <div>
            <div className="flex items-center justify-between mb-3">
                <div className="flex gap-1.5 flex-wrap">
                    {idea.tags.map((tag: string) => <span key={tag} className="font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{tag}</span>)}
                </div>
                <button onClick={() => onAction('like', idea.id)} className="flex items-center gap-1.5 text-gray-500 font-semibold hover:text-indigo-600 transition-colors">
                    <ThumbsUp size={14} className={idea.likes > 0 ? 'text-indigo-600' : ''} /> {idea.likes}
                </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => onAction('refine', idea.id)} variant="outline" className="w-full">Refine with AI</Button>
                <Button onClick={() => onExpand(idea)} variant="outline" className="w-full">Expand</Button>
                <Button onClick={onSelectCombine} variant="outline" disabled={isCombineDisabled && !isSelectedForCombine}>
                    {isSelectedForCombine ? <Check size={16} className="text-green-500" /> : <Combine size={16} />} Combine
                </Button>
                 <Button onClick={() => onFinalize(idea)} variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800">
                    <Trophy size={16} /> Finalize
                </Button>
            </div>
        </div>
    </div>
);

const ExpandedIdeaView = ({ result, onOpenChange }: { result: ExpandIdeaOutput, onOpenChange: (open: boolean) => void }) => {
    const { title, expandedIdea } = result;

    return (
        <Dialog open={true} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-indigo-700">{title}</DialogTitle>
                </DialogHeader>
                <div className="mt-4 text-gray-700 space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                    {expandedIdea.mainDescription && <p className="text-base mb-4 whitespace-pre-wrap">{expandedIdea.mainDescription}</p>}

                    <ExpandedDetailCard icon={<Briefcase size={18} className="text-blue-500"/>} title="Core Features & Benefits">
                        <ul className="list-disc pl-5 space-y-1">
                            {expandedIdea.coreFeatures.points.map((point, i) => <li key={i}>{point}</li>)}
                        </ul>
                        <p className="pt-2">{expandedIdea.coreFeatures.summary}</p>
                    </ExpandedDetailCard>
                    
                    <ExpandedDetailCard icon={<Target size={18} className="text-red-500"/>} title="Target Audience & Market Fit">
                        <p className="whitespace-pre-wrap">{expandedIdea.targetAudience.description}</p>
                    </ExpandedDetailCard>

                    <ExpandedDetailCard icon={<ListOrdered size={18} className="text-green-500"/>} title="Implementation Roadmap">
                        <ul className="list-disc pl-5 space-y-1">
                            {expandedIdea.implementationRoadmap.steps.map((step, i) => <li key={i}>{step}</li>)}
                        </ul>
                    </ExpandedDetailCard>

                    <ExpandedDetailCard icon={<HandCoins size={18} className="text-teal-500"/>} title="Monetization & Sustainability">
                         <ul className="list-disc pl-5 space-y-1">
                            {expandedIdea.monetization.points.map((point, i) => <li key={i}>{point}</li>)}
                        </ul>
                    </ExpandedDetailCard>

                    <ExpandedDetailCard icon={<ShieldQuestion size={18} className="text-amber-500"/>} title="Potential Challenges & Mitigation">
                         <ul className="list-disc pl-5 space-y-1">
                            {expandedIdea.challenges.points.map((point, i) => <li key={i}>{point}</li>)}
                        </ul>
                    </ExpandedDetailCard>
                    
                    <ExpandedDetailCard icon={<TrendingUp size={18} className="text-purple-500"/>} title="Growth & Innovation Opportunities">
                        <ul className="list-disc pl-5 space-y-1">
                            {expandedIdea.growthOpportunities.points.map((point, i) => <li key={i}>{point}</li>)}
                        </ul>
                    </ExpandedDetailCard>
                </div>
                 <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const CombineDialog = ({ pair, onCombine, onCancel, isLoading }: { pair: any[], onCombine: any, onCancel: any, isLoading: boolean }) => (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="text-2xl text-center">Combine Ideas?</DialogTitle>
                <DialogDescription className="text-center">This will merge the core concepts of both ideas into a new, single idea.</DialogDescription>
            </DialogHeader>
            <div className="flex gap-4 my-4">
                <div className="flex-1 bg-gray-100 p-4 rounded-lg border">
                    <h3 className="font-bold text-sm">{pair[0].title}</h3>
                </div>
                <div className="flex items-center"><Combine size={24} className="text-indigo-500" /></div>
                <div className="flex-1 bg-gray-100 p-4 rounded-lg border">
                    <h3 className="font-bold text-sm">{pair[1].title}</h3>
                </div>
            </div>
            <DialogFooter>
                <Button onClick={onCancel} variant="ghost">Cancel</Button>
                <Button onClick={onCombine} disabled={isLoading}>
                    {isLoading ? 'Combining...' : 'Create Hybrid Idea'}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);


const FinalizationView = ({ idea, onRestart }: { idea: any, onRestart: any }) => {
    if (!idea || !idea.expandedData) {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <AlertTriangle size={48} className="mx-auto text-amber-400" />
                <h2 className="text-3xl font-bold text-gray-800 mt-2">Could Not Finalize Idea</h2>
                <p className="text-gray-600 mt-2">The idea has not been expanded yet. Please expand the idea before finalizing.</p>
                <Button onClick={onRestart} className="mt-4">Back to Brainstorm</Button>
            </motion.div>
        );
    }
    
    const { expandedIdea } = idea.expandedData;
    
    return (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <Trophy size={48} className="mx-auto text-amber-400" />
            <h2 className="text-3xl font-bold text-gray-800 mt-2">Your idea has evolved!</h2>
            <div className="bg-gray-50 rounded-lg p-6 mt-6 text-left shadow-inner border max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold text-indigo-700">{idea.title}</h3>
                <p className="text-gray-700 mt-3 whitespace-pre-wrap">{expandedIdea.mainDescription}</p>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ExpandedDetailCard icon={<Briefcase size={18} className="text-blue-500"/>} title="Core Features & Benefits">
                        <ul className="list-disc pl-5 space-y-1">{expandedIdea.coreFeatures.points.map((point, i) => <li key={i}>{point}</li>)}</ul>
                        <p className="pt-2">{expandedIdea.coreFeatures.summary}</p>
                    </ExpandedDetailCard>
                    <ExpandedDetailCard icon={<Target size={18} className="text-red-500"/>} title="Target Audience & Market Fit"><p className="whitespace-pre-wrap">{expandedIdea.targetAudience.description}</p></ExpandedDetailCard>
                    <ExpandedDetailCard icon={<ListOrdered size={18} className="text-green-500"/>} title="Implementation Roadmap"><ul className="list-disc pl-5 space-y-1">{expandedIdea.implementationRoadmap.steps.map((step, i) => <li key={i}>{step}</li>)}</ul></ExpandedDetailCard>
                    <ExpandedDetailCard icon={<HandCoins size={18} className="text-teal-500"/>} title="Monetization & Sustainability"><ul className="list-disc pl-5 space-y-1">{expandedIdea.monetization.points.map((point, i) => <li key={i}>{point}</li>)}</ul></ExpandedDetailCard>
                </div>
            </div>
            <div className="flex gap-3 mt-8 max-w-sm mx-auto">
                <Button variant="outline" className="flex-1"><Download size={16} /> Download as PDF</Button>
                <Button variant="outline" className="flex-1"><Copy size={16} /> Copy to Notion</Button>
            </div>
            <button onClick={onRestart} className="mt-4 text-indigo-600 font-semibold hover:underline">Start a New Brainstorm</button>
        </motion.div>
    );
};


const AIIdeaGeneratorView: React.FC<AIIdeaGeneratorViewProps> = ({
    step,
    isLoading,
    ideas,
    activeChatIdea,
    combinePair,
    finalizedIdea,
    formData,
    setFormData,
    handleGenerateIdeas,
    handleAction,
    handleCombine,
    setCombinePair,
    handleFinalize,
    handleRestart,
}) => {
    const { toast } = useToast();
    const [selectedToCombine, setSelectedToCombine] = useState<number[]>([]);
    const [activeRefineIdea, setActiveRefineIdea] = useState<IdeaWithState | null>(null);
    const [activeExpandIdea, setActiveExpandIdea] = useState<IdeaWithState | null>(null);

    useEffect(() => {
        if (selectedToCombine.length === 2) {
            const idea1 = ideas.find(i => i.id === selectedToCombine[0]);
            const idea2 = ideas.find(i => i.id === selectedToCombine[1]);
            if (idea1 && idea2) {
                setCombinePair([idea1, idea2]);
            }
        } else {
            setCombinePair([]);
        }
    }, [selectedToCombine, ideas, setCombinePair]);

    const handleSelectCombine = (id: number) => {
        setSelectedToCombine(prev => {
            if (prev.includes(id)) {
                return prev.filter(i => i !== id);
            }
            if (prev.length < 2) {
                return [...prev, id];
            }
            return prev;
        });
    };

    const handleInternalCombine = () => {
        handleCombine(); // Call parent combine logic
        setSelectedToCombine([]); // Reset selection
    };

    const handleCancelCombine = () => {
        setCombinePair([]);
        setSelectedToCombine([]);
    };
    
    const handleExpand = (idea: IdeaWithState) => {
        if (!idea.expandedData) {
            handleAction('expand', idea.id);
        }
        setActiveExpandIdea(idea);
    };
    
    const handleRefineClick = (idea: IdeaWithState) => {
        if (!idea.expandedData) {
            handleAction('expand', idea.id); // Also expand on refine
        }
        setActiveRefineIdea(idea);
    };

    const handleFinalizeClick = (idea: IdeaWithState) => {
        if (!idea.expandedData) {
            handleAction('expand', idea.id);
        }
        handleFinalize(idea);
    };

    // This effect will open the refinement hub once the data is loaded
    useEffect(() => {
        if (activeChatIdea?.expandedData && activeRefineIdea && activeChatIdea.id === activeRefineIdea.id) {
            setActiveRefineIdea(activeChatIdea);
        }
        if (activeChatIdea?.expandedData && activeExpandIdea && activeChatIdea.id === activeExpandIdea.id) {
            setActiveExpandIdea(activeChatIdea);
        }
    }, [activeChatIdea, activeRefineIdea, activeExpandIdea]);


    const handleSendMessageInHub = (message: string) => {
        if(activeRefineIdea) {
            handleAction('message', activeRefineIdea.id, message);
        }
    };

    // This updates the activeRefineIdea with the latest from the ideas array,
    // which is necessary because the chat history is updated in the parent state.
    useEffect(() => {
        if (activeRefineIdea) {
            const updatedIdea = ideas.find(i => i.id === activeRefineIdea.id);
            if (updatedIdea) {
                setActiveRefineIdea(updatedIdea);
            }
        }
    }, [ideas, activeRefineIdea]);

    const renderContent = () => {
        switch (step) {
            case 'input':
                return (
                    <div className="animate-fade-in">
                        <div className="flex items-center gap-3 mb-2"><div className="bg-purple-100 text-purple-600 p-2 rounded-lg"><Lightbulb size={20} /></div><h2 className="text-2xl font-bold text-gray-800">Brainstorming Brief</h2></div>
                        <p className="text-gray-500 mb-6">Define your challenge and let the AI brainstorm creative solutions.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div><label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1"><Zap size={14} /> Core Subject</label><Input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} /></div>
                            <div><label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1"><Users size={14} /> Target Audience</label><Input type="text" value={formData.audience} onChange={(e) => setFormData({ ...formData, audience: e.target.value })} /></div>
                            <div><label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1"><Box size={14} /> Key Constraints</label><Input type="text" value={formData.constraints} onChange={(e) => setFormData({ ...formData, constraints: e.target.value })} /></div>
                            <div><label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1"><PlusSquare size={14} /> Other Criteria</label><Input type="text" value={formData.other} onChange={(e) => setFormData({ ...formData, other: e.target.value })} /></div>

                            <div className="md:col-span-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                    <FileText size={14} /> Describe Your Idea in Detail (Optional)
                                </label>
                                <Textarea
                                    value={formData.detailedDescription}
                                    onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
                                    rows={4}
                                    placeholder="Provide any additional context, background, or specific thoughts you have about the idea..."
                                />
                            </div>

                            <div className="md:col-span-2"><label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1"><Filter size={14} /> Creativity Lens</label>
                                <select value={formData.lens} onChange={(e) => setFormData({ ...formData, lens: e.target.value })} className="w-full p-2 border border-input rounded-lg bg-background">
                                    <option>What If? (Expansive)</option>
                                    <option>Problem/Solution (Focused)</option>
                                    <option>Analogous (Borrowing)</option>
                                    <option>The Minimalist (Simplifying)</option>
                                </select>
                            </div>
                        </div>
                        <Button onClick={handleGenerateIdeas} disabled={isLoading} className="w-full mt-8 bg-purple-600 hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:bg-purple-300">{isLoading ? <div className="animate-spin"><Sparkles size={20} /></div> : <Sparkles size={20} />}{isLoading ? 'Generating...' : 'Generate Ideas'}</Button>
                    </div>
                );
            case 'results':
                return (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">Ideation Workspace</h2>
                                <p className="text-gray-500 text-sm">Refine, combine, and finalize your new ideas.</p>
                            </div>
                             <div className="flex items-center gap-2">
                                {isLoading && activeChatIdea && !activeRefineIdea && !activeExpandIdea && <div className="flex items-center gap-2 text-sm text-gray-500"><Loader size={16} className="animate-spin"/> Expanding...</div>}
                                <button onClick={handleRestart} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 font-medium"><ArrowLeft size={16} /> New Brainstorm</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {ideas.map(idea => (
                                <IdeaCardNew 
                                    key={idea.id}
                                    idea={idea}
                                    onAction={(action, id, data) => {
                                        if (action === 'refine') handleRefineClick(idea);
                                        else handleAction(action, id, data);
                                    }}
                                    onExpand={() => handleExpand(idea)}
                                    onSelectCombine={() => handleSelectCombine(idea.id)}
                                    isSelectedForCombine={selectedToCombine.includes(idea.id)}
                                    isCombineDisabled={selectedToCombine.length >= 2}
                                    onFinalize={() => handleFinalizeClick(idea)}
                                    isLoading={isLoading && activeChatIdea?.id === idea.id && !activeRefineIdea}
                                />
                            ))}
                        </div>
                        
                        <AnimatePresence>
                           {activeExpandIdea && activeExpandIdea.expandedData && (
                                <ExpandedIdeaView result={activeExpandIdea.expandedData} onOpenChange={(open) => {
                                    if (!open) {
                                        setActiveExpandIdea(null);
                                        handleAction('closeExpand', activeExpandIdea.id)
                                    }
                                }} />
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                           {activeRefineIdea && (
                                <RefinementHub
                                    idea={activeRefineIdea}
                                    onOpenChange={(open) => {
                                        if (!open) {
                                            setActiveRefineIdea(null);
                                            handleAction('closeExpand', activeRefineIdea.id)
                                        }
                                    }}
                                    onSendMessage={handleSendMessageInHub}
                                    onFinalize={() => handleFinalize(activeRefineIdea)}
                                />
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                          {combinePair.length === 2 && (
                              <CombineDialog
                                  pair={combinePair}
                                  onCombine={handleInternalCombine}
                                  onCancel={handleCancelCombine}
                                  isLoading={isLoading}
                              />
                          )}
                        </AnimatePresence>
                    </div>
                );
            case 'finalized':
                return <FinalizationView idea={finalizedIdea} onRestart={handleRestart} />;
            default: return null;
        }
    };
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
                <div className="w-full transition-all duration-500">
                    {renderContent()}
                </div>
            </CardContent>
        </Card>
    );
};

export default AIIdeaGeneratorView;
