
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Map, Zap, Target, Clock, ArrowRight, X, Loader, Radio, BookOpen, Briefcase, Users, Award, ExternalLink, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { GenerateRoadmapInput, GenerateRoadmapOutput } from '@/ai/schemas/tutor-schemas';
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import ReactFlow, {
    useNodesState,
    useEdgesState,
    addEdge,
    MiniMap,
    Controls,
    Background,
    Handle,
    Position,
    type Node,
    type Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';

// --- CUSTOM NODE COMPONENT ---
const RoadmapNode = ({ data }: { data: { label: string; description?: string } }) => {
    return (
        <div className="bg-indigo-100 border-2 border-indigo-400 text-indigo-800 rounded-lg shadow-md px-4 py-2 text-center w-48">
            <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-indigo-500" />
            <div className="font-semibold text-sm">{data.label}</div>
            {data.description && (
                <div className="text-xs text-indigo-700/80 mt-1">{data.description}</div>
            )}
            <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-indigo-500" />
            <Handle type="source" position={Position.Left} className="w-2 h-2 !bg-indigo-500" />
            <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-indigo-500" />
        </div>
    );
};

const nodeTypes = { roadmapNode: RoadmapNode };


// --- BLUEPRINT FORM COMPONENT ---
const BlueprintForm = ({ formData, setFormData, onGenerate, isLoading }: {
    formData: GenerateRoadmapInput;
    setFormData: (data: GenerateRoadmapInput) => void;
    onGenerate: () => void;
    isLoading: boolean;
}) => {
  const [skillInput, setSkillInput] = useState('');
  const [activeSkillTab, setActiveSkillTab] = useState('technical'); // 'technical' or 'nonTechnical'

  const handleAddSkill = () => {
    if (skillInput.trim()) {
        const key = activeSkillTab === 'technical' ? 'technicalSkills' : 'nonTechnicalSkills';
        if (!formData[key].includes(skillInput.trim())) {
            setFormData({ ...formData, [key]: [...formData[key], skillInput.trim()] });
        }
        setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string, type: 'technical' | 'nonTechnical') => {
    const key = type === 'technical' ? 'technicalSkills' : 'nonTechnicalSkills';
    setFormData({ ...formData, [key]: formData[key].filter((skill: string) => skill !== skillToRemove) });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg"><Map size={24} /></div>
        <h2 className="text-2xl font-bold text-gray-800">Create Your AI Roadmap</h2>
      </div>
      <p className="text-gray-500 mb-8">Provide the AI with a detailed profile for a truly personalized learning path.</p>

      <div className="space-y-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"><Zap size={16}/> Your Current Skills</label>
          <div className="border border-gray-300 rounded-lg">
            <div className="flex border-b">
                <button onClick={() => setActiveSkillTab('technical')} className={`flex-1 p-2 text-sm font-medium ${activeSkillTab === 'technical' ? 'bg-gray-100' : 'bg-white'}`}>Technical</button>
                <button onClick={() => setActiveSkillTab('nonTechnical')} className={`flex-1 p-2 text-sm font-medium ${activeSkillTab === 'nonTechnical' ? 'bg-gray-100' : 'bg-white'}`}>Non-Technical</button>
            </div>
            <div className="p-2 flex flex-wrap gap-2 min-h-[44px] items-center">
                {(activeSkillTab === 'technical' ? formData.technicalSkills : formData.nonTechnicalSkills).map(skill => (
                  <div key={skill} className="flex items-center gap-1.5 bg-gray-200 text-gray-800 px-2 py-1 rounded-md text-sm font-medium">
                    {skill}
                    <button onClick={() => handleRemoveSkill(skill, activeSkillTab as any)} className="text-gray-500 hover:text-gray-900"><X size={14}/></button>
                  </div>
                ))}
            </div>
             <div className="p-2 border-t">
                 <input
                  type="text"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); }}}
                  placeholder={`Add a ${activeSkillTab} skill and press Enter`}
                  className="w-full bg-transparent focus:outline-none p-1 text-sm"
                />
            </div>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"><Target size={16}/> Your Learning Goal or Desired Skills</label>
          <Input type="text" name="goal" value={formData.goal} onChange={handleInputChange} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"><Clock size={16}/> Time Commitment</label>
                <select name="timePerWeek" value={formData.timePerWeek} onChange={handleInputChange} className="w-full p-3 border border-input bg-background rounded-lg appearance-none">
                    <option>2-4 hours / week</option>
                    <option>5-7 hours / week</option>
                    <option>8+ hours / week</option>
                </select>
            </div>
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"><Zap size={16}/> Learning Style</label>
                 <select name="learningStyle" value={formData.learningStyle} onChange={handleInputChange} className="w-full p-3 border border-input bg-background rounded-lg appearance-none">
                    <option value="mixed">Mixed (Recommended)</option>
                    <option value="videos">Video-based</option>
                    <option value="reading">Reading-based</option>
                    <option value="hands-on">Hands-on Projects</option>
                </select>
            </div>
             <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"><Radio size={16}/> Resource Preference</label>
                 <select name="resourceType" value={formData.resourceType} onChange={handleInputChange} className="w-full p-3 border border-input bg-background rounded-lg appearance-none">
                    <option value="both">Free & Premium</option>
                    <option value="free">Free Only</option>
                    <option value="premium">Premium Only</option>
                </select>
            </div>
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"><Target size={16}/> Target Timeline</label>
                 <select name="timeline" value={formData.timeline} onChange={handleInputChange} className="w-full p-3 border border-input bg-background rounded-lg appearance-none">
                    <option>1 Month</option>
                    <option>3 Months</option>
                    <option>6 Months</option>
                </select>
            </div>
        </div>
      </div>

      <Button onClick={onGenerate} disabled={isLoading} className="w-full mt-8">
        {isLoading ? <Loader className="animate-spin" /> : 'Generate My Roadmap'}
        {!isLoading && <ArrowRight size={18}/>}
      </Button>
    </div>
  );
};


