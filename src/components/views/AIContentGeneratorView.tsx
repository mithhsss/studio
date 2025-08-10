import React, { useState } from 'react';
import { Lightbulb, FileText, PenTool, Sparkles, ArrowRight, Plus, Hash, Wind, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";

import { generateOutline, type GenerateOutlineOutput } from '@/ai/flows/generate-outline-flow';
import { generateDraft } from '@/ai/flows/generate-draft-flow';
import { refineContent } from '@/ai/flows/refine-content-flow';


// --- STEP COMPONENTS ---

const Step1_Spark = ({ formData, setFormData, onNext, isLoading }: any) => (
  <div>
    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Lightbulb className="text-blue-500"/> Step 1: The Spark</h3>
    <p className="text-gray-500 mb-6">Start with your core idea and the main message you want to convey.</p>
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">What's the core topic or question?</label>
        <Input 
            type="text" 
            value={formData.topic} 
            onChange={(e: any) => setFormData({...formData, topic: e.target.value})} 
            placeholder="e.g., The future of AI in UX Design"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">What is the primary goal or key message?</label>
        <Textarea 
            value={formData.goal} 
            onChange={(e: any) => setFormData({...formData, goal: e.target.value})} 
            rows={4}
            placeholder="e.g., To persuade designers that AI is a tool for augmentation, not replacement."
         />
      </div>
    </div>
    <Button onClick={onNext} disabled={isLoading} className="w-full mt-8 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:bg-blue-300">
      {isLoading ? <Loader className="animate-spin" /> : 'Generate Outline'} <ArrowRight size={18}/>
    </Button>
  </div>
);

const Step2_Blueprint = ({ outline, setOutline, onNext, isLoading, onBack }: any) => {
  const handlePointChange = (index: number, value: string) => {
    const newPoints = [...outline.mainPoints];
    newPoints[index] = value;
    setOutline({ ...outline, mainPoints: newPoints });
  };
  
  const addPoint = () => {
    setOutline({ ...outline, mainPoints: [...outline.mainPoints, 'New point...'] });
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><FileText className="text-blue-500"/> Step 2: The Blueprint</h3>
        <button onClick={onBack} className="text-sm font-semibold text-gray-600 hover:text-gray-900">Back</button>
      </div>
      <p className="text-gray-500 mb-6">Review and edit the AI-generated outline. This structure will guide the final draft.</p>
      
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-1">Title Suggestion</label>
          <Input type="text" value={outline.title} onChange={(e: any) => setOutline({...outline, title: e.target.value})} />
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-1">Hook Suggestion</label>
          <Textarea value={outline.hook} onChange={(e: any) => setOutline({...outline, hook: e.target.value})} rows={3}/>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">Main Points</label>
          <div className="space-y-2">
            {outline.mainPoints.map((point: string, index: number) => (
              <Input key={index} type="text" value={point} onChange={e => handlePointChange(index, e.target.value)} />
            ))}
          </div>
          <button onClick={addPoint} className="text-sm font-semibold text-blue-600 hover:text-blue-800 mt-3 flex items-center gap-1"><Plus size={16}/> Add Point</button>
        </div>
         <div className="bg-gray-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-1">Call to Action (CTA)</label>
          <Input type="text" value={outline.cta} onChange={(e: any) => setOutline({...outline, cta: e.target.value})} />
        </div>
      </div>

      <Button onClick={onNext} disabled={isLoading} className="w-full mt-8 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:bg-blue-300">
        {isLoading ? <Loader className="animate-spin" /> : 'Generate Full Draft'} <ArrowRight size={18}/>
      </Button>
    </div>
  );
};

const Step3_Polish = ({ draft, setDraft, onStartOver, onRefine }: any) => {
    const [refineCommand, setRefineCommand] = useState('');
    const [tone, setTone] = useState('');

    const handleRefineClick = () => {
        let fullCommand = refineCommand;
        if(tone) {
            fullCommand = `Change the tone to be '${tone}'. ${refineCommand}`;
        }
        onRefine(fullCommand);
        setRefineCommand('');
        setTone('');
    };

    return (
      <div>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><PenTool className="text-blue-500"/> Step 3: The Polish</h3>
          <Button onClick={onStartOver} variant="ghost">Start Over</Button>
        </div>
        <p className="text-gray-500 mb-6">Here's your draft. Use the tools to refine it, or copy the text and you're done!</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Textarea value={draft} onChange={e => setDraft(e.target.value)} className="w-full h-96 p-4 border border-gray-300 rounded-lg bg-gray-50 font-serif text-base leading-relaxed" />
          </div>
          <div className="md:col-span-1 space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1"><Wind size={14}/> Tone & Style</label>
              <Input value={tone} onChange={e => setTone(e.target.value)} type="text" placeholder="e.g., 'More formal and academic'" className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1"><Sparkles size={14}/> Other Specific Changes</label>
              <Textarea value={refineCommand} onChange={e => setRefineCommand(e.target.value)} placeholder="e.g., 'Add a paragraph about the impact on junior designers'" className="w-full p-2 border border-gray-300 rounded-lg text-sm" rows="4"/>
            </div>
            <Button onClick={handleRefineClick} className="w-full flex items-center justify-center gap-2 p-2 bg-blue-600 text-white border rounded-lg hover:bg-blue-700 font-semibold">
              <Sparkles size={16}/> Refine Draft
            </Button>
            <Button onClick={() => onRefine('Generate 5 relevant hashtags for social media.')} className="w-full flex items-center justify-center gap-2 p-2 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 font-semibold text-gray-700">
              <Hash size={16}/> Generate Hashtags
            </Button>
          </div>
        </div>
      </div>
    );
}

// --- MAIN VIEW COMPONENT ---
const AIContentGeneratorView = () => {
  const { toast } = useToast();
  const [step, setStep] = useState('spark'); // spark, blueprint, polish
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    topic: 'The future of AI in UX Design',
    goal: 'I believe AI will augment, not replace, designers by handling data analysis and repetitive tasks, allowing humans to focus on empathy and strategy.'
  });
  const [outline, setOutline] = useState<GenerateOutlineOutput | null>(null);
  const [draft, setDraft] = useState('');

  const handleGenerateOutline = async () => {
    setIsLoading(true);
    try {
        const result = await generateOutline({ 
            topic: formData.topic, 
            goal: formData.goal 
        });
        setOutline(result);
        setStep('blueprint');
    } catch (err) {
        toast({
            variant: "destructive",
            title: "Outline Generation Failed",
            description: "There was a problem generating the outline. Please try again.",
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleGenerateDraft = async () => {
    if (!outline) return;
    setIsLoading(true);
    try {
        const result = await generateDraft(outline);
        setDraft(result.draft);
        setStep('polish');
    } catch (err) {
        toast({
            variant: "destructive",
            title: "Draft Generation Failed",
            description: "There was a problem generating the draft. Please try again.",
        });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleRefineContent = async (command: string) => {
    setIsLoading(true);
    try {
        const result = await refineContent({ text: draft, command });
        setDraft(result.refinedText);
        toast({
            title: "Content Refined!",
            description: "The draft has been updated.",
        });
    } catch (err) {
        toast({
            variant: "destructive",
            title: "Refinement Failed",
            description: "The AI could not refine the content. Please try again.",
        });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleStartOver = () => {
      setStep('spark');
      setOutline(null);
      setDraft('');
  };

  const renderStep = () => {
    switch (step) {
      case 'spark':
        return <Step1_Spark formData={formData} setFormData={setFormData} onNext={handleGenerateOutline} isLoading={isLoading} />;
      case 'blueprint':
        return <Step2_Blueprint outline={outline} setOutline={setOutline} onNext={handleGenerateDraft} isLoading={isLoading} onBack={() => setStep('spark')} />;
      case 'polish':
        return <Step3_Polish draft={draft} setDraft={setDraft} onStartOver={handleStartOver} onRefine={handleRefineContent} />;
      default:
        return null;
    }
  };

  return (
    <Card>
        <CardHeader>
             <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-700 p-2 rounded-lg"><FileText size={24} /></div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">AI Content Generator</h2>
                    <p className="text-sm text-gray-500">Generate high-quality content in three simple steps</p>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
        </CardContent>
    </Card>
  );
}

export default AIContentGeneratorView;
