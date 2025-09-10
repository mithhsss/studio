
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Map, Zap, Target, Clock, ArrowRight, X, Loader, Radio, BookOpen, Briefcase, Users, Award, ExternalLink, Star, Maximize, Minimize } from 'lucide-react';
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
    const detailedPlanRef = useRef<HTMLDivElement>(null);
    const roadmapGraphRef = useRef<HTMLDivElement>(null);
    const [isFullScreen, setIsFullScreen] = useState(false);

    useEffect(() => {
        const generateFlowFromPlan = (plan: GenerateRoadmapOutput) => {
            const newNodes: Node[] = [];
            const newEdges: Edge[] = [];
            
            if (!plan || !plan.topics) return;

            let yPos = 0;
            const xCenter = 600;
            const xSpacingMain = 350;
            const xSpacingSub = 250;
            const ySpacingSubSub = 80;
            const yPadding = 150; // Increased padding between main stages

            plan.topics.forEach((topic, stageIndex) => {
                const stageId = topic.id;
                
                newNodes.push({
                    id: stageId,
                    type: 'default',
                    data: { label: topic.label },
                    position: { x: xCenter, y: yPos },
                    style: { 
                        fontWeight: 'bold', 
                        width: 200, 
                        textAlign: 'center', 
                        background: '#eef2ff', 
                        borderColor: '#818cf8',
                        borderWidth: 2,
                    },
                });

                if (stageIndex > 0) {
                    const prevStageId = plan.topics[stageIndex - 1].id;
                    newEdges.push({
                        id: `e-spine-${prevStageId}-${stageId}`,
                        source: prevStageId,
                        target: stageId,
                        type: 'straight',
                        style: { stroke: '#4f46e5', strokeWidth: 2 },
                    });
                }
                
                let maxSubSubNodesOnSide = { left: 0, right: 0 };
                
                topic.subtopics.forEach((sub, subIndex) => {
                    if (sub.subs && sub.subs.length > 0) {
                        const isLeft = subIndex % 2 === 0;
                        if(isLeft) {
                            maxSubSubNodesOnSide.left = Math.max(maxSubSubNodesOnSide.left, sub.subs.length);
                        } else {
                            maxSubSubNodesOnSide.right = Math.max(maxSubSubNodesOnSide.right, sub.subs.length);
                        }
                    }

                    const subId = `${stageId}-sub-${subIndex}`;
                    const xPos = subIndex % 2 === 0 ? xCenter - xSpacingMain : xCenter + xSpacingMain;
                    
                    newNodes.push({
                        id: subId,
                        data: { label: sub.label },
                        position: { x: xPos, y: yPos },
                        style: { width: 180, textAlign: 'center' }
                    });

                    newEdges.push({
                        id: `e-stage-${subId}`,
                        source: stageId,
                        target: subId,
                        type: 'smoothstep',
                    });

                    if (sub.subs && sub.subs.length > 0) {
                        sub.subs.forEach((subSub, subSubIndex) => {
                            const subSubId = `${subId}-subsub-${subSubIndex}`;
                            const subXPos = subIndex % 2 === 0 ? xPos - xSpacingSub : xPos + xSpacingSub;
                            const yOffset = (subSubIndex - (sub.subs.length - 1) / 2) * ySpacingSubSub;

                            newNodes.push({
                                id: subSubId,
                                data: { label: subSub },
                                position: { x: subXPos, y: yPos + yOffset },
                                style: { fontSize: '12px', width: 150, textAlign: 'center' }
                            });
                            newEdges.push({
                                id: `e-sub-${subSubId}`,
                                source: subId,
                                target: subSubId,
                                type: 'smoothstep',
                            });
                        });
                    }
                });
                
                const maxSubsOnOneSide = Math.max(maxSubSubNodesOnSide.left, maxSubSubNodesOnSide.right);
                const verticalSpread = maxSubsOnOneSide > 0 ? (maxSubsOnOneSide -1) * ySpacingSubSub : 0;
                
                yPos += verticalSpread + yPadding;
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
        toast({ title: 'Preparing Download', description: 'Generating your PDF roadmap...' });

        const detailsElement = detailedPlanRef.current;

        if (!detailsElement) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not find elements to generate PDF.' });
            return;
        }

        try {
            const doc = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;
            const maxLineWidth = pageWidth - margin * 2;

            let y = margin;

            const checkPageBreak = (heightNeeded: number) => {
                if (y + heightNeeded > pageHeight - margin) {
                    doc.addPage();
                    y = margin;
                }
            };
    
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(22);
            doc.text('Your Detailed Learning Plan', pageWidth / 2, y, { align: 'center' });
            y += 15;
            
            roadmapData.detailedStages.forEach((stage, index) => {
                checkPageBreak(20);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(16);
                doc.text(`Stage ${stage.stage}: ${stage.title}`, margin, y);
                y += 8;
    
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(11);
                doc.setTextColor(80, 80, 80);
                const objectiveLines = doc.splitTextToSize(`Objective: ${stage.objective}`, maxLineWidth);
                checkPageBreak(objectiveLines.length * 5);
                doc.text(objectiveLines, margin, y);
                y += objectiveLines.length * 5;
    
                const durationLines = doc.splitTextToSize(`Estimated Duration: ${stage.estimatedDuration}`, maxLineWidth);
                checkPageBreak(durationLines.length * 5);
                doc.text(durationLines, margin, y);
                y += 8;
    
                stage.subtopics.forEach((sub) => {
                    checkPageBreak(15);
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(12);
                    doc.setTextColor(0, 0, 0);
                    doc.text(sub.title, margin, y);
                    y += 6;
    
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(10);
                    doc.setTextColor(80, 80, 80);
                    const descriptionLines = doc.splitTextToSize(sub.description, maxLineWidth);
                    checkPageBreak(descriptionLines.length * 4);
                    doc.text(descriptionLines, margin, y);
                    y += descriptionLines.length * 4 + 2;
                    
                    doc.setFont('helvetica', 'bold');
                    doc.text('Project:', margin, y);
                    y += 4;
                    doc.setFont('helvetica', 'normal');
                    const projectLines = doc.splitTextToSize(sub.project, maxLineWidth);
                    checkPageBreak(projectLines.length * 4);
                    doc.text(projectLines, margin, y);
                    y += projectLines.length * 4 + 4;
                    
                    const renderResources = (title: string, resources: any[]) => {
                        if (resources && resources.length > 0) {
                            checkPageBreak(8);
                            doc.setFont('helvetica', 'bold');
                            doc.text(title, margin, y);
                            y += 5;
                            doc.setFont('helvetica', 'normal');
                            resources.forEach(res => {
                               checkPageBreak(4);
                               doc.setTextColor(43, 108, 176);
                               doc.textWithLink(res.name, margin, y, { url: res.url });
                               y += 5;
                            });
                        }
                    };
    
                    renderResources('Free Resources:', sub.freeResources);
                    renderResources('Premium Resources:', sub.premiumResources);
                    
                    y += 5;
                });
                
                if (index < roadmapData.detailedStages.length - 1) {
                    doc.setDrawColor(200, 200, 200);
                    doc.line(margin, y, pageWidth - margin, y);
                    y += 8;
                }
            });
    
            doc.save('AI_Learning_Roadmap.pdf');
        } catch (error) {
            console.error("PDF Generation Error:", error);
            toast({ variant: 'destructive', title: 'PDF Error', description: 'Failed to generate the roadmap PDF.' });
        }
    };
    
    const renderFlow = (isFull: boolean) => (
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
    );

    return (
        <div className="bg-white p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Your Personalized Roadmap</h2>
                 <div className="flex items-center gap-2">
                    <Button onClick={() => setIsFullScreen(true)} variant="outline" size="sm" className="flex items-center gap-1.5"><Maximize size={14}/> Full Screen</Button>
                    <Button onClick={handleDownload} variant="outline" size="sm">Download PDF</Button>
                    <Button onClick={onBack} variant="outline" size="sm">Start Over</Button>
                 </div>
            </div>
            
            {/* Graph View */}
            <div ref={roadmapGraphRef} className="w-full h-[60vh] border rounded-lg mb-8">
                {renderFlow(false)}
            </div>

            {/* Full Screen Modal */}
            {isFullScreen && (
                <div className="fixed inset-0 bg-white z-50 p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Full Screen Roadmap</h2>
                        <Button onClick={() => setIsFullScreen(false)} variant="outline" size="sm" className="flex items-center gap-1.5"><Minimize size={14}/> Exit Full Screen</Button>
                    </div>
                    <div className="flex-grow border rounded-lg">
                        {renderFlow(true)}
                    </div>
                </div>
            )}

            {/* Detailed Stages View */}
            <div ref={detailedPlanRef}>
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
