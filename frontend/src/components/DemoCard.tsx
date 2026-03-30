import { Link } from 'react-router-dom';
import { FiClock, FiUser, FiTag } from 'react-icons/fi';
import { Demo } from '../types/demo';
import { StatusBadge, TypeBadge } from './StatusBadge';

export default function DemoCard({ demo }: { demo: Demo }) {
  return (
    <Link
      to={`/demos/${demo.demoId}`}
      className="block bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all p-6"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{demo.name}</h3>
        <div className="flex space-x-2 ml-2 flex-shrink-0">
          <TypeBadge type={demo.type} />
          <StatusBadge status={demo.status} />
        </div>
      </div>
      <p className="text-sm text-gray-600 line-clamp-2 mb-4">{demo.businessProblem || 'No description'}</p>
      <div className="flex flex-wrap gap-1 mb-4">
        {demo.awsServices.slice(0, 4).map((svc) => (
          <span key={svc} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{svc}</span>
        ))}
        {demo.awsServices.length > 4 && (
          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">+{demo.awsServices.length - 4}</span>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <FiUser size={12} />
          <span>{demo.owner?.name || demo.owner?.email}</span>
        </div>
        <div className="flex items-center space-x-3">
          {demo.tags.length > 0 && (
            <div className="flex items-center space-x-1">
              <FiTag size={12} />
              <span>{demo.tags.length}</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <FiClock size={12} />
            <span>{new Date(demo.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
