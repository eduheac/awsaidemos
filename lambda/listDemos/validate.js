const VALID_TYPES = ['demo', 'poc', 'mlp', 'reference'];
const VALID_STATUSES = ['concept', 'development', 'validated', 'production'];
const VALID_LEVELS = ['executive', 'technical', 'developer'];
const VALID_MODALITIES = ['deployable', 'live', 'clickthrough', 'video'];
const MAX_STRING_LENGTH = 2000;
const MAX_ARRAY_LENGTH = 50;

function sanitizeString(val, maxLen = MAX_STRING_LENGTH) {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen);
}

function sanitizeArray(val, maxLen = MAX_ARRAY_LENGTH) {
  if (!Array.isArray(val)) return [];
  return val.slice(0, maxLen).map((v) => sanitizeString(v, 200)).filter(Boolean);
}

function validateEnum(val, allowed, fallback) {
  return allowed.includes(val) ? val : fallback;
}

function validateUrl(val) {
  if (!val || typeof val !== 'string') return '';
  try {
    const url = new URL(val);
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    return val.slice(0, 2048);
  } catch {
    return '';
  }
}

exports.sanitizeDemo = (body) => ({
  name: sanitizeString(body.name, 200),
  type: validateEnum(body.type, VALID_TYPES, 'demo'),
  status: validateEnum(body.status, VALID_STATUSES, 'concept'),
  industry: sanitizeString(body.industry || 'General', 100),
  useCases: sanitizeArray(body.useCases),
  businessProblem: sanitizeString(body.businessProblem),
  targetAudience: sanitizeString(body.targetAudience, 500),
  technicalLevel: validateEnum(body.technicalLevel, VALID_LEVELS, 'technical'),
  awsServices: sanitizeArray(body.awsServices),
  aiModels: sanitizeArray(body.aiModels),
  architectureDiagram: validateUrl(body.architectureDiagram),
  codeRepo: validateUrl(body.codeRepo),
  demoScript: sanitizeString(body.demoScript, 10000),
  metrics: {
    roi: typeof body.metrics?.roi === 'number' ? Math.min(Math.max(body.metrics.roi, -100), 10000) : undefined,
    csat: typeof body.metrics?.csat === 'number' ? Math.min(Math.max(body.metrics.csat, 0), 5) : undefined,
    implementationTime: typeof body.metrics?.implementationTime === 'number' ? Math.min(Math.max(body.metrics.implementationTime, 0), 3650) : undefined,
  },
  modality: validateEnum(body.modality, VALID_MODALITIES, 'live'),
  demoUrl: validateUrl(body.demoUrl),
  videoUrl: validateUrl(body.videoUrl),
  coverImage: validateUrl(body.coverImage),
  securityChecklist: sanitizeArray(body.securityChecklist, 20),
  tags: sanitizeArray(body.tags, 30),
  collaborators: Array.isArray(body.collaborators)
    ? body.collaborators.slice(0, 20).map((c) => ({
        userId: sanitizeString(c.userId, 100),
        name: sanitizeString(c.name, 200),
        email: sanitizeString(c.email, 320),
      }))
    : [],
});

exports.sanitizeString = sanitizeString;
exports.validateUrl = validateUrl;
