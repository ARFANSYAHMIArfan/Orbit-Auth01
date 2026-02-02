import React, { useState, useEffect } from 'react';
import { Search, Play, RotateCcw, Plus, Edit2, Trash2, Code, ChevronRight, FileJson, Info } from 'lucide-react';
import { Button } from './ui/Button';
import { mongodbService } from '../services/mongodbService';

interface DataExplorerProps {
  onBack: () => void;
}

export const DataExplorer: React.FC<DataExplorerProps> = ({ onBack }) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [query, setQuery] = useState('{}');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Documents');

  const fetchDocs = async () => {
    setIsLoading(true);
    const docs = await mongodbService.queryDocuments(query);
    setDocuments(docs);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleFind = () => fetchDocs();
  const handleReset = () => {
    setQuery('{}');
    setTimeout(fetchDocs, 10);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden animate-fade-in flex flex-col min-h-[600px]">
      {/* Breadcrumbs & Top Bar */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center text-xs space-x-2 text-slate-500 font-medium">
          <span className="text-emerald-700 hover:underline cursor-pointer">rfnsyhmi-cluster</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-emerald-700 hover:underline cursor-pointer">Orbit-Auth</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-900">Project</span>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="h-8 text-xs py-0">View monitoring</Button>
          <Button className="h-8 text-xs py-0 bg-[#00684A] border-none">Visualize Your Data</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 border-b border-slate-100 flex space-x-6">
        {['Documents', 'Aggregations', 'Schema', 'Indexes', 'Validation'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab} {tab === 'Documents' && <span className="text-[10px] ml-1 bg-slate-100 px-1.5 rounded-full">{documents.length}</span>}
          </button>
        ))}
      </div>

      {/* Query Bar */}
      <div className="p-4 bg-white border-b border-slate-100 flex items-center space-x-3">
        <div className="relative flex-1 group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center space-x-2 text-slate-400">
             <Search className="h-4 w-4" />
             <span className="text-sm font-mono opacity-50">Filter</span>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-20 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md font-mono text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all"
            placeholder="{ field: 'value' }"
          />
        </div>
        <Button onClick={handleFind} className="bg-[#00684A] h-9 px-4 text-xs">Find</Button>
        <Button variant="outline" onClick={handleReset} className="h-9 px-4 text-xs">Reset</Button>
      </div>

      {/* Toolbar */}
      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
        <div className="flex space-x-2">
          <button className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-700 text-white rounded text-xs font-bold hover:bg-emerald-800 transition-colors">
            <Plus className="h-3.5 w-3.5" />
            <span>ADD DATA</span>
          </button>
          <button className="flex items-center space-x-1.5 px-3 py-1.5 border border-slate-300 rounded text-xs font-bold text-slate-700 hover:bg-slate-100">
            <Edit2 className="h-3.5 w-3.5" />
            <span>UPDATE</span>
          </button>
          <button className="flex items-center space-x-1.5 px-3 py-1.5 border border-slate-300 rounded text-xs font-bold text-slate-700 hover:bg-slate-100">
            <Trash2 className="h-3.5 w-3.5" />
            <span>DELETE</span>
          </button>
        </div>
        <div className="text-[11px] text-slate-500">
           Displaying 1 - {documents.length} of {documents.length}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-6 bg-white">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center space-y-3 opacity-50">
             <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
             <span className="text-sm font-medium">Fetching documents...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
            <div className="w-16 h-20 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center">
              <FileJson className="h-10 w-10 text-slate-200" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-900">This collection has no data</h4>
              <p className="text-sm text-slate-500 mt-2 max-w-sm">
                It only takes a few seconds to import data from a JSON or CSV file.
              </p>
            </div>
            <Button className="bg-[#00684A] border-none">Import Data</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc, i) => (
              <div key={i} className="group border border-slate-100 rounded-lg hover:border-emerald-200 transition-colors overflow-hidden">
                <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 flex items-center space-x-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                   <span className="text-[10px] font-bold text-slate-500 font-mono">_id: {doc.id}</span>
                </div>
                <div className="p-4 bg-white font-mono text-sm">
                  <pre className="text-slate-800">
                    {JSON.stringify(doc, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center text-[10px] text-slate-400 space-x-4">
         <div className="flex items-center space-x-1">
           <Info className="h-3 w-3" />
           <span>Use the "Find" button to execute your filter query.</span>
         </div>
         <Button variant="ghost" onClick={onBack} className="h-6 text-[10px] py-0 px-2 ml-auto">Kembali ke Dashboard</Button>
      </div>
    </div>
  );
};