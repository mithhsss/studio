
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb, Check, AlertTriangle, Briefcase, Building, MessageSquare, Loader, ListOrdered, Target, HandCoins, ShieldQuestion, TrendingUp, Bot } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { generateStrategy } from '@/ai/flows/generate-strategy-flow';
import type { GenerateStrategyOutput } from '@/ai/schemas/business-strategy-schemas';
import ReactFlow, {
    useNodesState,
    useEdgesState,
    addEdge,
    MiniMap,
    Controls,
    Background,
    type Node,
    type Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';


// --- UI Components ---
const AnalysisCard = ({ title, children, icon, className = '' }) => (
    <div className={`border-l-4 p-4 bg-gray-50 rounded-r-lg ${className}`}>
        <h4 className="font-semibold text-lg text-gray-700 capitalize flex items-center gap-2">
            {icon}
            {title}
        </h4>
        <div className="mt-2 text-gray-600">
            {children}
        </div>
    </div>
);

const SectionCard = ({ title, children, className = '' }) => (
     <div className={`bg-white border rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300 ${className}`}>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">{title}</h2>
        {children}
    </div>
);


const AIBusinessSimulatorView: React.FC = () => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<GenerateStrategyOutput | null>(null);
    const [description, setDescription] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const onConnect = useCallback((params: Edge) => setEdges((els) => addEdge(params, els)), [setEdges]);


    useEffect(() => {
        if (analysisResult?.successRoadmap) {
             const roadmapNodes: Node[] = analysisResult.successRoadmap.map((step, index) => ({
                id: `step-${step.step}`,
                type: 'default',
                data: { label: (
                    <div className="text-left">
                        <p className="font-bold text-indigo-700">Step {step.step}: {step.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                    </div>
                )},
                position: { x: (index % 2) * 400, y: index * 120 },
                style: {
                    background: '#f7f8fa',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    width: 350,
                    padding: '10px'
                }
            }));

            const roadmapEdges: Edge[] = analysisResult.successRoadmap.slice(0, -1).map((step, index) => ({
                id: `e-${step.step}-to-${step.step + 1}`,
                source: `step-${step.step}`,
                target: `step-${step.step + 1}`,
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#4f46e5', strokeWidth: 2 },
            }));

            setNodes(roadmapNodes);
            setEdges(roadmapEdges);
        }
    }, [analysisResult, setNodes, setEdges]);


    const handleAnalysis = async () => {
        if (description.trim().length < 50) {
            toast({ variant: 'destructive', title: 'Description Too Short', description: 'Please provide a more detailed description (at least 50 characters).' });
            return;
        }
        setIsLoading(true);
        setAnalysisResult(null);
        try {
            const result = await generateStrategy({ businessIdea: description });
            setAnalysisResult(result);
            setActiveTab('overview');
        } catch (err: any) {
            console.error("Analysis Error:", err);
            toast({ variant: 'destructive', title: 'Analysis Failed', description: err.message || 'The AI could not generate a response.' });
        } finally {
            setIsLoading(false);
        }
    };
    
    const resetUI = () => {
        setAnalysisResult(null);
        setDescription('');
    };

    const TabButton = ({ tabId, children }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`py-3 px-4 font-medium text-sm whitespace-nowrap border-b-2 transition-all duration-300 ${activeTab === tabId ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
            {children}
        </button>
    );

    const renderTabs = () => (
        <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-6 overflow-x-auto">
                <TabButton tabId="overview">Overview</TabButton>
                <TabButton tabId="swot">SWOT Analysis</TabButton>
                <TabButton tabId="pestle">PESTLE Analysis</TabButton>
                <TabButton tabId="porters">Porter's 5 Forces</TabButton>
                <TabButton tabId="catwoe">CATWOE Analysis</TabButton>
                <TabButton tabId="market">Market & Roadmap</TabButton>
            </nav>
        </div>
    );
    
    const renderContent = () => {
        if (!analysisResult) return null;
        
        const swotColors = { strengths: 'border-green-500 bg-green-50', weaknesses: 'border-amber-500 bg-amber-50', opportunities: 'border-blue-500 bg-blue-50', threats: 'border-red-500 bg-red-50' };
        const pestleColors = ['border-purple-400', 'border-sky-400', 'border-rose-400', 'border-teal-400', 'border-orange-400', 'border-green-400'];
        const levelColors = { 'Low': 'text-green-600', 'Moderate': 'text-amber-600', 'High': 'text-red-600' };

        return (
            <div>
                {renderTabs()}
                <div className="animate-in fade-in">
                    {activeTab === 'overview' && (
                        <div className="grid lg:grid-cols-5 gap-6">
                            <div className="lg:col-span-2">
                                <SectionCard title="Viability Score">
                                    <p className="text-7xl font-bold text-indigo-600 text-center">{analysisResult.viabilityScore.toFixed(1)}<span className="text-3xl text-gray-400">/10</span></p>
                                    <p className="mt-4 text-gray-600 text-center">{analysisResult.scoreJustification}</p>
                                </SectionCard>
                            </div>
                             <div className="lg:col-span-3 space-y-6">
                                <AnalysisCard title="Game Changing Idea" icon={<Lightbulb className="text-green-500"/>} className="border-green-500 bg-green-50">
                                    <p>{analysisResult.coreIdea}</p>
                                </AnalysisCard>
                                <AnalysisCard title="Winning Unique Selling Point (USP)" icon={<Check className="text-indigo-500"/>} className="border-indigo-500 bg-indigo-50">
                                    <p>{analysisResult.usp}</p>
                                </AnalysisCard>
                            </div>
                        </div>
                    )}
                     {activeTab === 'swot' && (
                        <SectionCard title="SWOT Analysis">
                            <div className="grid md:grid-cols-2 gap-6">
                                {Object.entries(analysisResult.swot).map(([key, value]) => (
                                    <AnalysisCard key={key} title={key} className={swotColors[key]}>
                                        <ul className="list-disc list-inside space-y-1">{value.map((item, i) => <li key={i}>{item}</li>)}</ul>
                                    </AnalysisCard>
                                ))}
                            </div>
                        </SectionCard>
                    )}
                    {activeTab === 'pestle' && (
                        <SectionCard title="PESTLE Analysis">
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Object.entries(analysisResult.pestle).map(([key, value], i) => (
                                    <div key={key} className={`p-4 border-t-4 ${pestleColors[i]} rounded-b-lg bg-gray-50`}>
                                        <h4 className="font-semibold text-lg capitalize">{key}</h4>
                                        <ul className="list-disc list-inside mt-2 text-gray-600 text-sm space-y-1">{value.map((item, i) => <li key={i}>{item}</li>)}</ul>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    )}
                    {activeTab === 'porters' && (
                         <SectionCard title="Porter's Five Forces Analysis">
                            <div className="space-y-4">
                                {analysisResult.porters.map(force => (
                                    <div key={force.force} className="p-4 border rounded-lg bg-gray-50">
                                        <h4 className="font-semibold text-lg">{force.force} <span className={`text-sm font-medium ml-2 ${levelColors[force.level]}`}>(Level: {force.level})</span></h4>
                                        <ul className="list-disc list-inside mt-2 text-gray-600 text-sm space-y-1">{force.points.map((p, i) => <li key={i}>{p}</li>)}</ul>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    )}
                    {activeTab === 'catwoe' && (
                         <SectionCard title="CATWOE Analysis">
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Object.entries(analysisResult.catwoe).map(([key, value], i) => (
                                     <div key={key} className={`p-4 border-t-4 ${pestleColors[i]} rounded-b-lg bg-gray-50`}>
                                        <h4 className="font-semibold text-lg capitalize">{key}</h4>
                                        <ul className="list-disc list-inside mt-2 text-gray-600 text-sm space-y-1">{value.map((item, i) => <li key={i}>{item}</li>)}</ul>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    )}
                    {activeTab === 'market' && (
                        <div className="space-y-6">
                            <SectionCard title="Market Size Analysis (TAM, SAM, SOM)">
                                <div className="space-y-4">
                                    <div><h4 className="text-lg font-semibold">Total Addressable Market (TAM)</h4><p className="text-gray-600">{analysisResult.marketSize.tam}</p></div>
                                    <div><h4 className="text-lg font-semibold">Serviceable Addressable Market (SAM)</h4><p className="text-gray-600">{analysisResult.marketSize.sam}</p></div>
                                    <div><h4 className="text-lg font-semibold">Serviceable Obtainable Market (SOM)</h4><p className="text-gray-600">{analysisResult.marketSize.som}</p></div>
                                </div>
                            </SectionCard>
                            <SectionCard title="10 Steps to Success Roadmap">
                                <div className="relative h-[70vh] w-full border rounded-lg bg-gray-50">
                                    <ReactFlow
                                        nodes={nodes}
                                        edges={edges}
                                        onNodesChange={onNodesChange}
                                        onEdgesChange={onEdgesChange}
                                        onConnect={onConnect}
                                        fitView
                                    >
                                        <Controls />
                                        <MiniMap />
                                        <Background variant="dots" gap={12} size={1} />
                                    </ReactFlow>
                                </div>
                            </SectionCard>
                        </div>
                    )}
                </div>
                <Button onClick={resetUI} variant="outline" className="w-full mt-8">Analyze Another Idea</Button>
            </div>
        );
    };

    return (
        <Card className="animate-in fade-in">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="bg-red-100 text-red-600 p-2 rounded-lg">
                        <Building size={20} />
                    </div>
                    <div>
                         <h3 className="text-xl font-bold text-gray-800">Business Strategy Simulator</h3>
                        <p className="text-gray-500 text-sm">Describe your business concept to generate a comprehensive strategic analysis.</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {!analysisResult ? (
                    <div>
                        <Textarea 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full h-40 p-3"
                            placeholder="Provide a detailed description of your business idea. The more context you give the AI, the more insightful the analysis will be."
                        />
                        <Button onClick={handleAnalysis} disabled={isLoading} className="mt-6 w-full">
                            {isLoading ? <Loader className="animate-spin" /> : <Bot size={18} />}
                            {isLoading ? 'Generating Analysis...' : 'Generate Full Strategic Analysis'}
                        </Button>
                    </div>
                ) : renderContent()}
            </CardContent>
        </Card>
    );
};

export default AIBusinessSimulatorView;
