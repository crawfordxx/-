import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ReportView from './components/ReportView';
import ChatInterface from './components/ChatInterface';
import AnalysisPanel from './components/AnalysisPanel';
import { analyzeQuery } from './services/geminiService';
import { DiagnosticReport } from './types';

const App: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [loading, setLoading] = useState(false);
  // Track the query separately to pass to AnalysisPanel
  const [currentQuery, setCurrentQuery] = useState("");

  const handleSearch = async (query: string) => {
    setLoading(true);
    setReport(null);
    setSelectedId(query);
    setCurrentQuery(query);
    
    // Simulate a delay long enough for the AnalysisPanel animation to play out (approx 4s)
    // The AnalysisPanel has a step interval of 800ms * 5 steps = 4000ms total ideal time.
    const delay = ms => new Promise(res => setTimeout(res, ms));
    
    try {
        const [data] = await Promise.all([
            analyzeQuery(query),
            delay(4500) // Ensure animation shows for 4.5s
        ]);
        setReport(data);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  const handleSidebarSelect = (id: string) => {
    handleSearch(id);
  };

  return (
    <div className="flex min-h-screen bg-[#F3F4F6]">
      <Sidebar onSelectHistory={handleSidebarSelect} selectedId={selectedId} />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen relative">
        {/* Background "Admin" watermark pattern */}
        <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] ml-64 flex flex-wrap gap-24 p-24 justify-center content-center select-none overflow-hidden">
             {Array.from({ length: 20 }).map((_, i) => (
                 <div key={i} className="transform -rotate-45 text-4xl font-black text-gray-900">
                     admin
                 </div>
             ))}
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
            {!report && !loading && (
                <ChatInterface onSearch={handleSearch} loading={loading} />
            )}

            {loading && (
                <AnalysisPanel query={currentQuery} />
            )}

            {report && !loading && (
                <ReportView report={report} />
            )}
        </div>
      </main>
    </div>
  );
};

export default App;
