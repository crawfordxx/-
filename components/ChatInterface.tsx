import React, { useState } from 'react';
import { Search, Sparkles, Command } from 'lucide-react';

interface ChatInterfaceProps {
  onSearch: (query: string) => void;
  loading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSearch, loading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] px-4">
      <div className="mb-8 text-center animate-fade-in-up">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6 text-blue-600">
            <Sparkles size={32} />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">你好, admin!</h1>
        <p className="text-gray-500">我是你的大数据与系统运维专家 (SRE Agent)。请输入 ID 或描述开始诊断。</p>
      </div>

      <div className="w-full max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <form onSubmit={handleSubmit} className="relative group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="请输入 Application ID, Pod 名称或问题描述..."
            className="w-full h-14 pl-12 pr-4 bg-white border border-gray-200 rounded-xl shadow-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
            disabled={loading}
          />
          <Search className="absolute left-4 top-4 text-gray-400" size={24} />
          {query.length === 0 && (
             <div className="absolute right-4 top-4 text-xs text-gray-300 border border-gray-200 rounded px-1.5 py-0.5 hidden sm:block">
                Enter
             </div>
          )}
        </form>

        <div className="flex flex-wrap gap-2 mt-4 justify-center">
            <SuggestionChip label="任务异常诊断" onClick={() => onSearch("application_1747962111306_0003")} />
            <SuggestionChip label="系统 OOM 根因分析" onClick={() => onSearch("pod-webapp-7b9d8c8f5")} />
            <SuggestionChip label="集群存储分析" onClick={() => onSearch("cluster-prod-01")} />
        </div>
      </div>
    </div>
  );
};

const SuggestionChip = ({ label, onClick }: { label: string, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm"
    >
        {label}
    </button>
);

export default ChatInterface;
