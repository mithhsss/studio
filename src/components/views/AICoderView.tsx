import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Code, WandSparkles, Loader } from 'lucide-react';

interface AICoderViewProps {
    isLoading: boolean;
    generatedCode: string;
    handleGenerateCode: (e: React.FormEvent<HTMLFormElement>) => void;
}

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
);

const AICoderView: React.FC<AICoderViewProps> = ({ isLoading, generatedCode, handleGenerateCode }) => {
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
                <form onSubmit={handleGenerateCode} className="space-y-4">
                    <Textarea name="description" placeholder="Describe the component you want to build... e.g., 'A responsive pricing table with three tiers'" required disabled={isLoading} rows={4} />
                    <Button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700">
                        {isLoading ? 'Writing Code...' : 'Generate Code'}
                        <WandSparkles className="ml-2" size={16} />
                    </Button>
                </form>
                {isLoading && !generatedCode && <LoadingSpinner />}
                {generatedCode && (
                    <div className="mt-6">
                        <h3 className="font-bold mb-2">Generated Code:</h3>
                        <pre className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto text-sm">
                            <code>{generatedCode}</code>
                        </pre>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default AICoderView;
