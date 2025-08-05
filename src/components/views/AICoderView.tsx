import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Code, Settings, Terminal, ArrowRight, Bot, User, File, Folder, Download, Copy, Sparkles, Loader, Puzzle, GitMerge, BrainCircuit, Share2, ArrowLeft, Layers } from 'lucide-react';

// --- MOCK DATA & HELPERS ---
const simulateAICall = (duration = 1000) => new Promise(resolve => setTimeout(resolve, duration));

const mockGeneratedCode = {
  'pricing-table.jsx': `import React, { useState } from 'react';
import './pricing-table.css';

const PricingTable = ({ data, theme = 'light' }) => {
  const [selectedTier, setSelectedTier] = useState(null);

  const handleSelect = (id) => {
    setSelectedTier(id);
  };

  return (
    <div className={\`pricing-container theme-\${theme}\`}>
      {data.map((tier) => (
        <div 
          key={tier.id} 
          className={\`pricing-tier \${selectedTier === tier.id ? 'selected' : ''}\`}
        >
          <h3 className="tier-name">{tier.name}</h3>
          <p className="tier-price">\${tier.price}/mo</p>
          <ul className="tier-features">
            {tier.features.map((feature, i) => <li key={i}>{feature}</li>)}
          </ul>
          <button onClick={() => handleSelect(tier.id)} className="tier-button">
            {selectedTier === tier.id ? 'Selected' : 'Choose Plan'}
          </button>
        </div>
      ))}
    </div>
  );
};

export default PricingTable;`,
  'pricing-table.css': `.pricing-container {
  display: flex;
  gap: 1rem;
  font-family: sans-serif;
}
.pricing-tier {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 1.5rem;
  flex: 1;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}
.pricing-tier.selected {
  transform: scale(1.05);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-color: #4f46e5;
}
.tier-button {
  background-color: #4f46e5;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
}`,
};

// --- SUB-COMPONENTS ---

const BlueprintForm = ({ formData, setFormData, onGenerate, isLoading }: any) => (
  <div className="animate-fade-in">
    <div className="flex items-center gap-3 mb-2">
      <div className="bg-green-100 text-green-700 p-2 rounded-lg"><Settings size={20} /></div>
      <h2 className="text-2xl font-bold text-gray-800">Component Blueprint</h2>
    </div>
    <p className="text-gray-500 mb-6">Provide detailed specifications for the AI to generate accurate, high-quality code.</p>
    
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Component Description</label>
        <Input type="text" value={formData.description} onChange={(e: any) => setFormData({...formData, description: e.target.value})} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Framework</label>
          <select value={formData.framework} onChange={(e: any) => setFormData({...formData, framework: e.target.value})} className="w-full p-2 border border-input rounded-lg bg-background">
            <option>React</option><option>Vue</option><option>Svelte</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
          <select value={formData.language} onChange={(e: any) => setFormData({...formData, language: e.target.value})} className="w-full p-2 border border-input rounded-lg bg-background">
            <option>JavaScript</option><option>TypeScript</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Styling</label>
          <select value={formData.styling} onChange={(e: any) => setFormData({...formData, styling: e.target.value})} className="w-full p-2 border border-input rounded-lg bg-background">
            <option>Tailwind CSS</option><option>CSS Modules</option><option>Styled Components</option>
          </select>
        </div>
         <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1"><Layers size={14}/> Tech Stack</label>
          <Input type="text" value={formData.techStack} onChange={(e: any) => setFormData({...formData, techStack: e.target.value})} placeholder="e.g., Next.js, Vite, Firebase" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Data Schema <span className="text-gray-400 font-normal">(Optional)</span>
        </label>
        <p className="text-xs text-gray-500 mb-2">Providing an example schema helps the AI generate more accurate code.</p>
        <Textarea value={formData.schema} onChange={(e: any) => setFormData({...formData, schema: e.target.value})} className="font-mono text-xs" rows={4} />
      </div>
    </div>
    <Button onClick={onGenerate} disabled={isLoading} className="w-full mt-6 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:bg-green-300">
      {isLoading ? <Loader className="animate-spin" size={20} /> : <Sparkles size={20} />}
      {isLoading ? 'Generating...' : 'Generate Component'}
    </Button>
  </div>
);

