
import React, { useState, useRef, useCallback } from 'react';
import { Map, Zap, Target, Clock, ArrowRight, X, Loader, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { GenerateRoadmapInput, GenerateRoadmapOutput } from '@/ai/schemas/tutor-schemas';

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
const RoadmapNode = ({ data }: { data: { label: string } }) => {
    return (
        <div className="bg-yellow-200 border-2 border-black rounded-lg shadow-lg px-4 py-2 text-center font-sans">
            <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-blue-500" />
            <div>{data.label}</div>
            <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-blue-500" />
            <Handle type="source" position={Position.Left} className="w-2 h-2 !bg-blue-500" />
            <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-blue-500" />
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
        {/* Skills Input */}
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

        {/* Goal Input */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"><Target size={16}/> Your Learning Goal or Desired Skills</label>
          <Input type="text" name="goal" value={formData.goal} onChange={handleInputChange} />
        </div>

        {/* Learning Preferences */}
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
    const [nodes, setNodes, onNodesChange] = useNodesState(roadmapData.nodes as Node[]);
    const [edges, setEdges, onEdgesChange] = useEdgesState(roadmapData.edges as Edge[]);

    const onConnect = useCallback(
        (params: Edge) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    return (
        <div className="w-full h-[70vh]">
            <div className="flex justify-end mb-4">
                <Button onClick={onBack} variant="outline">Start Over</Button>
            </div>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                className="bg-gray-100 rounded-lg border"
            >
                <Controls />
                <MiniMap nodeColor={(n) => '#FFD700'} />
                <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
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
    <div className="w-full bg-white rounded-2xl p-6 sm:p-8">
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
    </div>
  );
}
