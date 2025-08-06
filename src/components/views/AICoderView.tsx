import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Code, Settings, Terminal, ArrowRight, Bot, User, File, Folder, Download, Copy, Sparkles, Loader, Puzzle, GitMerge, BrainCircuit, Share2, ArrowLeft, Layers } from 'lucide-react';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import type { CoderStep } from '@/app/page';
import type { GenerateCodeOutput } from '@/ai/flows/generate-code-flow';
import { refineCode } from '@/ai/flows/refine-code-flow';
import { useToast } from "@/hooks/use-toast";
import JSZip from 'jszip';
import { generateCode } from '@/ai/flows/generate-code-flow';


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

const AnatomyPanel = ({ anatomy }: { anatomy: GenerateCodeOutput['anatomy'] }) => (
    <div className="bg-white rounded-lg p-4 border h-full overflow-y-auto">
        <h3 className="font-semibold text-sm mb-3">Component Anatomy</h3>
        <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
                <Puzzle size={18} className="text-blue-500 mt-0.5 flex-shrink-0"/>
                <div>
                    <h4 className="font-semibold">Visual Structure</h4>
                    <div className="text-xs text-gray-600 mt-1 font-mono bg-gray-100 p-2 rounded whitespace-pre-wrap">
                        {anatomy.visualStructure}
                    </div>
                </div>
            </div>
            <div className="flex items-start gap-3">
                <GitMerge size={18} className="text-purple-500 mt-0.5 flex-shrink-0"/>
                <div>
                    <h4 className="font-semibold">Props & State</h4>
                    {anatomy.propsAndState.map((item, index) => (
                        <p key={index} className="text-xs text-gray-600 mt-0.5"><code className="bg-gray-200 px-1 rounded">{item}</code></p>
                    ))}
                </div>
            </div>
             <div className="flex items-start gap-3">
                <Share2 size={18} className="text-orange-500 mt-0.5 flex-shrink-0"/>
                <div>
                    <h4 className="font-semibold">Dependencies</h4>
                     {anatomy.dependencies.map((item, index) => (
                        <p key={index} className="text-xs text-gray-600 mt-0.5"><code className="bg-gray-200 px-1 rounded">{item}</code></p>
                    ))}
                </div>
            </div>
            <div className="flex items-start gap-3">
                <BrainCircuit size={18} className="text-green-500 mt-0.5 flex-shrink-0"/>
                <div>
                    <h4 className="font-semibold">AI Logic Explanation</h4>
                    <p className="text-xs text-gray-600 mt-1">{anatomy.logicExplanation}</p>
                </div>
            </div>
        </div>
    </div>
);

