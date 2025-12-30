import React from 'react';
import { LayoutDashboard, Bell, FileText, Server, Settings, MessageSquare, Database, Activity, Box, Cpu } from 'lucide-react';

interface SidebarProps {
  onSelectHistory: (id: string) => void;
  selectedId: string | null;
}

const HISTORY_ITEMS = [
  { id: 'pod-webapp-7b9d8c8f5', label: 'pod-webapp-7b9...8f5', date: '2025-06-16 09:15:22', type: 'system' },
  { id: 'application_1747962111306_0003', label: 'application_174...003', date: '2025-06-15 14:38:13', type: 'spark' },
  { id: 'application_1747962111306_0002', label: 'application_174...002', date: '2025-06-15 12:20:45', type: 'spark' },
  { id: 'cluster-prod-01', label: 'cluster-prod-01', date: '2025-06-15 14:40:00', type: 'hdfs' },
];

const Sidebar: React.FC<SidebarProps> = ({ onSelectHistory, selectedId }) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0 z-10 font-sans text-sm">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <div className="flex items-center gap-2 font-bold text-gray-800 text-lg">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white">
            <Activity size={20} />
          </div>
          SkyData Pilot
        </div>
      </div>

      {/* Main Nav */}
      <nav className="p-4 space-y-1">
        <NavItem icon={<LayoutDashboard size={18} />} label="智能诊断" active={true} />
        <NavItem icon={<Bell size={18} />} label="消息" />
        <NavItem icon={<FileText size={18} />} label="任务" />
        <NavItem icon={<Server size={18} />} label="集群" />
        <NavItem icon={<Database size={18} />} label="数仓" />
        <NavItem icon={<Settings size={18} />} label="系统" />
      </nav>

      {/* History Section */}
      <div className="px-4 py-2 mt-2">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">历史对话</h3>
        <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-400px)]">
          {HISTORY_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectHistory(item.id)}
              className={`w-full text-left px-3 py-2.5 rounded-md flex items-start gap-3 transition-colors ${
                selectedId === item.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {item.type === 'spark' ? (
                <Box size={16} className="mt-0.5 shrink-0 text-orange-500" />
              ) : item.type === 'system' ? (
                <Cpu size={16} className="mt-0.5 shrink-0 text-purple-500" />
              ) : (
                <Server size={16} className="mt-0.5 shrink-0 text-indigo-500" />
              )}
              <div className="overflow-hidden">
                <div className="truncate font-medium">{item.label}</div>
                <div className="text-xs text-gray-400 mt-0.5 truncate">{item.date}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* User Profile */}
      <div className="mt-auto p-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">A</div>
            <div>
                <div className="text-sm font-medium text-gray-900">admin</div>
                <div className="text-xs text-gray-500">Administrator</div>
            </div>
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) => (
  <button
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
      active ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

export default Sidebar;
