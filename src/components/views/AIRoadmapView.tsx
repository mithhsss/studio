
import React, { useState, useRef, useEffect } from 'react';
import { Map, Zap, Target, Clock, ArrowRight, X, Loader, Radio, BookText, Donut, Shuffle, Book, ExternalLink, Star, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";
import type { GenerateRoadmapInput, Roadmap, Subtopic } from '@/ai/schemas/tutor-schemas';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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


const ResourceModal = ({ topic, onClose }: { topic: Subtopic, onClose: () => void }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl border border-gray-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{topic.title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800 transition-colors"><X size={20}/></button>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed border-b border-gray-200 pb-4 mb-4">{topic.description}</p>
                 <div className="max-h-60 overflow-y-auto pr-2 space-y-4">
                    {/* Hands-on Project */}
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Hands-On Project</h4>
                        <p className="text-sm text-gray-600">{topic.project}</p>
                    </div>
                    {/* Free Resources Section */}
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Free Resources</h4>
                        {topic.freeResources?.length > 0 ? (
                            topic.freeResources.map(res => (
                                <a href={res.url} target="_blank" rel="noopener noreferrer" key={res.name} className="flex items-center gap-2 text-sm text-indigo-600 hover:underline p-1.5 rounded-md hover:bg-gray-100 transition-colors">
                                    <ExternalLink size={14}/> {res.name}
                                </a>
                            ))
                        ) : <p className="text-sm text-gray-400 italic">No free resources listed for this topic.</p>}
                    </div>

                    {/* Premium Resources Section */}
                    {topic.premiumResources && topic.premiumResources.length > 0 && (
                        <div className="mt-4">
                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-1.5">Premium Resources <Star size={14} className="text-amber-400 fill-current"/></h4>
                             {topic.premiumResources.map(res => (
                                <a href={res.url} target="_blank" rel="noopener noreferrer" key={res.name} className="flex items-center gap-2 text-sm text-indigo-600 hover:underline p-1.5 rounded-md hover:bg-gray-100 transition-colors">
                                    <ExternalLink size={14}/> {res.name}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

// --- ROADMAP VIEW COMPONENT ---
const RoadmapViewInternal = ({ roadmap, goal, onBack, onTopicSelect }: { roadmap: Roadmap, goal: string, onBack: () => void, onTopicSelect: (topic: Subtopic) => void }) => {
  const roadmapRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    const input = roadmapRef.current;
    if (!input) return;

    try {
        const canvas = await html2canvas(input, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        const imgHeight = (pdfWidth / ratio);
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
        pdf.save(`roadmap-for-${goal.replace(/\s+/g, '-')}.pdf`);
    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Could not generate PDF. Please try again.");
    } finally {
        setIsDownloading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
            <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg"><Map size={24} /></div>
            <h2 className="text-2xl font-bold text-gray-800">Your Roadmap to Success</h2>
        </div>
        <div className="flex items-center gap-2">
            <Button onClick={handleDownloadPDF} disabled={isDownloading} variant="ghost" size="icon">
                <Download size={18}/>
            </Button>
            <Button onClick={onBack} variant="outline">Start Over</Button>
        </div>
      </div>

      <div ref={roadmapRef} className="p-1">
        <p className="text-gray-500 mb-8">Your personalized path to <span className="font-semibold text-indigo-700">{goal}</span>.</p>
        <div className="space-y-6">
          {roadmap.stages.map((step, index) => (
            <div key={step.stage} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold z-10">{step.stage}</div>
                {index < roadmap.stages.length - 1 && <div className="w-0.5 flex-grow bg-gray-200 -mt-1"></div>}
              </div>
              <div className="flex-1 bg-gray-50 p-4 rounded-lg border border-gray-200/80">
                <h3 className="font-bold text-lg text-gray-800">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.objective}</p>
                <div className="mt-3 space-y-2">
                  {step.subtopics.map(topic => (
                    <div key={topic.title} className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-200/90 shadow-sm">
                      <p className="text-sm font-medium text-gray-700">{topic.title}</p>
                      <button onClick={() => onTopicSelect(topic)} className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all">
                          <Book size={16}/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
         <div className="mt-8 pt-6 border-t">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Continuing Your Journey</h3>
              <div className="grid md:grid-cols-2 gap-6">
                  <div>
                      <h4 className="font-semibold mb-2">Portfolio Project Ideas</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {roadmap.portfolioProjects.map(p => <li key={p.name}><strong>{p.name}:</strong> {p.description}</li>)}
                      </ul>
                  </div>
                  <div>
                      <h4 className="font-semibold mb-2">Communities & Networking</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {roadmap.communities.map(c => <li key={c.name}><a href={c.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{c.name}</a></li>)}
                      </ul>
                  </div>
                   <div className="md:col-span-2">
                      <h4 className="font-semibold mb-2">Career & Certification Tips</h4>
                      <p className="text-sm text-gray-600">{roadmap.careerTips}</p>
                  </div>
              </div>
          </div>
      </div>
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
    roadmapMarkdown: Roadmap | null, 
    handleGenerateRoadmap: (formData: GenerateRoadmapInput) => void,
    setRoadmapMarkdown: (roadmap: Roadmap | null) => void;
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
  const [selectedTopic, setSelectedTopic] = useState<Subtopic | null>(null);

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
            <RoadmapViewInternal roadmap={roadmapMarkdown} goal={formData.goal} onBack={handleBackToBlueprint} onTopicSelect={setSelectedTopic} />
          )}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
          {selectedTopic && <ResourceModal topic={selectedTopic} onClose={() => setSelectedTopic(null)} />}
      </AnimatePresence>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}
