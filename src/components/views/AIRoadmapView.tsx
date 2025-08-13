
import React, { useState, useRef, useEffect } from 'react';
import { Map, Zap, Target, Clock, ArrowRight, X, Book, ExternalLink, Star, Download, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateRoadmap } from '@/ai/flows/generate-roadmap-flow';
import type { Roadmap } from '@/ai/flows/generate-roadmap-flow';
import { useToast } from "@/hooks/use-toast";


// --- PDF Generation Dependencies ---
// We will dynamically load these from a CDN to avoid bundling large libraries.
const loadScript = (src: string) => {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Script load error for ${src}`));
    document.head.appendChild(script);
  });
};


// --- BLUEPRINT FORM COMPONENT ---
const BlueprintForm = ({ formData, setFormData, onGenerate, isLoading }: any) => {
  const [skillInput, setSkillInput] = useState('');

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.currentSkills.includes(skillInput.trim())) {
      setFormData((prev: any) => ({ ...prev, currentSkills: [...prev.currentSkills, skillInput.trim()] }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev: any) => ({ ...prev, currentSkills: prev.currentSkills.filter((skill: string) => skill !== skillToRemove) }));
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg"><Map size={24} /></div>
        <h2 className="text-2xl font-bold text-gray-800">Create Your AI Roadmap</h2>
      </div>
      <p className="text-gray-500 mb-8">Tell us your starting point and your goal, and we'll generate a personalized learning path.</p>

      <div className="space-y-6">
        {/* Current Skills Input */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"><Zap size={16}/> Your Current Skills</label>
          <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-lg min-h-[44px] items-center">
            {formData.currentSkills.map((skill: string) => (
              <div key={skill} className="flex items-center gap-1.5 bg-gray-200 text-gray-800 px-2 py-1 rounded-md text-sm font-medium">
                {skill}
                <button onClick={() => handleRemoveSkill(skill)} className="text-gray-500 hover:text-gray-900 transition-colors"><X size={14}/></button>
              </div>
            ))}
            <input
              type="text"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); }}}
              placeholder="Add a skill and press Enter"
              className="flex-grow bg-transparent focus:outline-none p-1"
            />
          </div>
        </div>

        {/* Learning Goal Input */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"><Target size={16}/> Your Learning Goal</label>
          <Input type="text" value={formData.goal} onChange={(e: any) => setFormData({...formData, goal: e.target.value})} />
        </div>

        {/* Timeline Select */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"><Clock size={16}/> Desired Timeline</label>
          <select value={formData.timeline} onChange={(e: any) => setFormData({...formData, timeline: e.target.value})} className="w-full p-3 border border-input bg-background rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
            <option>1 Month</option>
            <option>3 Months</option>
            <option>6 Months</option>
          </select>
        </div>
      </div>

      {/* Generate Button */}
      <Button onClick={onGenerate} disabled={isLoading} className="w-full mt-8">
        {isLoading ? <Loader className="animate-spin" /> : 'Generate My Roadmap'}
        {!isLoading && <ArrowRight size={18}/>}
      </Button>
    </div>
  );
};


// --- ROADMAP VIEW COMPONENT ---
const RoadmapViewInternal = ({ roadmap, goal, onBack, onTopicSelect }: any) => {
  const roadmapRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    toast({ title: "Preparing Download...", description: "Your PDF will be ready shortly." });
    try {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");

        const input = roadmapRef.current;
        // @ts-ignore
        const html2canvas = window.html2canvas;
        // @ts-ignore
        const { jsPDF } = window.jspdf;

        if (!input || !html2canvas || !jsPDF) {
            throw new Error("PDF generation libraries not found.");
        }

        const canvas = await html2canvas(input, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = canvas.height * pdfWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 10; // top margin

        pdf.addImage(imgData, 'PNG', 10, position, pdfWidth - 20, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, pdfWidth - 20, imgHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
        }
        
        pdf.save(`roadmap-for-${goal.replace(/\s+/g, '-')}.pdf`);

    } catch (error) {
        console.error("Error generating PDF:", error);
        toast({ variant: 'destructive', title: "Download Failed", description: "Could not generate the PDF. Please try again." });
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
            <button onClick={handleDownloadPDF} disabled={isDownloading} className="p-2 text-gray-500 hover:text-indigo-600 disabled:text-gray-300 disabled:cursor-wait transition-colors">
                {isDownloading ? <Loader className="animate-spin" size={18} /> : <Download size={18}/>}
            </button>
            <Button onClick={onBack} variant="ghost">Start Over</Button>
        </div>
      </div>

      <div ref={roadmapRef} className="p-1">
        <p className="text-gray-500 mb-8">Your personalized path to <span className="font-semibold text-indigo-700">{goal}</span>.</p>
        <div className="space-y-6">
          {roadmap.map((step: any, index: number) => (
            <div key={step.week} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold z-10">{step.week}</div>
                {index < roadmap.length - 1 && <div className="w-0.5 flex-grow bg-gray-200 -mt-1"></div>}
              </div>
              <div className="flex-1 bg-gray-50 p-4 rounded-lg border border-gray-200/80">
                <h3 className="font-bold text-lg text-gray-800">{step.title}</h3>
                <div className="mt-3 space-y-2">
                  {step.subtopics.map((topic: any) => (
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
      </div>
    </div>
  );
};

// --- RESOURCE MODAL COMPONENT ---
const ResourceModal = ({ topic, onClose }: any) => {
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
                <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Free Resources</h4>
                    {topic.freeResources && topic.freeResources.length > 0 ? (
                        topic.freeResources.map((res: any) => (
                            <a href={res.url} target="_blank" rel="noopener noreferrer" key={res.name} className="flex items-center gap-2 text-sm text-indigo-600 hover:underline p-1.5 rounded-md hover:bg-gray-100 transition-colors">
                                <ExternalLink size={14}/> {res.name}
                            </a>
                        ))
                    ) : <p className="text-sm text-gray-400 italic">No free resources listed for this topic.</p>}
                </div>
                <div className="mt-4">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-1.5">Premium Resources <Star size={14} className="text-amber-400 fill-current"/></h4>
                     {topic.premiumResources && topic.premiumResources.length > 0 ? (
                        topic.premiumResources.map((res: any) => (
                            <a href={res.url} target="_blank" rel="noopener noreferrer" key={res.name} className="flex items-center gap-2 text-sm text-indigo-600 hover:underline p-1.5 rounded-md hover:bg-gray-100 transition-colors">
                                <ExternalLink size={14}/> {res.name}
                            </a>
                        ))
                    ) : <p className="text-sm text-gray-400 italic">No premium resources listed.</p>}
                </div>
            </motion.div>
        </motion.div>
    );
};

// --- Main Wrapper Component ---
export default function AIRoadmapView({
    roadmapContent, 
    handleGenerateRoadmap, 
    isLoading,
    error 
} : {
    roadmapContent: Roadmap | null, 
    handleGenerateRoadmap: (formData: any) => void, 
    isLoading: boolean, 
    error: string | null
}) {
  const [step, setStep] = useState('blueprint'); 
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [formData, setFormData] = useState({
    currentSkills: ['HTML', 'CSS', 'Basic JavaScript'],
    goal: 'Become a UX Designer',
    timeline: '1 Month'
  });

  const triggerAIGeneration = async () => {
    handleGenerateRoadmap(formData);
  };
  
  useEffect(() => {
    if (roadmapContent) {
      setStep('roadmap');
    }
  }, [roadmapContent])

  const handleBackToBlueprint = () => {
      // In a real app, you might want to clear roadmapContent in the parent state here
      setStep('blueprint');
  }

  return (
    <div className="w-full bg-white rounded-2xl p-6 sm:p-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {step === 'blueprint' || !roadmapContent ? (
            <BlueprintForm formData={formData} setFormData={setFormData} onGenerate={triggerAIGeneration} isLoading={isLoading} />
          ) : (
            <RoadmapViewInternal roadmap={roadmapContent} goal={formData.goal} onBack={handleBackToBlueprint} onTopicSelect={setSelectedTopic} />
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

