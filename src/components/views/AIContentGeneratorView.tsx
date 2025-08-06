import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileText, Lightbulb, PenTool, ArrowLeft, Loader, Sparkles, Wind, Hash } from 'lucide-react';
import type { ContentGeneratorStep, ContentFormData } from '@/app/page';

interface AIContentGeneratorViewProps {
    step: ContentGeneratorStep;
    setStep: (step: ContentGeneratorStep) => void;
    formData: ContentFormData;
    setFormData: (formData: ContentFormData) => void;
    isLoading: boolean;
    handleGenerateOutline: () => void;
    handleGenerateDraft: () => void;
    handleRefineContent: (command: string) => void;
    handleStartOver: () => void;
}

const AIContentGeneratorView: React.FC<AIContentGeneratorViewProps> = ({
    step,
    setStep,
    formData,
    setFormData,
    isLoading,
    handleGenerateOutline,
    handleGenerateDraft,
    handleRefineContent,
    handleStartOver,
}) => {

    const renderStepContent = () => {
        switch (step) {
            case 'idea':
                return (
                    <div className="animate-fade-in">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
                                <Lightbulb size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Step 1: The Spark</h2>
                        </div>
                        <p className="text-gray-500 mb-6">Start with the core idea and the primary goal of your content.</p>

                        <div className="space-y-5">
                            <div>
                                <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">What's the core topic or question?</label>
                                <Textarea
                                    id="topic"
                                    name="topic"
                                    value={formData.topic}
                                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                    placeholder="e.g., The future of AI in UX Design"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-1">What is the primary goal?</label>
                                <select
                                    id="goal"
                                    name="goal"
                                    value={formData.goal}
                                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                                    className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring bg-background"
                                >
                                    <option>Educate an audience</option>
                                    <option>Start a discussion</option>
                                    <option>Announce a product/feature</option>
                                    <option>Share a personal experience</option>
                                </select>
                            </div>
                        </div>

                        <Button
                            onClick={handleGenerateOutline}
                            disabled={isLoading}
                            className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
                        >
                            {isLoading ? <Loader className="animate-spin" /> : <Sparkles />}
                            {isLoading ? 'Generating...' : 'Generate Outline'}
                        </Button>
                    </div>
                );
            case 'outline':
                if (!formData.outline) return null;
                const handlePointChange = (index: number, value: string) => {
                    if (!formData.outline) return;
                    const newPoints = [...formData.outline.mainPoints];
                    newPoints[index] = value;
                    setFormData({ ...formData, outline: { ...formData.outline, mainPoints: newPoints } });
                };

                return (
                    <div className="animate-fade-in">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 text-blue-600 p-2 rounded-lg"><FileText size={20} /></div>
                                <h2 className="text-2xl font-bold text-gray-800">Step 2: The Blueprint</h2>
                            </div>
                            <Button onClick={() => setStep('idea')} variant="ghost" size="sm"><ArrowLeft size={16} /> Back</Button>
                        </div>
                        <p className="text-gray-500 mb-6">Review and edit the AI-generated outline. This structure will guide the final draft.</p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title Suggestion</label>
                                <Input value={formData.outline.title} onChange={(e) => setFormData({ ...formData, outline: { ...formData.outline!, title: e.target.value } })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hook Suggestion</label>
                                <Textarea value={formData.outline.hook} onChange={(e) => setFormData({ ...formData, outline: { ...formData.outline!, hook: e.target.value } })} rows={3} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Main Points (Editable)</label>
                                <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                                    {formData.outline.mainPoints.map((point, index) => (
                                        <Input key={index} value={point} onChange={(e) => handlePointChange(index, e.target.value)} />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Call to Action (CTA)</label>
                                <Input value={formData.outline.cta} onChange={(e) => setFormData({ ...formData, outline: { ...formData.outline!, cta: e.target.value } })} />
                            </div>
                        </div>
                        <Button onClick={handleGenerateDraft} disabled={isLoading} className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
                            {isLoading ? <Loader className="animate-spin" /> : <PenTool />}
                            {isLoading ? 'Drafting...' : 'Generate Full Draft'}
                        </Button>
                    </div>
                );
            case 'draft':
                return (
                    <div className="animate-fade-in">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-100 text-green-600 p-2 rounded-lg"><PenTool size={20} /></div>
                                <h2 className="text-2xl font-bold text-gray-800">Step 3: The Polish</h2>
                            </div>
                            <Button onClick={handleStartOver} variant="ghost">Start Over</Button>
                        </div>
                        <p className="text-gray-500 mb-6">Here's your draft. Use the tools to refine it, or copy the text and you're done!</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <Textarea className="w-full h-96 bg-gray-50 font-mono text-sm leading-relaxed" value={formData.draft} onChange={(e) => setFormData({...formData, draft: e.target.value})} />
                            </div>
                            <div className="md:col-span-1 space-y-3">
                                <h3 className="font-bold text-lg text-gray-800">Refinement Tools</h3>
                                <Button onClick={() => handleRefineContent('Change the tone to be more casual and friendly.')} variant="outline" className="w-full justify-start" disabled={isLoading}><Wind size={18} className="text-sky-500" /> Change Tone</Button>
                                <Button onClick={() => handleRefineContent('Suggest an analogy to explain the main point.')} variant="outline" className="w-full justify-start" disabled={isLoading}><Sparkles size={18} className="text-amber-500" /> Suggest Analogy</Button>
                                <Button onClick={() => handleRefineContent('Generate 5 relevant hashtags for social media.')} variant="outline" className="w-full justify-start" disabled={isLoading}><Hash size={18} className="text-blue-500" /> Generate Hashtags</Button>
                                {isLoading && <div className="flex justify-center pt-4"><Loader className="animate-spin"/></div>}
                            </div>
                        </div>
                    </div>
                );
        }
    };

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
                {renderStepContent()}
            </CardContent>
        </Card>
    );
};

export default AIContentGeneratorView;
