
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, MessageSquare, Star, ThumbsUp, Combine, Send, Trophy, Download, Copy, Sparkles, Zap, Users, Box, PlusSquare, Filter, ArrowLeft, FileText, Check, X } from 'lucide-react';
import type { IdeaGeneratorStep, IdeaWithState } from '@/app/page';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";


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

const IdeaCardNew = ({ idea, onAction, onSelectCombine, isSelectedForCombine, isCombineDisabled }: { idea: any, onAction: any, onSelectCombine: () => void, isSelectedForCombine: boolean, isCombineDisabled: boolean }) => (
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
            <div className="flex gap-2">
                <Button onClick={() => onAction('chat', idea.id)} variant="outline" className="w-full">Refine with AI</Button>
                <Button onClick={onSelectCombine} variant="outline" size="icon" disabled={isCombineDisabled && !isSelectedForCombine}>
                    {isSelectedForCombine ? <Check size={16} className="text-green-500" /> : <Combine size={16} />}
                </Button>
            </div>
        </div>
    </div>
);

const RefinementHub = ({ idea, onAction, onOpenChange, onFinalize }: { idea: any, onAction: any, onOpenChange: (open: boolean) => void, onFinalize: (idea: any) => void }) => {
    const [message, setMessage] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [idea.chatHistory]);

    const handleSend = () => {
        if (!message.trim()) return;
        onAction('message', idea.id, message);
        setMessage('');
    };

    return (
        <Dialog open={true} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl p-0">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="p-6 border-r">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">{idea.title}</DialogTitle>
                            <DialogDescription>{idea.shortDesc}</DialogDescription>
                        </DialogHeader>
                        <div className="mt-4">
                            <p className="text-gray-700 text-sm">{idea.longDesc}</p>
                        </div>
                        <Button onClick={() => { onFinalize(idea); onOpenChange(false); }} className="w-full mt-6 bg-green-500 hover:bg-green-600 flex items-center gap-2">
                            <Trophy size={16} /> Finalize This Idea
                        </Button>
                    </div>
                    <div className="p-6 flex flex-col">
                        <h4 className="font-semibold mb-2">Refinement Chat</h4>
                        <div ref={chatContainerRef} className="flex-grow bg-gray-50 h-80 rounded-lg p-3 overflow-y-auto text-sm space-y-3 mb-4">
                             {idea.chatHistory.map((chat: any, i: number) => (
                                <div key={i} className={`flex items-end gap-2 ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {chat.sender === 'ai' && <div className="bg-indigo-500 text-white rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0"><Lightbulb size={14}/></div> }
                                    <div className={`p-2 rounded-lg max-w-xs ${chat.sender === 'user' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-200 text-gray-800'}`}>{chat.text}</div>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Input value={message} onChange={e => setMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="Ask a question..." />
                            <Button onClick={handleSend} size="icon"><Send size={16} /></Button>
                        </div>
                    </div>
                </div>
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


const FinalizationView = ({ idea, onRestart }: { idea: any, onRestart: any }) => (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <Trophy size={48} className="mx-auto text-amber-400" />
        <h2 className="text-3xl font-bold text-gray-800 mt-2">Your idea has evolved!</h2>
        <div className="bg-gray-50 rounded-lg p-6 mt-6 text-left shadow-inner border">
            <h3 className="text-xl font-bold text-indigo-700">{idea.title}</h3>
            <p className="text-gray-600 mt-2">{idea.longDesc}</p>
            <div className="mt-4 border-t pt-4">
                <h4 className="font-semibold">Next Steps:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600">
                    <li>Draft a project brief and budget proposal.</li>
                    <li>Form a small team to flesh out logistics.</li>
                    <li>Survey potential attendees for interest.</li>
                </ul>
            </div>
            <div className="mt-4">
                <h4 className="font-semibold">Mood Board:</h4>
                <div className="flex gap-2 text-2xl mt-1">🌳 💻 🤝 🏆 🌎</div>
            </div>
        </div>
        <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1"><Download size={16} /> Download PDF</Button>
            <Button variant="outline" className="flex-1"><Copy size={16} /> Copy to Notion</Button>
        </div>
        <button onClick={onRestart} className="mt-4 text-indigo-600 font-semibold hover:underline">Start a New Brainstorm</button>
    </motion.div>
);


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
    
    // New state for the combine feature
    const [selectedToCombine, setSelectedToCombine] = useState<number[]>([]);

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
                            <button onClick={handleRestart} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 font-medium"><ArrowLeft size={16} /> New Brainstorm</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {ideas.map(idea => (
                                <IdeaCardNew 
                                    key={idea.id}
                                    idea={idea}
                                    onAction={handleAction}
                                    onSelectCombine={() => handleSelectCombine(idea.id)}
                                    isSelectedForCombine={selectedToCombine.includes(idea.id)}
                                    isCombineDisabled={selectedToCombine.length >= 2}
                                />
                            ))}
                        </div>

                        <AnimatePresence>
                          {activeChatIdea && (
                              <RefinementHub 
                                  idea={activeChatIdea}
                                  onAction={handleAction}
                                  onOpenChange={(open) => { if (!open) handleAction('closeChat', activeChatIdea.id); }}
                                  onFinalize={handleFinalize}
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

    