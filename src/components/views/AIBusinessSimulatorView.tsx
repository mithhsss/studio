'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Building, DollarSign, Lightbulb, Loader, Target, User, Zap } from 'lucide-react';
import { runBusinessSimulation, type BusinessSimulationInput, type BusinessSimulationOutput } from '@/ai/flows/business-simulation-flow';
import { useToast } from "@/hooks/use-toast";

const ConfigView = ({ onStart, isLoading }: { onStart: (config: Omit<BusinessSimulationInput, 'history'>) => void, isLoading: boolean }) => {
  const [config, setConfig] = useState({
    businessIdea: 'An AI-powered meal planning app',
    userExpertise: 'Intermediate' as 'Novice' | 'Intermediate' | 'Expert',
    startingCapital: 10000,
    market: 'Health & Wellness Tech',
  });

  const handleStartClick = () => {
    if (config.businessIdea && config.market) {
      onStart(config);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800">Business Idea Simulator</h3>
        <p className="text-gray-500">Enter your business concept and see how it performs over time.</p>
      </div>
      <div className="space-y-4">
        <div>
          <Label htmlFor="businessIdea" className="flex items-center gap-2 mb-1"><Lightbulb size={16}/> Business Idea</Label>
          <Input id="businessIdea" value={config.businessIdea} onChange={(e) => setConfig({ ...config, businessIdea: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="market" className="flex items-center gap-2 mb-1"><Target size={16}/> Target Market</Label>
          <Input id="market" value={config.market} onChange={(e) => setConfig({ ...config, market: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="startingCapital" className="flex items-center gap-2 mb-1"><DollarSign size={16}/> Starting Capital</Label>
          <Input id="startingCapital" type="number" value={config.startingCapital} onChange={(e) => setConfig({ ...config, startingCapital: parseInt(e.target.value) || 0 })} />
        </div>
        <div>
          <Label className="flex items-center gap-2 mb-1"><User size={16}/> Your Expertise Level</Label>
          <RadioGroup value={config.userExpertise} onValueChange={(value) => setConfig({ ...config, userExpertise: value as any })} className="flex gap-4">
            <div className="flex items-center space-x-2"><RadioGroupItem value="Novice" id="r1" /><Label htmlFor="r1">Novice</Label></div>
            <div className="flex items-center space-x-2"><RadioGroupItem value="Intermediate" id="r2" /><Label htmlFor="r2">Intermediate</Label></div>
            <div className="flex items-center space-x-2"><RadioGroupItem value="Expert" id="r3" /><Label htmlFor="r3">Expert</Label></div>
          </RadioGroup>
        </div>
        <Button onClick={handleStartClick} disabled={isLoading} className="w-full !mt-6">
          {isLoading ? <Loader className="animate-spin" /> : 'Start Simulation'}
        </Button>
      </div>
    </div>
  );
};

const SimulationView = ({ simulationOutput, onMakeChoice, isLoading }: { simulationOutput: BusinessSimulationOutput, onMakeChoice: (choice: string) => void, isLoading: boolean }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 p-6 bg-gray-50 rounded-lg border">
        <h3 className="text-lg font-bold text-gray-800 mb-1">{simulationOutput.eventName}</h3>
        <p className="text-sm text-gray-500 mb-4">Year {simulationOutput.year}</p>
        <p className="text-gray-700">{simulationOutput.eventDescription}</p>
        
        <div className="mt-6">
          <h4 className="font-semibold mb-2">What will you do?</h4>
          <div className="space-y-3">
            {simulationOutput.choices.map((choice, index) => (
              <Button key={index} onClick={() => onMakeChoice(choice)} variant="outline" className="w-full justify-start text-left h-auto" disabled={isLoading}>
                {choice}
              </Button>
            ))}
          </div>
        </div>
        {isLoading && <div className="mt-4 flex items-center justify-center"><Loader className="animate-spin"/></div>}
      </div>
      <div className="md:col-span-1 space-y-4">
        <Card>
          <CardHeader><h4 className="font-bold">Financials</h4></CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex justify-between"><span>Revenue:</span><span className="font-mono text-green-600">${simulationOutput.financialSummary.revenue.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Expenses:</span><span className="font-mono text-red-600">${simulationOutput.financialSummary.expenses.toLocaleString()}</span></div>
            <div className="flex justify-between font-bold"><span>Profit:</span><span className="font-mono">${simulationOutput.financialSummary.profit.toLocaleString()}</span></div>
            <div className="flex justify-between pt-2 border-t font-bold"><span>Capital:</span><span className="font-mono">${simulationOutput.financialSummary.capital.toLocaleString()}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


interface AIBusinessSimulatorViewProps {
  history: any[];
  setHistory: (history: any[]) => void;
  simulationOutput: BusinessSimulationOutput | null;
  setSimulationOutput: (output: BusinessSimulationOutput | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const AIBusinessSimulatorView: React.FC<AIBusinessSimulatorViewProps> = ({
  history,
  setHistory,
  simulationOutput,
  setSimulationOutput,
  isLoading,
  setIsLoading,
}) => {
  const { toast } = useToast();
  const [initialConfig, setInitialConfig] = useState<Omit<BusinessSimulationInput, 'history'> | null>(null);

  const handleStartSimulation = async (config: Omit<BusinessSimulationInput, 'history'>) => {
    setIsLoading(true);
    setInitialConfig(config);
    setHistory([]);
    try {
      const result = await runBusinessSimulation({ ...config, history: [] });
      setSimulationOutput(result);
      setHistory(prev => [...prev, { role: 'model', content: `${result.eventName}: ${result.eventDescription}` }]);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Simulation Error', description: err.message || 'Failed to start simulation.' });
      setInitialConfig(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMakeChoice = async (choice: string) => {
    if (!initialConfig) return;
    setIsLoading(true);
    const newHistory = [...history, { role: 'user', content: choice }];
    setHistory(newHistory);
    try {
      const result = await runBusinessSimulation({ ...initialConfig, history: newHistory });
      setSimulationOutput(result);
       setHistory(prev => [...prev, { role: 'model', content: `${result.eventName}: ${result.eventDescription}` }]);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Simulation Error', description: err.message || 'Failed to process turn.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                    <span className="p-2 bg-red-100 text-red-500 rounded-lg mr-3"><Building className="h-5 w-5" /></span>
                    Business Simulator
                </h2>
                <p className="text-sm text-gray-500 ml-10">Test your entrepreneurial spirit.</p>
            </div>
            <button className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">15 XP per simulation</button>
        </div>
      </CardHeader>
      <CardContent>
        {!simulationOutput ? (
          <ConfigView onStart={handleStartSimulation} isLoading={isLoading} />
        ) : (
          <SimulationView simulationOutput={simulationOutput} onMakeChoice={handleMakeChoice} isLoading={isLoading} />
        )}
      </CardContent>
    </Card>
  );
};

export default AIBusinessSimulatorView;
