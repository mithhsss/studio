import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Map, Sparkles } from 'lucide-react';

interface AIRoadmapViewProps {
    isLoading: boolean;
    roadmapContent: string;
    handleGenerateRoadmap: () => void;
    error: string | null;
}

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
);

const AIRoadmapView: React.FC<AIRoadmapViewProps> = ({ isLoading, roadmapContent, handleGenerateRoadmap, error }) => {
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center">
                        <span className="p-2 bg-indigo-100 text-indigo-500 rounded-lg mr-3"><Map className="h-5 w-5" /></span>
                        AI Roadmap
                    </h2>
                    <button className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">10 XP per update</button>
                </div>
                <p className="text-sm text-gray-500 ml-10">Personalized career guidance and skill development</p>
            </CardHeader>
            <CardContent>
                {isLoading ? <LoadingSpinner /> : roadmapContent ? (
                    <div className="prose prose-indigo mt-6 max-w-none" dangerouslySetInnerHTML={{ __html: roadmapContent.replace(/\n/g, '<br />') }}></div>
                ) : (
                    <div className="mt-8 text-center">
                        <div className="flex items-center justify-center">
                            <Map size={48} className="text-indigo-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mt-4">Your UX Designer Roadmap</h3>
                        <p className="text-gray-600 mt-2 max-w-md mx-auto">Get a personalized career roadmap with skill recommendations, learning resources, and milestone tracking.</p>
                        <Button onClick={handleGenerateRoadmap} className="mt-6 bg-indigo-600 hover:bg-indigo-700">
                            <Sparkles className="h-4 w-4 inline-block mr-1" /> Generate Your Roadmap
                        </Button>
                    </div>
                )}
                {error && <p className="text-red-500 mt-2">{error}</p>}
            </CardContent>
        </Card>
    );
};

export default AIRoadmapView;