// --- ROADMAP VIEW COMPONENT ---
const RoadmapViewInternal = ({ roadmapData, onBack }: { roadmapData: GenerateRoadmapOutput, onBack: () => void }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { toast } = useToast();
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Function to generate graph nodes and edges from the detailed plan
        const generateFlowFromPlan = (plan: GenerateRoadmapOutput) => {
            const newNodes: Node[] = [];
            const newEdges: Edge[] = [];
            
            if (!plan || !plan.detailedStages) return;

            let yPos = 0;
            const xSpacingMain = 350;
            const xSpacingSub = 250;
            const ySpacingMain = 200;
            
            // Create main spine nodes for each stage
            plan.detailedStages.forEach((stage, stageIndex) => {
                const stageId = `stage-${stage.stage}`;
                newNodes.push({
                    id: stageId,
                    type: 'default',
                    data: { label: stage.title },
                    position: { x: 400, y: yPos },
                    style: { 
                        fontWeight: 'bold', 
                        width: 200, 
                        textAlign: 'center', 
                        background: '#eef2ff', 
                        borderColor: '#818cf8',
                        borderWidth: 2,
                    },
                });

                // Connect main spine nodes
                if (stageIndex > 0) {
                    const prevStageId = `stage-${plan.detailedStages[stageIndex - 1].stage}`;
                    newEdges.push({
                        id: `e-spine-${prevStageId}-${stageId}`,
                        source: prevStageId,
                        target: stageId,
                        type: 'straight',
                        style: { stroke: '#4f46e5', strokeWidth: 2 },
                    });
                }

                // Create subtopic nodes branching off
                stage.subtopics.forEach((subtopic, subIndex) => {
                    const isLeft = subIndex % 2 === 0;
                    const xPos = isLeft ? 400 - xSpacingMain : 400 + xSpacingMain;
                    const subtopicId = `${stageId}-sub-${subIndex}`;

                    newNodes.push({
                        id: subtopicId,
                        type: 'default',
                        data: { label: subtopic.title },
                        position: { x: xPos, y: yPos + (subIndex % 2 === 0 ? -50 : 50) },
                        style: {
                            width: 180,
                            textAlign: 'center',
                            fontSize: '12px'
                        }
                    });

                    newEdges.push({
                        id: `e-${stageId}-${subtopicId}`,
                        source: stageId,
                        target: subtopicId,
                        type: 'smoothstep',
                        animated: true
                    });
                });

                yPos += ySpacingMain;
            });

            setNodes(newNodes);
            setEdges(newEdges);
        };

        if (roadmapData) {
            generateFlowFromPlan(roadmapData);
        }
    }, [roadmapData, setNodes, setEdges]);
    
    const onConnect = useCallback(
        (params: Edge) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );
    
    const handleDownload = async () => {
        const element = printRef.current;
        if (!element) return;

        toast({ title: 'Preparing Download', description: 'Generating PDF, this may take a moment...' });

        const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
        const data = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProperties = pdf.getImageProperties(data);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;
        
        pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('ai-roadmap.pdf');
    };

    return (
        <div ref={printRef} className="bg-white p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Your Personalized Roadmap</h2>
                 <div className="flex items-center gap-2">
                    <Button onClick={handleDownload} variant="outline" size="sm">Download PDF</Button>
                    <Button onClick={onBack} variant="outline" size="sm">Start Over</Button>
                 </div>
            </div>
            
            {/* Graph View */}
            <div className="w-full h-[60vh] border rounded-lg mb-8">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                    className="bg-gray-50/50"
                >
                    <Controls />
                    <MiniMap nodeColor={(n) => '#a5b4fc'} />
                    <Background variant="dots" gap={12} size={1} />
                </ReactFlow>
            </div>

            {/* Detailed Stages View */}
            <div>
                 <h3 className="text-xl font-bold text-gray-800 mb-4">Detailed Learning Plan</h3>
                 <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                    {roadmapData.detailedStages?.map((stage, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold">{stage.stage}</span>
                                    {stage.title}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pl-12">
                                <p className="font-semibold text-gray-700">Objective: <span className="font-normal text-gray-600">{stage.objective}</span></p>
                                <p className="font-semibold text-gray-700 mt-1">Duration: <span className="font-normal text-gray-600">{stage.estimatedDuration}</span></p>

                                <div className="mt-4 space-y-4">
                                {stage.subtopics.map((sub, sIndex) => (
                                    <div key={sIndex} className="p-4 bg-gray-50 rounded-lg border">
                                        <h4 className="font-bold text-md">{sub.title}</h4>
                                        <p className="text-sm text-gray-600 mt-1">{sub.description}</p>
                                        
                                        <h5 className="font-semibold text-sm mt-3 mb-1">Free Resources</h5>
                                        {sub.freeResources.map((res, rIndex) => (
                                            <a key={rIndex} href={res.url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline block truncate">{res.name}</a>
                                        ))}

                                        {sub.premiumResources && sub.premiumResources.length > 0 && (
                                            <>
                                                <h5 className="font-semibold text-sm mt-3 mb-1 flex items-center gap-1">Premium Resources <Star size={12} className="text-amber-400 fill-current" /></h5>
                                                {sub.premiumResources.map((res, rIndex) => (
                                                     <a key={rIndex} href={res.url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline block truncate">{res.name}</a>
                                                ))}
                                            </>
                                        )}

                                        <h5 className="font-semibold text-sm mt-3 mb-1">Practice Project</h5>
                                        <p className="text-sm text-gray-600">{sub.project}</p>
                                    </div>
                                ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>

            {/* Final Sections */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader><CardContent className="flex items-center gap-3 p-0"><Briefcase className="text-green-500" /> <h3 className="font-bold">Portfolio Projects</h3></CardContent></CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-5 text-sm space-y-1">
                            {roadmapData.portfolioProjects?.map((p, i) => <li key={i}><b>{p.name}:</b> {p.description}</li>)}
                        </ul>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardContent className="flex items-center gap-3 p-0"><Users className="text-blue-500" /> <h3 className="font-bold">Communities</h3></CardContent></CardHeader>
                    <CardContent>
                         <ul className="list-disc pl-5 text-sm space-y-1">
                            {roadmapData.communities?.map((c, i) => <li key={i}><a href={c.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{c.name}</a></li>)}
                        </ul>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardContent className="flex items-center gap-3 p-0"><Award className="text-yellow-500" /> <h3 className="font-bold">Career Tips</h3></CardContent></CardHeader>
                    <CardContent>
                        <p className="text-sm">{roadmapData.careerTips}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};


// --- Main Wrapper Component ---
export default function AIRoadmapView({
    roadmapData, 
    handleGenerateRoadmap,
    setRoadmapData,
    isLoading,
    error 
} : {
    roadmapData: GenerateRoadmapOutput | null, 
    handleGenerateRoadmap: (formData: GenerateRoadmapInput) => void,
    setRoadmapData: (roadmap: GenerateRoadmapOutput | null) => void;
    isLoading: boolean, 
    error: string | null
}) {
  const [formData, setFormData] = useState<GenerateRoadmapInput>({
    technicalSkills: ['HTML', 'CSS'],
    nonTechnicalSkills: ['Communication'],
    goal: 'Become a Data Engineer',
    timePerWeek: '5-7 hours / week',
    learningStyle: 'mixed',
    resourceType: 'both',
    timeline: '3 Months'
  });

  const triggerAIGeneration = async () => {
    handleGenerateRoadmap(formData);
  };
  
  const handleBackToBlueprint = () => {
    setRoadmapData(null);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                    <span className="p-2 bg-indigo-100 text-indigo-500 rounded-lg mr-3"><Map className="h-5 w-5" /></span>
                    AI Roadmap
                </h2>
                <p className="text-sm text-gray-500 ml-10">Your personalized career path, visualized.</p>
            </div>
             <button className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">20 XP per roadmap</button>
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={roadmapData ? 'roadmap' : 'blueprint'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {!roadmapData ? (
              <BlueprintForm formData={formData} setFormData={setFormData} onGenerate={triggerAIGeneration} isLoading={isLoading} />
            ) : (
              <RoadmapViewInternal roadmapData={roadmapData} onBack={handleBackToBlueprint} />
            )}
          </motion.div>
        </AnimatePresence>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </CardContent>
    </Card>
  );
}
