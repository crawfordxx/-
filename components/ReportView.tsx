import React, { useState } from 'react';
import { DiagnosticReport, Optimization, Issue } from '../types';
import { AlertTriangle, CheckCircle, Zap, ChevronDown, ChevronRight, Play, Terminal, Cpu, Database, AlertOctagon, ArrowRight, Share2 } from 'lucide-react';

interface ReportViewProps {
  report: DiagnosticReport;
}

const ReportView: React.FC<ReportViewProps> = ({ report }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-fade-in">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    {report.type === 'Spark' ? <Zap className="text-orange-500" size={20}/> : 
                     report.type === 'System' ? <Cpu className="text-purple-500" size={20} /> :
                     <Database className="text-indigo-500" size={20} />}
                    <h1 className="text-xl font-bold text-gray-900">{report.title}</h1>
                </div>
                <p className="text-sm text-gray-500">Analysis completed in 3.2s</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                report.status === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                report.status === 'Warning' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                'bg-green-50 text-green-700 border-green-200'
            }`}>
                {report.status === 'Critical' ? '严重异常' : '需要注意'}
            </span>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Terminal size={16} /> 诊断摘要分析
            </h3>
            <p className="text-gray-700 leading-relaxed text-sm">{report.summary}</p>
        </div>

        {report.metrics && (
            <div className="grid grid-cols-3 gap-4 mt-6">
                {report.metrics.map((metric, idx) => (
                    <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-500 uppercase">{metric.label}</div>
                        <div className="text-lg font-bold text-gray-900 mt-1">{metric.value}</div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Root Cause Analysis Graph (Only for System/OOM reports) */}
      {report.type === 'System' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-purple-50/30 flex items-center justify-between">
                  <h2 className="font-bold text-gray-800 flex items-center gap-2">
                      <Share2 size={18} className="text-purple-500"/>
                      因果关系链 (Root Cause Chain)
                  </h2>
              </div>
              <div className="p-8 overflow-x-auto">
                  <div className="flex items-center justify-between min-w-[600px] gap-4">
                      {/* Node 1 */}
                      <div className="flex-1 p-4 rounded-lg bg-gray-50 border border-gray-200 text-center relative group">
                          <div className="text-xs text-gray-500 mb-1">Trigger Event</div>
                          <div className="font-semibold text-gray-800">High Request Load</div>
                          <div className="text-xs text-gray-400 mt-1">Order Service</div>
                      </div>
                      <ArrowRight className="text-gray-300" />
                      
                      {/* Node 2 */}
                      <div className="flex-1 p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-center relative">
                          <div className="text-xs text-yellow-600 mb-1">Code Defect</div>
                          <div className="font-semibold text-yellow-900">JDBC Conn Leak</div>
                          <div className="text-xs text-yellow-700 mt-1">OrderProcessor.java</div>
                      </div>
                      <ArrowRight className="text-gray-300" />

                      {/* Node 3 */}
                      <div className="flex-1 p-4 rounded-lg bg-orange-50 border border-orange-200 text-center relative">
                          <div className="text-xs text-orange-600 mb-1">Symptom</div>
                          <div className="font-semibold text-orange-900">Heap Full (99%)</div>
                          <div className="text-xs text-orange-700 mt-1">Old Gen Space</div>
                      </div>
                      <ArrowRight className="text-gray-300" />

                      {/* Node 4 */}
                      <div className="flex-1 p-4 rounded-lg bg-red-50 border border-red-200 text-center shadow-sm relative">
                          <div className="absolute -top-3 -right-3 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">ROOT CAUSE</div>
                          <div className="text-xs text-red-600 mb-1">Fatal Result</div>
                          <div className="font-bold text-red-900">OOM Killed</div>
                          <div className="text-xs text-red-700 mt-1">Exit Code 137</div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Issues Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <AlertOctagon size={18} className="text-red-500"/>
                核心性能诊断报告
            </h2>
        </div>
        <div className="divide-y divide-gray-100">
            {report.issues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
            ))}
        </div>
      </div>

      {/* Optimizations Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <Zap size={18} className="text-blue-500"/>
                详细瓶颈分析与优化建议
            </h2>
        </div>
        <div className="divide-y divide-gray-100">
            {report.optimizations.map((opt) => (
                <OptimizationCard key={opt.id} opt={opt} />
            ))}
        </div>
      </div>
    </div>
  );
};

// --- Sub Components ---

const IssueCard: React.FC<{ issue: Issue }> = ({ issue }) => {
    return (
        <div className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{issue.title}</h3>
                <Badge severity={issue.severity} />
            </div>
            <p className="text-sm text-gray-600 mb-3">{issue.description}</p>
            {issue.evidence && (
                <div className="text-xs font-mono bg-red-50 text-red-800 p-2 rounded border border-red-100 inline-block">
                    证据: {issue.evidence}
                </div>
            )}
        </div>
    );
}

const OptimizationCard: React.FC<{ opt: Optimization }> = ({ opt }) => {
    const [isApplied, setIsApplied] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [processing, setProcessing] = useState(false);

    const handleApply = () => {
        setShowModal(true);
    };

    const confirmApply = () => {
        setProcessing(true);
        setTimeout(() => {
            setProcessing(false);
            setShowModal(false);
            setIsApplied(true);
        }, 1500);
    };

    return (
        <div className="p-6">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{opt.title}</h3>
                    {opt.autoFixAvailable && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wide">
                            Auto-Fix
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                        优先级: {opt.priority}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                        难度: {opt.difficulty}
                    </span>
                </div>
            </div>

            <p className="text-sm text-gray-700 mb-4">{opt.description}</p>

            {/* Comparison Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="bg-gray-50 p-3 rounded border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">问题成因</div>
                    <div className="font-medium text-gray-800">{opt.currentValue || 'N/A'}</div>
                </div>
                <div className="bg-green-50 p-3 rounded border border-green-100">
                    <div className="text-xs text-green-600 mb-1">预期效果</div>
                    <div className="font-medium text-green-900">{opt.benefit}</div>
                </div>
            </div>

            {/* Code Snippet */}
            {opt.codeSnippet && (
                <div className="relative group mb-4">
                    <div className="absolute top-2 right-2 text-xs text-gray-400 font-mono">SQL</div>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs font-mono overflow-x-auto">
                        <code>{opt.codeSnippet}</code>
                    </pre>
                </div>
            )}

            {/* Action Bar */}
            {opt.autoFixAvailable && (
                <div className="flex justify-end mt-4">
                    {isApplied ? (
                        <div className="flex items-center gap-2 text-green-600 text-sm font-medium animate-pulse">
                            <CheckCircle size={16} />
                            已自动优化配置
                        </div>
                    ) : (
                        <button 
                            onClick={handleApply}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-sm text-sm font-medium transition-all transform hover:scale-105"
                        >
                            <Zap size={16} fill="currentColor" />
                            一键优化配置
                        </button>
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full animate-scale-up">
                        <div className="flex items-center gap-3 mb-4 text-blue-600">
                            <div className="p-2 bg-blue-100 rounded-full">
                                <Zap size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">确定执行以下操作?</h3>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 font-mono text-xs text-gray-700">
                            {opt.codeSnippet}
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded"
                            >
                                取消
                            </button>
                            <button 
                                onClick={confirmApply}
                                disabled={processing}
                                className="px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 flex items-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                        执行中...
                                    </>
                                ) : '确认执行'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Badge: React.FC<{ severity: string }> = ({ severity }) => {
    const colors: Record<string, string> = {
        'Critical': 'bg-red-100 text-red-800',
        'High': 'bg-orange-100 text-orange-800',
        'Medium': 'bg-yellow-100 text-yellow-800',
        'Low': 'bg-blue-100 text-blue-800',
        'Warning': 'bg-yellow-100 text-yellow-800'
    };
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${colors[severity] || 'bg-gray-100'}`}>
            {severity}
        </span>
    );
};

export default ReportView;
