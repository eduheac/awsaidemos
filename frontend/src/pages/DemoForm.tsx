import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiX, FiPlus } from 'react-icons/fi';
import { api } from '../services/api';
import { Demo, DemoType, DemoStatus, TechnicalLevel, Modality } from '../types/demo';

const TYPES: DemoType[] = ['demo', 'poc', 'mlp', 'reference'];
const STATUSES: DemoStatus[] = ['concept', 'development', 'validated', 'production'];
const LEVELS: TechnicalLevel[] = ['executive', 'technical', 'developer'];
const MODALITIES: Modality[] = ['deployable', 'live', 'clickthrough', 'video'];
const INDUSTRIES = ['Financial Services', 'Healthcare', 'Retail', 'Manufacturing', 'Media', 'Education', 'Public Sector', 'Energy', 'Telecom', 'General'];
const AWS_SERVICES = ['Amazon Bedrock', 'Amazon Bedrock AgentCore', 'Strands Agents', 'Amazon Nova', 'Amazon SageMaker AI', 'Amazon Rekognition', 'Amazon Comprehend', 'Amazon Textract', 'Amazon Polly', 'Amazon Transcribe', 'Amazon Kendra', 'Amazon Lex', 'Amazon Q', 'Amazon Personalize', 'Amazon Forecast', 'AWS Lambda', 'Amazon DynamoDB', 'Amazon S3', 'Amazon API Gateway', 'Amazon CloudFront', 'Amazon ECS', 'Amazon EKS'];

