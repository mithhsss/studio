import React from 'react';
import { Bot, Package, WandSparkles } from 'lucide-react';

const DefaultHeader = () => (
    <header className="bg-gradient-to-r from-orange-400 to-red-500 rounded-xl p-6 text-white shadow-lg flex justify-between items-center">
        <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-lg">
                <Package size={28} className="text-white" />
            </div>
            <div>
                <h1 className="text-2xl font-bold">Select an AI Tool</h1>
                <p className="text-white/80">Choose a tool to start your AI-powered journey</p>
            </div>
        </div>
        <button className="bg-white/90 text-orange-500 font-semibold py-2 px-4 rounded-full shadow-md hover:bg-white transition-colors duration-300 flex items-center gap-2 text-sm">
            <WandSparkles size={16} />
            AI Powered
        </button>
    </header>
);

const WelcomeMessage = () => (
    <div className="bg-white rounded-xl shadow-md p-8 lg:p-16 text-center flex flex-col items-center justify-center">
        <div className="bg-gray-100 p-6 rounded-full mb-6">
            <Bot size={48} className="text-gray-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800">Welcome to AI Tools</h2>
        <p className="text-gray-500 mt-2 max-w-md">
            Select an AI tool from the sidebar to start creating amazing content!
        </p>
    </div>
);

const DefaultView = () => {
    return (
        <div className="space-y-8">
            <DefaultHeader />
            <WelcomeMessage />
        </div>
    );
};

export default DefaultView;