const WorkbenchView = ({ generatedCode, setGeneratedCode, chatHistory, setChatHistory, onGoBack }: any) => {
  const { toast } = useToast();
  const [activeFile, setActiveFile] = useState(generatedCode.files[0]?.filename || '');
  const [refinePrompt, setRefinePrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  const handleRefine = async () => {
    if (!refinePrompt.trim()) return;

    const userMessage = { sender: 'user', text: refinePrompt };
    setChatHistory((prev: any) => [...prev, userMessage]);
    setRefinePrompt('');
    setIsRefining(true);

    try {
        const result = await refineCode({
            prompt: refinePrompt,
            files: generatedCode.files,
        });

        const updatedFilesMap = new Map(result.modifiedFiles.map(file => [file.filename, file.code]));

        const newFiles = generatedCode.files.map((file: any) => {
            if (updatedFilesMap.has(file.filename)) {
                return { ...file, code: updatedFilesMap.get(file.filename) };
            }
            return file;
        });

        setGeneratedCode({ ...generatedCode, files: newFiles });
        
        const aiResponse = { sender: 'ai', text: "Okay, I've updated the code based on your request. The files have been modified." };
        setChatHistory((prev: any) => [...prev, aiResponse]);

    } catch (err) {
        toast({
            variant: "destructive",
            title: "Refinement Failed",
            description: "There was a problem refining the code. Please try again.",
        });
        const aiErrorResponse = { sender: 'ai', text: "Sorry, I encountered an error while trying to modify the code." };
        setChatHistory((prev: any) => [...prev, aiErrorResponse]);
    } finally {
        setIsRefining(false);
    }
  };
  
  const handleDownloadZip = async () => {
    const zip = new JSZip();
    generatedCode.files.forEach((file: {filename: string, code: string}) => {
        zip.file(file.filename, file.code);
    });
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(zipBlob);
    link.download = "ai-generated-component.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const activeFileContent = generatedCode.files.find((f: any) => f.filename === activeFile)?.code || '';

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">AI Code Workbench</h2>
          <Button onClick={onGoBack} variant="ghost" size="sm"><ArrowLeft size={16} /> Back to Blueprint</Button>
      </div>
      <div className="min-h-[60vh]">
          <PanelGroup direction="horizontal" className="w-full h-full">
              <Panel defaultSize={20} minSize={15}>
                  <div className="bg-gray-50 rounded-lg p-3 h-full overflow-y-auto">
                      <h3 className="font-semibold text-sm mb-2 flex items-center gap-2"><Folder size={16} /> Files</h3>
                      {generatedCode.files.map((file: any) => (
                          <Button key={file.filename} onClick={() => setActiveFile(file.filename)} variant={activeFile === file.filename ? 'secondary' : 'ghost'} size="sm" className="w-full justify-start text-left h-auto px-2 py-1">
                              <File size={14} className="mr-2 flex-shrink-0" />
                              <span className="truncate">{file.filename}</span>
                          </Button>
                      ))}
                      <Button onClick={handleDownloadZip} className="w-full mt-4" variant="outline"><Download size={14}/> Download ZIP</Button>
                  </div>
              </Panel>
              <PanelResizeHandle className="w-2 bg-transparent hover:bg-gray-200 active:bg-gray-300 transition-colors rounded-full mx-1" />
              <Panel defaultSize={50} minSize={30}>
                  <div className="flex flex-col gap-4 h-full">
                      <div className="flex-grow bg-gray-800 text-white rounded-lg p-4 relative h-[45vh] overflow-hidden">
                          <Button onClick={() => navigator.clipboard.writeText(activeFileContent)} size="icon" variant="ghost" className="absolute top-2 right-2 h-7 w-7 text-gray-300 hover:bg-gray-600 hover:text-white"><Copy size={14}/></Button>
                          <pre className="h-full overflow-auto text-xs whitespace-pre-wrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">{activeFileContent}</pre>
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
                              {isRefining && <Loader className="animate-spin text-green-500" size={16} />}
                          </div>
                          <div className="flex gap-2">
                              <Input type="text" value={refinePrompt} onChange={e => setRefinePrompt(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleRefine()} placeholder="e.g., 'Add a hover effect to the button'" className="text-sm" disabled={isRefining} />
                              <Button onClick={handleRefine} className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700" disabled={isRefining}>
                                {isRefining ? <Loader className="animate-spin" size={16} /> : <ArrowRight size={16}/>}
                              </Button>
                          </div>
                      </div>
                  </div>
              </Panel>
              <PanelResizeHandle className="w-2 bg-transparent hover:bg-gray-200 active:bg-gray-300 transition-colors rounded-full mx-1" />
              <Panel defaultSize={30} minSize={20}>
                  <div className="h-full">
                      <AnatomyPanel anatomy={generatedCode.anatomy} />
                  </div>
              </Panel>
          </PanelGroup>
      </div>
    </div>
  );
};

interface AICoderViewProps {
    step: CoderStep;
    isLoading: boolean;
    generatedCode: GenerateCodeOutput | null;
    setGeneratedCode: (code: any) => void;
    chatHistory: any[];
    setCoderChatHistory: (history: any[]) => void;
    formData: any;
    setFormData: (data: any) => void;
    onGenerate: () => void;
    onGoBack: () => void;
}

const AICoderView: React.FC<AICoderViewProps> = ({
    step,
    isLoading,
    generatedCode,
    setGeneratedCode,
    chatHistory,
    setCoderChatHistory,
    formData,
    setFormData,
    onGenerate,
    onGoBack
}) => {
    const { toast } = useToast();

    const handleGenerateCode = async () => {
        setGeneratedCode(null);
        onGenerate(); // This just sets isLoading to true in the parent
        try {
            const result = await generateCode(formData);

            const componentName = formData.description.split(" ")[0].toLowerCase() || "component";

            // Create package.json content
            const dependencies = result.anatomy.dependencies.reduce((acc: any, dep: string) => {
                acc[dep.toLowerCase()] = "latest";
                return acc;
            }, {});
            const packageJsonContent = JSON.stringify({
                name: `ai-generated-${componentName}`,
                version: "1.0.0",
                description: `A component for: ${formData.description}`,
                main: result.files.find((f:any) => f.filename.endsWith('.js') || f.filename.endsWith('.jsx'))?.filename || 'index.js',
                scripts: { "test": "echo \"Error: no test specified\" && exit 1" },
                dependencies: dependencies,
                keywords: ["ai", "generated"],
                author: "AI Coder",
                license: "ISC"
            }, null, 2);

            // Create README.md content
            const readmeContent = `# ${componentName}\n\n${formData.description}\n\n## Installation\n\nRun \`npm install\` to install dependencies:\n\n\`\`\`bash\nnpm install ${Object.keys(dependencies).join(' ')}\n\`\`\`\n\n## Usage\n\nImport the main component into your application:\n\n\`\`\`javascript\nimport Component from './${result.files[0].filename}';\n\`\`\``;

            const finalResult = {
                ...result,
                files: [
                    ...result.files,
                    { filename: 'package.json', code: packageJsonContent },
                    { filename: 'README.md', code: readmeContent },
                ]
            };

            setGeneratedCode(finalResult);
            setCoderChatHistory([{ sender: 'ai', text: 'Component generated! Here is a breakdown of its anatomy.' }]);
            // onSetCoderStep('workbench') is handled in parent `page.tsx`
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Code Generation Failed",
                description: "There was a problem generating the code. Please try again.",
            });
            // onSetIsLoading(false) is handled in parent `page.tsx`
        }
    };
    
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
                  <BlueprintForm formData={formData} setFormData={setFormData} onGenerate={handleGenerateCode} isLoading={isLoading} />
                ) : generatedCode ? (
                  <WorkbenchView 
                    generatedCode={generatedCode}
                    setGeneratedCode={setGeneratedCode} 
                    chatHistory={chatHistory}
                    setChatHistory={setCoderChatHistory}
                    onGoBack={onGoBack} 
                  />
                ) : null}
            </CardContent>
        </Card>
    );
};

export default AICoderView;