export default function DemoForm() {
  const { demoId } = useParams<{ demoId: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(demoId);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  const [form, setForm] = useState({
    name: '', type: 'demo' as DemoType, status: 'concept' as DemoStatus,
    industry: 'General', businessProblem: '', targetAudience: '',
    technicalLevel: 'technical' as TechnicalLevel, modality: 'live' as Modality,
    demoUrl: '', videoUrl: '', codeRepo: '', demoScript: '',
    useCases: [] as string[], awsServices: [] as string[], aiModels: [] as string[],
    tags: [] as string[], securityChecklist: [] as string[],
    metrics: { roi: undefined as number | undefined, csat: undefined as number | undefined, implementationTime: undefined as number | undefined },
  });

  const [newTag, setNewTag] = useState('');
  const [newUseCase, setNewUseCase] = useState('');
  const [newModel, setNewModel] = useState('');

  useEffect(() => {
    if (demoId) {
      api.getDemo(demoId).then((demo) => {
        setForm({
          name: demo.name, type: demo.type, status: demo.status,
          industry: demo.industry, businessProblem: demo.businessProblem,
          targetAudience: demo.targetAudience, technicalLevel: demo.technicalLevel,
          modality: demo.modality, demoUrl: demo.demoUrl || '',
          videoUrl: demo.videoUrl || '', codeRepo: demo.codeRepo || '',
          demoScript: demo.demoScript || '', useCases: demo.useCases,
          awsServices: demo.awsServices, aiModels: demo.aiModels,
          tags: demo.tags, securityChecklist: demo.securityChecklist,
          metrics: demo.metrics as any,
        });
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [demoId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit && demoId) {
        await api.updateDemo(demoId, form as any);
        navigate(`/demos/${demoId}`);
      } else {
        const created = await api.createDemo(form as any);
        navigate(`/demos/${created.demoId}`);
      }
    } catch (err) {
      console.error('Save failed:', err);
      setSaving(false);
    }
  }

  function addToList(field: 'tags' | 'useCases' | 'aiModels', value: string, setter: (v: string) => void) {
    if (value.trim() && !form[field].includes(value.trim())) {
      setForm({ ...form, [field]: [...form[field], value.trim()] });
      setter('');
    }
  }

  function removeFromList(field: 'tags' | 'useCases' | 'aiModels' | 'awsServices', value: string) {
    setForm({ ...form, [field]: form[field].filter((v) => v !== value) });
  }

  function toggleService(svc: string) {
    const has = form.awsServices.includes(svc);
    setForm({ ...form, awsServices: has ? form.awsServices.filter((s) => s !== svc) : [...form.awsServices, svc] });
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

  return (
    <div>
      <Link to={isEdit ? `/demos/${demoId}` : '/'} className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6">
        <FiArrowLeft className="mr-1" /> {isEdit ? 'Back to Demo' : 'Back to Demos'}
      </Link>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">{isEdit ? 'Edit Demo' : 'Register New Demo'}</h1>

        <div className="space-y-8">
          {/* Basic Info */}
          <fieldset>
            <legend className="text-lg font-semibold text-gray-800 mb-4">Basic Information</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Demo Name *</label>
                <input id="name" type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select id="type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as DemoType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                  {TYPES.map((t) => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select id="status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as DemoStatus })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                  {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <select id="industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                  {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="technicalLevel" className="block text-sm font-medium text-gray-700 mb-1">Technical Level</label>
                <select id="technicalLevel" value={form.technicalLevel} onChange={(e) => setForm({ ...form, technicalLevel: e.target.value as TechnicalLevel })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                  {LEVELS.map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                </select>
              </div>
            </div>
          </fieldset>

          {/* Description */}
          <fieldset>
            <legend className="text-lg font-semibold text-gray-800 mb-4">Description</legend>
            <div className="space-y-4">
              <div>
                <label htmlFor="businessProblem" className="block text-sm font-medium text-gray-700 mb-1">Business Problem</label>
                <textarea id="businessProblem" rows={3} value={form.businessProblem} onChange={(e) => setForm({ ...form, businessProblem: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                <input id="targetAudience" type="text" value={form.targetAudience} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
          </fieldset>

          {/* AWS Services */}
          <fieldset>
            <legend className="text-lg font-semibold text-gray-800 mb-4">AWS Services</legend>
            <div className="flex flex-wrap gap-2">
              {AWS_SERVICES.map((svc) => (
                <button key={svc} type="button" onClick={() => toggleService(svc)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    form.awsServices.includes(svc) ? 'bg-orange-100 border-orange-300 text-orange-800' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}>
                  {svc}
                </button>
              ))}
            </div>
          </fieldset>

          {/* AI Models */}
          <fieldset>
            <legend className="text-lg font-semibold text-gray-800 mb-4">AI Models</legend>
            <div className="flex gap-2 mb-2">
              <input type="text" value={newModel} onChange={(e) => setNewModel(e.target.value)} placeholder="e.g. Claude 3, Titan, Llama 2"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToList('aiModels', newModel, setNewModel))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm" />
              <button type="button" onClick={() => addToList('aiModels', newModel, setNewModel)}
                className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"><FiPlus size={16} /></button>
            </div>
            <div className="flex flex-wrap gap-1">
              {form.aiModels.map((m) => (
                <span key={m} className="inline-flex items-center px-2 py-1 bg-purple-50 text-purple-700 rounded text-sm">
                  {m} <button type="button" onClick={() => removeFromList('aiModels', m)} className="ml-1 hover:text-purple-900"><FiX size={12} /></button>
                </span>
              ))}
            </div>
          </fieldset>

          {/* Use Cases */}
          <fieldset>
            <legend className="text-lg font-semibold text-gray-800 mb-4">Use Cases</legend>
            <div className="flex gap-2 mb-2">
              <input type="text" value={newUseCase} onChange={(e) => setNewUseCase(e.target.value)} placeholder="Add a use case"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToList('useCases', newUseCase, setNewUseCase))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm" />
              <button type="button" onClick={() => addToList('useCases', newUseCase, setNewUseCase)}
                className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"><FiPlus size={16} /></button>
            </div>
            <div className="flex flex-wrap gap-1">
              {form.useCases.map((uc) => (
                <span key={uc} className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                  {uc} <button type="button" onClick={() => removeFromList('useCases', uc)} className="ml-1 hover:text-blue-900"><FiX size={12} /></button>
                </span>
              ))}
            </div>
          </fieldset>

          {/* Links & Modality */}
          <fieldset>
            <legend className="text-lg font-semibold text-gray-800 mb-4">Links & Delivery</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="modality" className="block text-sm font-medium text-gray-700 mb-1">Modality</label>
                <select id="modality" value={form.modality} onChange={(e) => setForm({ ...form, modality: e.target.value as Modality })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                  {MODALITIES.map((m) => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="demoUrl" className="block text-sm font-medium text-gray-700 mb-1">Demo URL</label>
                <input id="demoUrl" type="url" value={form.demoUrl} onChange={(e) => setForm({ ...form, demoUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
                <input id="videoUrl" type="url" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label htmlFor="codeRepo" className="block text-sm font-medium text-gray-700 mb-1">Code Repository</label>
                <input id="codeRepo" type="url" value={form.codeRepo} onChange={(e) => setForm({ ...form, codeRepo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
          </fieldset>

          {/* Tags */}
          <fieldset>
            <legend className="text-lg font-semibold text-gray-800 mb-4">Tags</legend>
            <div className="flex gap-2 mb-2">
              <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Add a tag"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToList('tags', newTag, setNewTag))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm" />
              <button type="button" onClick={() => addToList('tags', newTag, setNewTag)}
                className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"><FiPlus size={16} /></button>
            </div>
            <div className="flex flex-wrap gap-1">
              {form.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                  {tag} <button type="button" onClick={() => removeFromList('tags', tag)} className="ml-1 hover:text-gray-900"><FiX size={12} /></button>
                </span>
              ))}
            </div>
          </fieldset>

          {/* Metrics */}
          <fieldset>
            <legend className="text-lg font-semibold text-gray-800 mb-4">Metrics (Optional)</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="roi" className="block text-sm font-medium text-gray-700 mb-1">ROI (%)</label>
                <input id="roi" type="number" value={form.metrics.roi ?? ''} onChange={(e) => setForm({ ...form, metrics: { ...form.metrics, roi: e.target.value ? Number(e.target.value) : undefined } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label htmlFor="csat" className="block text-sm font-medium text-gray-700 mb-1">CSAT (1-5)</label>
                <input id="csat" type="number" min="1" max="5" step="0.1" value={form.metrics.csat ?? ''} onChange={(e) => setForm({ ...form, metrics: { ...form.metrics, csat: e.target.value ? Number(e.target.value) : undefined } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label htmlFor="implTime" className="block text-sm font-medium text-gray-700 mb-1">Implementation (days)</label>
                <input id="implTime" type="number" value={form.metrics.implementationTime ?? ''} onChange={(e) => setForm({ ...form, metrics: { ...form.metrics, implementationTime: e.target.value ? Number(e.target.value) : undefined } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
          </fieldset>

          {/* Submit */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Link to={isEdit ? `/demos/${demoId}` : '/'} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</Link>
            <button type="submit" disabled={saving}
              className="inline-flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm font-medium">
              <FiSave className="mr-2" /> {saving ? 'Saving...' : isEdit ? 'Update Demo' : 'Create Demo'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
