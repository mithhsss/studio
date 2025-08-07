
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, MessageSquare, Star, ThumbsUp, Combine, Send, Trophy, Download, Copy, Sparkles, Zap, Users, Box, PlusSquare, Filter, ArrowLeft, FileText } from 'lucide-react';
import type { IdeaGeneratorStep, IdeaWithState } from '@/app/page';

interface AIIdeaGeneratorViewProps {
    step: IdeaGeneratorStep;
    isLoading: boolean;
    ideas: IdeaWithState[];
    activeChatIdea: IdeaWithState | null;
    combinePair: IdeaWithState[];
    finalizedIdea: any;
    dragOverId: number | null;
    formData: any;
    setFormData: (formData: any) => void;
    handleGenerateIdeas: () => void;
    handleAction: (action: string, id: number, data?: any) => void;
    handleDragStart: (e: React.DragEvent, id: number) => void;
    handleDragEnd: () => void;
    handleDrop: (e: React.DragEvent, targetId: number) => void;
    setDragOverId: (id: number | null) => void;
    handleCombine: () => void;
    setCombinePair: (pair: any[]) => void;
    handleFinalize: (idea: any) => void;
    handleRestart: () => void;
}

const IdeaCard = ({ idea, onAction, onDragStart, onDragEnd, isDraggedOver }: { idea: any, onAction: any, onDragStart: any, onDragEnd: any, isDraggedOver: boolean }) => {
    const [showPreview, setShowPreview] = useState(false);
    return (
        <motion.div
            draggable
            onDragStart={(e) => onDragStart(e, idea.id)}
            onDragEnd={onDragEnd}
            layoutId={`card-${idea.id}`}
            className={`bg-white border rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing transition-all duration-200 ${isDraggedOver ? 'ring-2 ring-indigo-400' : 'border-gray-200'}`}
            onMouseEnter={() => setShowPreview(true)}
            onMouseLeave={() => setShowPreview(false)}
        >
            <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-800 text-sm w-5/6">{idea.title}</h3>
                <button onClick={() => onAction('favorite', idea.id)} className="text-gray-300 hover:text-amber-400">
                    <Star size={16} className={idea.isFavorited ? "text-amber-400 fill-current" : ""} />
                </button>
            </div>
            <AnimatePresence>
                {showPreview && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-2 text-xs">
                        <ul className="space-y-1 list-disc list-inside text-gray-600">
                            {idea.previewPoints.map((point: string, i: number) => <li key={i}>{point}</li>)}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="flex items-center justify-between mt-3 text-xs">
                <div className="flex gap-1.5 flex-wrap">
                    {idea.tags.map((tag: string) => <span key={tag} className="font-medium bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-full">{tag}</span>)}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => onAction('like', idea.id)} className="flex items-center gap-1 text-gray-500 font-semibold hover:text-indigo-600">
                        <ThumbsUp size={14} className={idea.likes > 0 ? 'text-indigo-600' : ''} /> {idea.likes}
                    </button>
                    <button onClick={() => onAction('chat', idea.id)} className="flex items-center gap-1 text-indigo-600 font-semibold hover:text-indigo-800">
                        Chat <MessageSquare size={14} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const ChatWorkspace = ({ idea, onAction, onFinalize }: { idea: any, onAction: any, onFinalize: any }) => {
    const [message, setMessage] = useState('');
    const handleSend = () => {
        if (!message.trim()) return;
        onAction('message', idea.id, message);
        setMessage('');
    };
    return (
        <motion.div layoutId={`card-${idea.id}`} className="bg-white border-2 border-indigo-500 rounded-lg p-4 shadow-lg">
            <h3 className="font-bold text-gray-800 text-lg">{idea.title}</h3>
            <p className="text-sm text-gray-600 mt-2 mb-4">{idea.longDesc}</p>
            <div className="bg-gray-50 h-48 rounded p-2 overflow-y-auto text-sm space-y-2">
                {idea.chatHistory.map((chat: any, i: number) => (
                    <div key={i} className={`p-2 rounded-lg ${chat.sender === 'user' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-200 text-gray-800'}`}>{chat.text}</div>
                ))}
            </div>
            <div className="flex gap-2 mt-2">
                <Input type="text" value={message} onChange={e => setMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="Ask a question..." className="flex-grow p-2 border rounded-md text-sm" />
                <Button onClick={handleSend} className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700"><Send size={16} /></Button>
            </div>
            <Button onClick={() => onFinalize(idea)} className="w-full mt-3 bg-green-500 text-white font-bold py-2 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2">
                <Trophy size={16} /> Finalize This Idea
            </Button>
        </motion.div>
    );
};

const CombineView = ({ idea1, idea2, onCombine, onCancel, isLoading }: { idea1: any, idea2: any, onCombine: any, onCancel: any, isLoading: boolean }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-2xl text-center shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800">Combine Ideas</h2>
            <div className="flex gap-4 my-4">
                <div className="flex-1 bg-gray-50 p-3 rounded-lg">
                    <h3 className="font-bold">{idea1.title}</h3>
                    <p className="text-xs text-gray-600 mt-1">{idea1.shortDesc}</p>
                </div>
                <div className="flex items-center"><Combine size={24} className="text-indigo-500" /></div>
                <div className="flex-1 bg-gray-50 p-3 rounded-lg">
                    <h3 className="font-bold">{idea2.title}</h3>
                    <p className="text-xs text-gray-600 mt-1">{idea2.shortDesc}</p>
                </div>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-semibold text-indigo-800">Blended Concept:</h4>
                <p className="text-sm text-indigo-700 mt-1">Combine these ideas to create a new, hybrid concept. The AI will synthesize the best elements of both.</p>
            </div>
            <div className="flex gap-3 mt-6">
                <Button onClick={onCancel} variant="outline" className="flex-1">Cancel</Button>
                <Button onClick={onCombine} disabled={isLoading} className="flex-1">
                    {isLoading ? 'Combining...' : 'Send to Chat'}
                </Button>
            </div>
        </div>
    </motion.div>
);

const FinalizationView = ({ idea, onRestart }: { idea: any, onRestart: any }) => (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <Trophy size={48} className="mx-auto text-amber-400" />
        <h2 className="text-3xl font-bold text-gray-800 mt-2">Your idea has evolved!</h2>
        <div className="bg-gray-50 rounded-lg p-6 mt-6 text-left shadow-inner">
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
    dragOverId,
    formData,
    setFormData,
    handleGenerateIdeas,
    handleAction,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    setDragOverId,
    handleCombine,
    setCombinePair,
    handleFinalize,
    handleRestart,
}) => {
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
                            <h2 className="text-2xl font-bold text-gray-800">Ideation Workspace</h2>
                            <button onClick={handleRestart} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 font-medium"><ArrowLeft size={16} /> New Brainstorm</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-100 rounded-lg p-3">
                                <h3 className="font-semibold text-gray-700 mb-3 px-1 flex items-center gap-2">💡 Ideas <span className="text-xs bg-gray-300 text-gray-600 rounded-full px-2">{ideas.filter(i => i.column === 'ideas').length}</span></h3>
                                <div className="space-y-3">
                                    {ideas.filter(i => i.column === 'ideas').map(idea =>
                                        <div
                                            key={idea.id}
                                            onDrop={(e) => handleDrop(e, idea.id)}
                                            onDragOver={(e) => { e.preventDefault(); setDragOverId(idea.id); }}
                                            onDragLeave={() => setDragOverId(null)}
                                        >
                                            <IdeaCard
                                                idea={idea}
                                                onAction={handleAction}
                                                onDragStart={handleDragStart}
                                                onDragEnd={handleDragEnd}
                                                isDraggedOver={dragOverId === idea.id}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="bg-gray-100 rounded-lg p-3">
                                <h3 className="font-semibold text-gray-700 mb-3 px-1 flex items-center gap-2">💬 Chat with Idea</h3>
                                {activeChatIdea ? <ChatWorkspace idea={activeChatIdea} onAction={handleAction} onFinalize={handleFinalize} /> : <div className="text-center text-sm text-gray-500 p-10">Send an idea here to start chatting!</div>}
                            </div>
                        </div>
                        <AnimatePresence>{combinePair.length === 2 && <CombineView idea1={combinePair[0]} idea2={combinePair[1]} onCombine={handleCombine} onCancel={() => setCombinePair([])} isLoading={isLoading} />}</AnimatePresence>
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
