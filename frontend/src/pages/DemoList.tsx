import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiFilter } from 'react-icons/fi';
import { api } from '../services/api';
import { Demo, DemoStatus } from '../types/demo';
import DemoCard from '../components/DemoCard';

const STATUSES: DemoStatus[] = ['concept', 'development', 'validated', 'production'];

export default function DemoList() {
  const [demos, setDemos] = useState<Demo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadDemos();
  }, [statusFilter]);

  async function loadDemos() {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      const result = await api.listDemos(params);
      setDemos(result.items || []);
    } catch (err) {
      console.error('Failed to load demos:', err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = search
    ? demos.filter((d) =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.businessProblem?.toLowerCase().includes(search.toLowerCase()) ||
        d.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      )
    : demos;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI & GenAI Demos</h1>
          <p className="text-gray-500 mt-1">Manage your demos, PoCs, and reference architectures</p>
        </div>
        <Link
          to="/demos/new"
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          <FiPlus className="mr-2" /> New Demo
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search demos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          />
        </div>
        <div className="relative">
          <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-9 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm appearance-none bg-white"
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No demos found</p>
          <Link to="/demos/new" className="text-primary-600 hover:text-primary-700 text-sm mt-2 inline-block">
            Create your first demo →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((demo) => (
            <DemoCard key={demo.demoId} demo={demo} />
          ))}
        </div>
      )}
    </div>
  );
}
