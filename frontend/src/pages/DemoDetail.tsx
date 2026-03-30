import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiArrowLeft, FiExternalLink, FiTag } from 'react-icons/fi';
import { api } from '../services/api';
import { Demo } from '../types/demo';
import { StatusBadge, TypeBadge } from '../components/StatusBadge';

export default function DemoDetail() {
  const { demoId } = useParams<{ demoId: string }>();
  const navigate = useNavigate();
  const [demo, setDemo] = useState<Demo | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (demoId) {
      api.getDemo(demoId).then(setDemo).catch(console.error).finally(() => setLoading(false));
    }
  }, [demoId]);

  async function handleDelete() {
    if (!demoId || !confirm('Are you sure you want to delete this demo?')) return;
    setDeleting(true);
    try {
      await api.deleteDemo(demoId);
      navigate('/');
    } catch (err) {
      console.error('Delete failed:', err);
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (!demo) {
    return <div className="text-center py-20 text-gray-500">Demo not found</div>;
  }

  return (
    <div>
      <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6">
        <FiArrowLeft className="mr-1" /> Back to Demos
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{demo.name}</h1>
              <TypeBadge type={demo.type} />
              <StatusBadge status={demo.status} />
            </div>
            <p className="text-sm text-gray-500">
              Created by {demo.owner?.name || demo.owner?.email} on {new Date(demo.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex space-x-2">
            <Link
              to={`/demos/${demo.demoId}/edit`}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              <FiEdit2 className="mr-1" size={14} /> Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center px-3 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 disabled:opacity-50"
            >
              <FiTrash2 className="mr-1" size={14} /> {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Business Problem</h2>
              <p className="text-gray-700">{demo.businessProblem || 'Not specified'}</p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Use Cases</h2>
              <div className="flex flex-wrap gap-2">
                {demo.useCases.length > 0 ? demo.useCases.map((uc) => (
                  <span key={uc} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">{uc}</span>
                )) : <span className="text-gray-400">None specified</span>}
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">AWS Services</h2>
              <div className="flex flex-wrap gap-2">
                {demo.awsServices.map((svc) => (
                  <span key={svc} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm">{svc}</span>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">AI Models</h2>
              <div className="flex flex-wrap gap-2">
                {demo.aiModels.length > 0 ? demo.aiModels.map((m) => (
                  <span key={m} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">{m}</span>
                )) : <span className="text-gray-400">None specified</span>}
              </div>
            </section>

            {demo.files.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Files</h2>
                <ul className="space-y-2">
                  {demo.files.map((f, i) => (
                    <li key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">{f.fileName}</span>
                      <a href={f.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                        <FiExternalLink size={14} />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <InfoRow label="Industry" value={demo.industry} />
              <InfoRow label="Target Audience" value={demo.targetAudience} />
              <InfoRow label="Technical Level" value={demo.technicalLevel} />
              <InfoRow label="Modality" value={demo.modality} />
              {demo.demoUrl && <InfoLink label="Demo URL" href={demo.demoUrl} />}
              {demo.videoUrl && <InfoLink label="Video URL" href={demo.videoUrl} />}
              {demo.codeRepo && <InfoLink label="Code Repo" href={demo.codeRepo} />}
            </div>

            {demo.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Tags</h3>
                <div className="flex flex-wrap gap-1">
                  {demo.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      <FiTag size={10} className="mr-1" /> {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(demo.metrics.roi || demo.metrics.csat) && (
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-green-800 mb-2">Metrics</h3>
                {demo.metrics.roi && <p className="text-sm text-green-700">ROI: {demo.metrics.roi}%</p>}
                {demo.metrics.csat && <p className="text-sm text-green-700">CSAT: {demo.metrics.csat}/5</p>}
                {demo.metrics.implementationTime && (
                  <p className="text-sm text-green-700">Implementation: {demo.metrics.implementationTime} days</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900 capitalize">{value || 'N/A'}</dd>
    </div>
  );
}

function InfoLink({ label, href }: { label: string; href: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd>
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
          {new URL(href).hostname} <FiExternalLink size={12} className="ml-1" />
        </a>
      </dd>
    </div>
  );
}
