import React, { useEffect, useState, useRef } from 'react';
import { Server, Activity, Search, BrainCircuit, CheckCircle2, Terminal, Loader2 } from 'lucide-react';

interface AnalysisPanelProps {
  query: string;
}

const STEPS = [
  { id: 1, label: '环境感知与连接', sub: 'Connecting to MCP Server...', icon: Server },
  { id: 2, label: '全链路数据采集', sub: 'Retrieving Logs & Metrics...', icon: Activity },
  { id: 3, label: '异常特征提取', sub: 'Analyzing Patterns...', icon: Search },
  { id: 4, label: '多维根因推理', sub: 'Reasoning...', icon: BrainCircuit },
  { id: 5, label: '生成诊断报告', sub: 'Finalizing...', icon: CheckCircle2 },
];

const LOG_TEMPLATES = {
  default: [
    "> Initializing SkyData Pilot Agent...",
    "> Connecting to secure gateway...",
    "> Verifying permissions for admin...",
    "> Connection established.",
  ],
  spark: [
    "> Detected Spark Application ID.",
    "> Accessing YARN Resource Manager...",
    "> Fetching Container Logs (stderr/stdout)...",
    "> Analyzing EventLog for stage failures...",
    "> [WARN] Detected skew in Stage 2 task 14.",
    "> Calculating Shuffle write/read ratios...",
    "> Checking AQE configuration...",
  ],
  system: [
    "> Detected Kubernetes Pod ID.",
    "> Connecting to K8s API Server...",
    "> Querying Prometheus for container_memory_usage_bytes...",
    "> [ALERT] Heap usage spike detected at 09:10:00.",
    "> Fetching last 100 lines of application logs...",
    "> Grepping for 'OutOfMemoryError'...",
    "> Analyzing GC logs (ParNew/CMS)...",
    "> [CRITICAL] Full GC frequency > 15/min.",
    "> Identifying leaking objects via Heap Histogram...",
  ]
};

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ query }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Determine log type based on query
  const logType = query.includes('application') ? 'spark' : query.includes('pod') || query.includes('OOM') ? 'system' : 'default';

  useEffect(() => {
    // Step progression animation
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 800); 

    return () => clearInterval(stepInterval);
  }, []);

  useEffect(() => {
    // Log streaming animation
    let logIndex = 0;
    const baseLogs = LOG_TEMPLATES['default'];
    const specificLogs = LOG_TEMPLATES[logType as keyof typeof LOG_TEMPLATES] || [];
    const allLogs = [...baseLogs, ...specificLogs, ...specificLogs, ...specificLogs]; // Repeat for effect

    const logInterval = setInterval(() => {
      if (logIndex < allLogs.length) {
        const newLog = allLogs[logIndex];
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} ${newLog}`]);
        logIndex++;
      }
    }, 150);

    return () => clearInterval(logInterval);
  }, [logType]);

  useEffect(() => {
    // Auto scroll logs
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="max-w-4xl mx-auto mt-8 animate-fade-in">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col md:flex-row h-[500px]">
        
        {/* Left Side: Progress Steps */}
        <div className="w-full md:w-1/3 bg-gray-50 border-r border-gray-200 p-6 flex flex-col">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            AI 智能分析运行中
          </h2>
          
          <div className="space-y-6 relative">
            {/* Connecting Line */}
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200 z-0"></div>
            
            {STEPS.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              const Icon = step.icon;

              return (
                <div key={step.id} className="relative z-10 flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isActive ? 'bg-blue-600 border-blue-600 text-white shadow-md scale-110' : 
                    isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                    'bg-white border-gray-300 text-gray-300'
                  }`}>
                    {isCompleted ? <CheckCircle2 size={16} /> : 
                     isActive ? <Loader2 size={16} className="animate-spin" /> :
                     <Icon size={16} />}
                  </div>
                  <div className={`${isActive ? 'opacity-100' : isCompleted ? 'opacity-80' : 'opacity-40'} transition-opacity`}>
                    <div className="font-semibold text-sm text-gray-800">{step.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5 font-mono">{step.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Terminal / Thinking Process */}
        <div className="w-full md:w-2/3 bg-[#1e1e1e] p-6 font-mono text-sm flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400 mb-4 border-b border-gray-700 pb-2">
            <div className="flex items-center gap-2">
              <Terminal size={16} />
              <span>Diagnostic Console</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-green-400">Connected</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar" ref={scrollRef}>
            {logs.map((log, i) => (
              <div key={i} className="text-gray-300 break-all animate-fade-in-left">
                <span className="text-blue-500 mr-2">➜</span>
                <span className={log.includes('[CRITICAL]') ? 'text-red-400 font-bold' : log.includes('[WARN]') ? 'text-yellow-400' : ''}>
                    {log.split(' ').slice(1).join(' ')}
                </span>
              </div>
            ))}
            {logs.length > 0 && (
                <div className="w-2 h-4 bg-gray-400 animate-blink mt-1 inline-block"></div>
            )}
          </div>
          
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500 opacity-5 rounded-full blur-3xl pointer-events-none"></div>
        </div>
      </div>
      
      <p className="text-center text-gray-500 mt-4 text-sm animate-pulse">
        正在调用大数据运维领域知识库...
      </p>
    </div>
  );
};

export default AnalysisPanel;