const AnatomyPanel = () => (
    <div className="bg-white rounded-lg p-4 border h-full">
        <h3 className="font-semibold text-sm mb-3">Component Anatomy</h3>
        <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
                <Puzzle size={18} className="text-blue-500 mt-0.5"/>
                <div>
                    <h4 className="font-semibold">Visual Structure</h4>
                    <div className="text-xs text-gray-600 mt-1 font-mono bg-gray-100 p-2 rounded">
                        div.pricing-container<br/>
                        &nbsp;&nbsp;└ div.pricing-tier (map)<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;├ h3.tier-name<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;├ p.tier-price<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;├ ul.tier-features<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;└ button.tier-button<br/>
                    </div>
                </div>
            </div>
            <div className="flex items-start gap-3">
                <GitMerge size={18} className="text-purple-500 mt-0.5"/>
                <div>
                    <h4 className="font-semibold">Props & State</h4>
                    <p className="text-xs text-gray-600 mt-1"><code className="bg-gray-200 px-1 rounded">data</code>: array (required)</p>
                    <p className="text-xs text-gray-600 mt-0.5"><code className="bg-gray-200 px-1 rounded">theme</code>: string (optional, default: 'light')</p>
                    <p className="text-xs text-gray-600 mt-0.5"><code className="bg-gray-200 px-1 rounded">selectedTier</code>: internal state</p>
                </div>
            </div>
             <div className="flex items-start gap-3">
                <Share2 size={18} className="text-orange-500 mt-0.5"/>
                <div>
                    <h4 className="font-semibold">Dependencies</h4>
                    <p className="text-xs text-gray-600 mt-1"><code className="bg-gray-200 px-1 rounded">react</code> (useState)</p>
                    <p className="text-xs text-gray-600 mt-0.5"><code className="bg-gray-200 px-1 rounded">./pricing-table.css</code></p>
                </div>
            </div>
            <div className="flex items-start gap-3">
                <BrainCircuit size={18} className="text-green-500 mt-0.5"/>
                <div>
                    <h4 className="font-semibold">AI Logic Explanation</h4>
                    <p className="text-xs text-gray-600 mt-1">This component maps over a `data` prop to render pricing tiers. It uses an internal `selectedTier` state to track which tier is clicked, applying a 'selected' class for styling.</p>
                </div>
            </div>
        </div>
    </div>
);

const WorkbenchView = ({ code, chatHistory, onRefine, onGoBack }: any) => {
  const [activeFile, setActiveFile] = useState('pricing-table.jsx');
  const [refinePrompt, setRefinePrompt] = useState('');

  const handleRefine = () => {
    if (!refinePrompt.trim()) return;
    onRefine(refinePrompt);
    setRefinePrompt('');
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">AI Code Workbench</h2>
          <Button onClick={onGoBack} variant="ghost" size="sm"><ArrowLeft size={16} /> Back to Blueprint</Button>
      </div>
      <div className="grid grid-cols-12 gap-4">
        {/* File Tree */}
        <div className="col-span-2 bg-gray-50 rounded-lg p-3">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2"><Folder size={16} /> Files</h3>
          {Object.keys(code).map(filename => (
            <Button key={filename} onClick={() => setActiveFile(filename)} variant={activeFile === filename ? 'secondary' : 'ghost'} size="sm" className='w-full justify-start gap-2'>
              <File size={14} /> {filename}
            </Button>
          ))}
          <Button className="w-full mt-4" variant="outline"><Download size={14}/> Download ZIP</Button>
        </div>

        {/* Code Editor & Chat */}
        <div className="col-span-5 flex flex-col gap-4">
          <div className="flex-grow bg-gray-800 text-white rounded-lg p-4 relative h-96">
              <Button onClick={() => navigator.clipboard.writeText(code[activeFile])} size="icon" variant="ghost" className="absolute top-2 right-2 h-7 w-7 text-gray-300 hover:bg-gray-600 hover:text-white"><Copy size={14}/></Button>
              <pre className="h-full overflow-auto text-xs whitespace-pre-wrap">{code[activeFile]}</pre>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2"><Terminal size={16}/> Refinement Chat</h3>
              <div className="h-24 overflow-y-auto space-y-2 text-sm mb-2">
                  {chatHistory.map((msg: any, i: number) => (
                      <div key={i} className="flex gap-2 items-start">
                          {msg.sender === 'user' ? <User size={14} className="mt-0.5 text-blue-500"/> : <Bot size={14} className="mt-0.5 text-green-500"/>}
                          <p>{msg.text}</p>
                      </div>
                  ))}
              </div>
              <div className="flex gap-2">
                  <Input type="text" value={refinePrompt} onChange={e => setRefinePrompt(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleRefine()} placeholder="e.g., 'Add a hover effect to the button'" className="text-sm"/>
                  <Button onClick={handleRefine} className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700"><ArrowRight size={16}/></Button>
              </div>
          </div>
        </div>
        
        {/* Anatomy Panel */}
        <div className="col-span-5">
          <AnatomyPanel />
        </div>
      </div>
    </div>
  );
};


const AICoderView: React.FC<any> = ({
    step,
    isLoading,
    generatedCode,
    chatHistory,
    formData,
    setFormData,
    onGenerate,
    onRefine,
    onGoBack
}) => {
    
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 flex items-center">
                            <span className="p-2 bg-green-100 text-green-500 rounded-lg mr-3"><Code className="h-5 w-5" /></span>
                            AI Coder
                        </h2>
                        <p className="text-sm text-gray-500 ml-10">Your AI-powered coding assistant</p>
                    </div>
                    <button className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">12 XP per component</button>
                </div>
            </CardHeader>
            <CardContent>
                {step === 'blueprint' ? (
                  <BlueprintForm formData={formData} setFormData={setFormData} onGenerate={onGenerate} isLoading={isLoading} />
                ) : (
                  <WorkbenchView code={generatedCode} chatHistory={chatHistory} onRefine={onRefine} onGoBack={onGoBack} />
                )}
            </CardContent>
        </Card>
    );
};

export default AICoderView;
