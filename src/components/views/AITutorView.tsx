
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { BookOpen, Award, BarChart2, CheckSquare, Clock, User, DownloadCloud, Activity, Zap, BrainCircuit, MessageSquare, Loader, Send, FileQuestion, Star, BarChart, BookCopy } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { TutorMode, QuizState, QuizConfig, TutorChatHistory } from '@/app/page';
import type { QuizQuestion, EvaluateQuizOutput } from '@/ai/schemas/tutor-schemas';
import { useToast } from "@/hooks/use-toast";
import { interactiveLearn } from '@/ai/flows/tutor-interactive-learn-flow';
import { generateQuiz, evaluateQuiz } from '@/ai/flows/tutor-quiz-flow';
import { marked } from 'marked';


// --- Dashboard Sub-component ---
const ProgressRing = ({ percent = 0, size = 72, stroke = 8 }) => {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;
    return (
        <svg width={size} height={size} className="inline-block">
            <defs>
                <linearGradient id="g1" x1="0%" x2="100%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
            </defs>
            <g transform={`translate(${size / 2}, ${size / 2})`}>
                <circle r={radius} fill="transparent" stroke="#e6eefb" strokeWidth={stroke} />
                <circle r={radius} fill="transparent" stroke="url(#g1)" strokeWidth={stroke} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90)" />
                <text x="0" y="4" textAnchor="middle" fontSize="14" fontWeight="600" fill="#0f172a">{percent}%</text>
            </g>
        </svg>
    );
};

const DashboardView = () => {
    const mockAnalytics = [{ day: "Mon", score: 55 }, { day: "Tue", score: 68 }, { day: "Wed", score: 72 }, { day: "Thu", score: 80 }, { day: "Fri", score: 76 }, { day: "Sat", score: 82 }, { day: "Sun", score: 88 }];
    const mockBadges = [{ id: 1, name: "Consistency", unlocked: true }, { id: 2, name: "Fast Learner", unlocked: true }, { id: 3, name: "Accuracy", unlocked: false }, { id: 4, name: "Quiz Champ", unlocked: false }];
    const mockReports = [{ id: 1, topic: "Arrays", mastery: 78 }, { id: 2, topic: "Sorting", mastery: 64 }, { id: 3, topic: "Graphs", mastery: 42 }];
    const progress = 68;
    const nextQuiz = { title: "Recursion Practice", time: "10 mins", questions: 8 };

    return (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3"><ProgressRing percent={progress} /><div className="font-semibold">{progress}% complete</div></div>
                    <div className="text-right"><div className="text-xs text-slate-500">Streak</div><div className="font-semibold flex items-center gap-1"><Zap size={14} /> 5 days</div></div>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                    <div className="flex items-center justify-between"><div className="font-medium">Next Quiz</div><div className="text-xs text-slate-500">{nextQuiz.time}</div></div>
                    <div className="mt-2 flex items-center justify-between"><div><div className="font-semibold">{nextQuiz.title}</div><div className="text-xs text-slate-500">{nextQuiz.questions} questions</div></div><button className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm">Start</button></div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="font-medium mb-2">Badges <span className="text-xs text-slate-500">2/4</span></div>
                    <div className="flex gap-2 overflow-x-auto pb-1">{mockBadges.map((b) => (<div key={b.id} className={`min-w-[86px] px-3 py-2 rounded-md border ${b.unlocked ? "bg-white" : "bg-slate-100 opacity-70"}`}><div className="text-xs font-semibold">{b.name}</div><div className="text-[11px] text-slate-500">{b.unlocked ? "Unlocked" : "Locked"}</div></div>))}</div>
                </div>
            </div>
            <div className="md:col-span-2 p-3 bg-white rounded-lg border">
                <div className="flex items-center justify-between"><div className="font-semibold">Weekly Performance</div><div className="text-xs text-slate-500">Last 7 days</div></div>
                <div className="mt-3 h-36">
                    <ResponsiveContainer width="100%" height="100%"><LineChart data={mockAnalytics} margin={{ top: 0, right: 8, left: -10, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="day" tickLine={false} axisLine={false} /><YAxis domain={[40, 100]} hide /><Tooltip /><Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{ r: 3 }} /></LineChart></ResponsiveContainer>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="p-2 rounded-md bg-slate-50 flex items-center justify-between"><div><div className="text-xs text-slate-500">Avg Score</div><div className="font-semibold">76%</div></div><Activity size={20} /></div>
                    <div className="p-2 rounded-md bg-slate-50 flex items-center justify-between"><div><div className="text-xs text-slate-500">Time Spent</div><div className="font-semibold">3h 20m</div></div><Clock size={18} /></div>
                </div>
                <div className="mt-3"><div className="text-xs text-slate-500 mb-2">Quick Reports</div><div className="grid grid-cols-3 gap-2 text-sm">{mockReports.map((r) => (<div key={r.id} className="p-2 bg-slate-50 rounded-md"><div className="font-medium">{r.topic}</div><div className="text-xs text-slate-500">Mastery {r.mastery}%</div></div>))}</div></div>
            </div>
        </div>
    );
};

// --- Interactive Learn Sub-component ---
const InteractiveLearnView = ({ topic, setTopic, chatHistory, setChatHistory, isLoading, setIsLoading }) => {
    const [userInput, setUserInput] = React.useState('');
    const chatContainerRef = React.useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    React.useEffect(() => {
        chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
    }, [chatHistory]);

    const handleSendMessage = async (message: string) => {
        if (!message.trim() || !topic.trim()) {
            toast({ variant: 'destructive', title: "Topic Required", description: "Please enter a topic to start learning." });
            return;
        }

        const newHistory: TutorChatHistory[] = [...chatHistory, { role: 'user', content: message }];
        setChatHistory(newHistory);
        setUserInput('');
        setIsLoading(true);

        try {
            const result = await interactiveLearn({ topic, chatHistory: newHistory });
            setChatHistory(prev => [...prev, { role: 'model', content: result.response }]);
        } catch (err) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to get a response from the AI tutor.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartSession = () => {
      handleSendMessage("Let's start!");
    }

    return (
        <div className="mt-4">
            <div className="flex gap-2 mb-4">
                <Input placeholder="Enter a topic to learn (e.g., 'React Hooks')" value={topic} onChange={(e) => setTopic(e.target.value)} disabled={chatHistory.length > 0} />
                <Button onClick={handleStartSession} disabled={chatHistory.length > 0 || isLoading}>Start Session</Button>
            </div>
            <div className="h-[50vh] bg-slate-50 rounded-lg p-4 overflow-y-auto" ref={chatContainerRef}>
                {chatHistory.length === 0 && (
                    <div className="text-center text-slate-500 h-full flex flex-col justify-center items-center">
                        <BookCopy size={48} className="mb-4 text-slate-300" />
                        <h3 className="text-lg font-semibold">Ready to learn?</h3>
                        <p>Enter a topic above and start your interactive session.</p>
                    </div>
                )}
                <div className="space-y-4">
                    {chatHistory.map((msg, index) => (
                        <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center flex-shrink-0"><Star size={16} /></div>}
                            <div className={`max-w-xl p-3 rounded-lg prose prose-sm ${msg.role === 'user' ? 'bg-blue-100' : 'bg-white shadow'}`} dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) }}></div>
                            {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0"><User size={16} /></div>}
                        </div>
                    ))}
                    {isLoading && <div className="flex justify-start"><Loader className="animate-spin text-indigo-500" /></div>}
                </div>
            </div>
            <div className="mt-4 flex gap-2">
                <Input placeholder="Type your message..." value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(userInput)} disabled={isLoading || chatHistory.length === 0} />
                <Button onClick={() => handleSendMessage(userInput)} disabled={isLoading || chatHistory.length === 0}><Send size={16} /></Button>
            </div>
        </div>
    );
};

