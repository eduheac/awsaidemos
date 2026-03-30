import { DemoStatus, DemoType } from '../types/demo';

const statusColors: Record<DemoStatus, string> = {
  concept: 'bg-yellow-100 text-yellow-800',
  development: 'bg-blue-100 text-blue-800',
  validated: 'bg-green-100 text-green-800',
  production: 'bg-purple-100 text-purple-800',
};

const typeColors: Record<DemoType, string> = {
  demo: 'bg-indigo-100 text-indigo-800',
  poc: 'bg-orange-100 text-orange-800',
  mlp: 'bg-pink-100 text-pink-800',
  reference: 'bg-teal-100 text-teal-800',
};

export function StatusBadge({ status }: { status: DemoStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export function TypeBadge({ type }: { type: DemoType }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[type]}`}>
      {type.toUpperCase()}
    </span>
  );
}
