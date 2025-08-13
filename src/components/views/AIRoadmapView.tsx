
import React, { useState, useRef, useEffect } from 'react';
import { Map, Zap, Target, Clock, ArrowRight, X, Loader, Radio, BookText, Donut, Shuffle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";
import type { GenerateRoadmapInput } from '@/ai/schemas/tutor-schemas';
import { marked } from 'marked';


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
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"><Donut size={16}/> Learning Style</label>
                 <select name="learningStyle" value={formData.learningStyle} onChange={handleInputChange} className="w-full p-3 border border-input bg-background rounded-lg appearance-none">
                    <option value="mixed">Mixed (Recommended)</option>
                    <option value="videos">Video-based</option>
                    <option value="reading">Reading-based</option>
                    <option value="hands-on">Hands-on Projects</option>
                </select>
            </div>
             <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"><Shuffle size={16}/> Resource Preference</label>
                 <select name="resourceType" value={formData.resourceType} onChange={handleInputChange} className="w-full p-3 border border-input bg-background rounded-lg appearance-none">
                    <option value="both">Free & Premium</option>
                    <option value="free">Free Only</option>
                    <option value="premium">Premium Only</option>
                </select>
            </div>
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"><Radio size={16}/> Target Timeline</label>
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
const RoadmapViewInternal = ({ roadmapMarkdown, onBack }: { roadmapMarkdown: string, onBack: () => void }) => {
  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
            <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg"><Map size={24} /></div>
            <h2 className="text-2xl font-bold text-gray-800">Your Personalized Roadmap</h2>
        </div>
        <Button onClick={onBack} variant="ghost">Start Over</Button>
      </div>

      <div 
        className="prose prose-sm max-w-none prose-headings:font-bold prose-h2:text-xl prose-h3:text-lg prose-a:text-indigo-600 hover:prose-a:text-indigo-800"
        dangerouslySetInnerHTML={{ __html: marked.parse(roadmapMarkdown) }} 
      />
    </div>
  );
};


// --- Main Wrapper Component ---
export default function AIRoadmapView({
    roadmapMarkdown, 
    handleGenerateRoadmap,
    setRoadmapMarkdown,
    isLoading,
    error 
} : {
    roadmapMarkdown: string | null, 
    handleGenerateRoadmap: (formData: GenerateRoadmapInput) => void,
    setRoadmapMarkdown: (markdown: string | null) => void;
    isLoading: boolean, 
    error: string | null
}) {
  const [formData, setFormData] = useState<GenerateRoadmapInput>({
    technicalSkills: ['HTML', 'CSS'],
    nonTechnicalSkills: ['Communication'],
    goal: 'Become a Full-Stack Developer',
    timePerWeek: '5-7 hours / week',
    learningStyle: 'mixed',
    resourceType: 'both',
    timeline: '3 Months'
  });

  const triggerAIGeneration = async () => {
    handleGenerateRoadmap(formData);
  };
  
  const handleBackToBlueprint = () => {
    setRoadmapMarkdown(null);
  }

  return (
    <div className="w-full bg-white rounded-2xl p-6 sm:p-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={roadmapMarkdown ? 'roadmap' : 'blueprint'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {!roadmapMarkdown ? (
            <BlueprintForm formData={formData} setFormData={setFormData} onGenerate={triggerAIGeneration} isLoading={isLoading} />
          ) : (
            <RoadmapViewInternal roadmapMarkdown={roadmapMarkdown} onBack={handleBackToBlueprint} />
          )}
        </motion.div>
      </AnimatePresence>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}