// --- Quiz Sub-component ---
const QuizView = ({ quizState, setQuizState, config, setConfig, questions, setQuestions, answers, setAnswers, result, setResult, isLoading, setIsLoading }) => {
    const { toast } = useToast();

    const handleGenerateQuiz = async () => {
        setIsLoading(true);
        try {
            const res = await generateQuiz(config);
            setQuestions(res.questions);
            setAnswers(new Array(res.questions.length).fill(''));
            setResult(null);
            setQuizState('taking');
        } catch (err) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate quiz.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswerChange = (index, value) => {
        const newAnswers = [...answers];
        newAnswers[index] = value;
        setAnswers(newAnswers);
    };
    
    const handleSubmitQuiz = async () => {
        setIsLoading(true);
        try {
            const res = await evaluateQuiz({ questions, userAnswers: answers });
            setResult(res);
            setQuizState('result');
        } catch (err) {
             toast({ variant: 'destructive', title: 'Error', description: 'Failed to evaluate quiz.' });
        } finally {
            setIsLoading(false);
        }
    };

    if (quizState === 'config') {
        return (
            <div className="mt-4 max-w-md mx-auto">
                <div className="space-y-4">
                    <div><Label>Topic</Label><Input value={config.topic} onChange={(e) => setConfig({ ...config, topic: e.target.value })} /></div>
                    <div>
                        <Label>Number of Questions</Label>
                        <Input 
                            type="number" 
                            value={config.numQuestions} 
                            onChange={(e) => {
                                const num = parseInt(e.target.value);
                                setConfig({ ...config, numQuestions: isNaN(num) ? 0 : num });
                            }} 
                            min="1" 
                            max="10" 
                        />
                    </div>
                    <div><Label>Difficulty</Label><RadioGroup value={config.difficulty} onValueChange={(v) => setConfig({ ...config, difficulty: v })} className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="Easy" id="r1" /><Label htmlFor="r1">Easy</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="Medium" id="r2" /><Label htmlFor="r2">Medium</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="Hard" id="r3" /><Label htmlFor="r3">Hard</Label></div></RadioGroup></div>
                    <Button onClick={handleGenerateQuiz} disabled={isLoading} className="w-full">{isLoading ? <Loader className="animate-spin" /> : 'Start Quiz'}</Button>
                </div>
            </div>
        );
    }
    
    if (quizState === 'taking') {
        return (
            <div className="mt-4 space-y-6">
                {questions.map((q, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                        <p className="font-semibold mb-2">{i + 1}. {q.questionText}</p>
                        {q.questionType === 'multiple-choice' ? (
                            <RadioGroup onValueChange={(v) => handleAnswerChange(i, v)}><div className="space-y-2">{q.options.map((opt, j) => (<div key={j} className="flex items-center space-x-2"><RadioGroupItem value={opt} id={`q${i}o${j}`} /><Label htmlFor={`q${i}o${j}`}>{opt}</Label></div>))}</div></RadioGroup>
                        ) : (
                            <Input placeholder="Type your answer..." onChange={(e) => handleAnswerChange(i, e.target.value)} />
                        )}
                    </div>
                ))}
                <Button onClick={handleSubmitQuiz} disabled={isLoading} className="w-full">{isLoading ? <Loader className="animate-spin" /> : 'Submit Answers'}</Button>
            </div>
        );
    }

    if (quizState === 'result' && result) {
        return (
            <div className="mt-4 space-y-4">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <h3 className="text-xl font-bold">Quiz Complete!</h3>
                    <p className="text-3xl font-bold text-indigo-600 my-2">{result.score.toFixed(0)}%</p>
                    <p className="text-slate-600">{result.feedback}</p>
                </div>
                {result.results.map((r, i) => (
                    <div key={i} className={`p-4 border rounded-lg ${r.isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                        <p className="font-semibold">{r.question}</p>
                        <p>Your answer: <span className={r.isCorrect ? 'text-green-700' : 'text-red-700'}>{r.userAnswer}</span></p>
                        {!r.isCorrect && <p>Correct answer: {r.correctAnswer}</p>}
                        <p className="text-sm text-slate-500 mt-2"><em>Explanation: {r.explanation}</em></p>
                    </div>
                ))}
                <Button onClick={() => setQuizState('config')} className="w-full">Take Another Quiz</Button>
            </div>
        );
    }

    return null;
};

// --- Main View Component ---
interface AITutorViewProps {
    tutorMode: TutorMode;
    setTutorMode: (mode: TutorMode) => void;
    chatHistory: TutorChatHistory[];
    setChatHistory: (history: TutorChatHistory[]) => void;
    learnTopic: string;
    setLearnTopic: (topic: string) => void;
    quizState: QuizState;
    setQuizState: (state: QuizState) => void;
    quizConfig: QuizConfig;
    setQuizConfig: (config: QuizConfig) => void;
    quizQuestions: QuizQuestion[];
    setQuizQuestions: (questions: QuizQuestion[]) => void;
    quizAnswers: string[];
    setQuizAnswers: (answers: string[]) => void;
    quizResult: EvaluateQuizOutput | null;
    setQuizResult: (result: EvaluateQuizOutput | null) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

const AITutorView: React.FC<AITutorViewProps> = (props) => {
    const renderContent = () => {
        switch (props.tutorMode) {
            case 'dashboard': return <DashboardView />;
            case 'learn': return <InteractiveLearnView topic={props.learnTopic} setTopic={props.setLearnTopic} chatHistory={props.chatHistory} setChatHistory={props.setChatHistory} isLoading={props.isLoading} setIsLoading={props.setIsLoading} />;
            case 'quiz': return <QuizView quizState={props.quizState} setQuizState={props.setQuizState} config={props.quizConfig} setConfig={props.setQuizConfig} questions={props.quizQuestions} setQuestions={props.setQuizQuestions} answers={props.quizAnswers} setAnswers={props.setAnswers} result={props.quizResult} setResult={props.setQuizResult} isLoading={props.isLoading} setIsLoading={props.setIsLoading} />;
            default: return <DashboardView />;
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 flex items-center">
                            <span className="p-2 bg-orange-100 text-orange-500 rounded-lg mr-3"><BookOpen className="h-5 w-5" /></span>
                            AI Tutor
                        </h2>
                        <p className="text-sm text-gray-500 ml-10">Your personalized learning companion</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="border-b mb-4">
                    <nav className="-mb-px flex space-x-6">
                        <button onClick={() => props.setTutorMode('dashboard')} className={`py-3 px-1 border-b-2 font-medium text-sm ${props.tutorMode === 'dashboard' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}><BarChart size={16} className="inline-block mr-2" />Dashboard</button>
                        <button onClick={() => props.setTutorMode('learn')} className={`py-3 px-1 border-b-2 font-medium text-sm ${props.tutorMode === 'learn' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}><MessageSquare size={16} className="inline-block mr-2" />Interactive Learn</button>
                        <button onClick={() => props.setTutorMode('quiz')} className={`py-3 px-1 border-b-2 font-medium text-sm ${props.tutorMode === 'quiz' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}><FileQuestion size={16} className="inline-block mr-2" />Take a Quiz</button>
                    </nav>
                </div>
                <motion.div key={props.tutorMode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    {renderContent()}
                </motion.div>
            </CardContent>
        </Card>
    );
};

export default AITutorView;
