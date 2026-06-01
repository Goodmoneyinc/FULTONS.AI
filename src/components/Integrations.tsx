import { useState, useEffect } from 'react';
import { FileText, Mail, Download, CheckCircle, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import {
  getIntegrations,
  initiateGoogleDriveOAuth,
  syncDocuments,
  disconnectIntegration,
  type Integration,
} from '../lib/integrations';

type OAuthProvider = 'google_drive' | 'microsoft_office';
type OAuthStatus = 'active' | 'pending' | 'disconnected' | 'error';

interface ProviderConfig {
  id: OAuthProvider;
  name: string;
  description: string;
  actionLabel: string;
  icon: 'drive' | 'office';
  oauthEnabled: boolean;
}

interface OAuthMappingState {
  status: OAuthStatus;
  message: string;
  lastUpdatedAt: string | null;
}

const externalInfrastructureProviders: ProviderConfig[] = [
  {
    id: 'google_drive',
    name: 'Google Drive',
    description: 'Read-only vault sync through a scoped Google Drive OAuth grant.',
    actionLabel: 'Connect Google Drive',
    icon: 'drive',
    oauthEnabled: true,
  },
  {
    id: 'microsoft_office',
    name: 'Microsoft Office',
    description: 'Prepare Word and Outlook OAuth isolation for Microsoft 365 workspaces.',
    actionLabel: 'Connect Microsoft Office',
    icon: 'office',
    oauthEnabled: false,
  },
];

const initialOAuthMappings: Record<OAuthProvider, OAuthMappingState> = {
  google_drive: {
    status: 'disconnected',
    message: '',
    lastUpdatedAt: null,
  },
  microsoft_office: {
    status: 'disconnected',
    message: '',
    lastUpdatedAt: null,
  },
};

const hasSameOAuthState = (current: OAuthMappingState, next: OAuthMappingState) =>
  current.status === next.status &&
  current.message === next.message &&
  current.lastUpdatedAt === next.lastUpdatedAt;

const getProviderIcon = (icon: ProviderConfig['icon']) => {
  if (icon === 'office') {
    return <Mail className="w-5 h-5 text-purple-400" />;
  }

  return <Download className="w-5 h-5 text-green-400" />;
};

export function Integrations() {
  const [wordConnected, setWordConnected] = useState(false);
  const [outlookConnected, setOutlookConnected] = useState(false);
  const [playbook, setPlaybook] = useState('');
  const [emailDraft, setEmailDraft] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [oauthMappings, setOauthMappings] = useState<Record<OAuthProvider, OAuthMappingState>>(initialOAuthMappings);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const updateOAuthMapping = (
    provider: OAuthProvider,
    updater: (current: OAuthMappingState) => OAuthMappingState
  ) => {
    setOauthMappings((currentMappings) => {
      const currentProviderState = currentMappings[provider];
      const nextProviderState = updater(currentProviderState);

      if (hasSameOAuthState(currentProviderState, nextProviderState)) {
        return currentMappings;
      }

      return {
        ...currentMappings,
        [provider]: nextProviderState,
      };
    });
  };

  const loadIntegrations = async () => {
    try {
      const data = await getIntegrations();
      setIntegrations((current) => {
        const hasSameRemoteState =
          current.length === data.length &&
          current.every((item, index) => {
            const nextItem = data[index];

            return (
              item.id === nextItem?.id &&
              item.status === nextItem.status &&
              item.last_sync_at === nextItem.last_sync_at &&
              item.sync_enabled === nextItem.sync_enabled &&
              item.provider_email === nextItem.provider_email
            );
          });

        if (hasSameRemoteState) {
          return current;
        }

        return data;
      });
    } catch (error) {
      console.error('Failed to load integrations:', error);
    } finally {
      setLoading((current) => (current ? false : current));
    }
  };

  const getIntegrationByProvider = (provider: string) => {
    return integrations.find((integration) => integration.provider === provider);
  };

  const getProviderStatus = (provider: OAuthProvider, integration?: Integration): OAuthStatus | null => {
    if (integration?.status === 'active') {
      return 'active';
    }

    if (integration?.status === 'expired') {
      return 'disconnected';
    }

    if (integration?.status === 'error') {
      return 'error';
    }

    return oauthMappings[provider]?.status ?? null;
  };

  const getStatusBadge = (status: OAuthStatus | null) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-green-500/30 bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-400">
          <CheckCircle className="w-3 h-3" />
          Active
        </span>
      );
    }

    if (status === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-400">
          <RefreshCw className="w-3 h-3 animate-spin" />
          Pending
        </span>
      );
    }

    if (status === 'error') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-400">
          <AlertCircle className="w-3 h-3" />
          Error
        </span>
      );
    }

    if (status === 'disconnected') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold text-white/50">
          <AlertCircle className="w-3 h-3" />
          Disconnected
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold text-white/40">
        <AlertCircle className="w-3 h-3" />
        Not configured
      </span>
    );
  };

  const initiateOAuthFlow = (provider: OAuthProvider) => {
    const providerConfig = externalInfrastructureProviders.find((item) => item.id === provider);
    const message = `Connecting to structural provider API [${provider}]. Secure sandbox session instantiated.`;

    updateOAuthMapping(provider, (current) => ({
      ...current,
      status: 'pending',
      message,
      lastUpdatedAt: new Date().toISOString(),
    }));

    if (!providerConfig?.oauthEnabled) {
      updateOAuthMapping(provider, (current) => ({
        ...current,
        status: 'disconnected',
        message: `${message} Provider endpoint awaits administrator activation.`,
        lastUpdatedAt: new Date().toISOString(),
      }));
      return;
    }

    if (provider === 'google_drive') {
      initiateGoogleDriveOAuth();
    }
  };

  const handleSync = async (integrationId: string) => {
    try {
      setSyncing((current) => (current === integrationId ? current : integrationId));
      await syncDocuments(integrationId);
      await loadIntegrations();
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Failed to sync documents. Please try again.');
    } finally {
      setSyncing((current) => (current === integrationId ? null : current));
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    if (!confirm('Are you sure you want to disconnect this integration?')) return;

    try {
      await disconnectIntegration(integrationId);
      await loadIntegrations();
    } catch (error) {
      console.error('Failed to disconnect:', error);
      alert('Failed to disconnect integration.');
    }
  };

  const connectWord = () => {
    setWordConnected((current) => (current ? current : true));
  };

  const connectOutlook = () => {
    setOutlookConnected((current) => (current ? current : true));
  };

  const analyzeWithPlaybook = async () => {
    if (!playbook.trim()) return;

    setAnalyzing((current) => (current ? current : true));
    window.setTimeout(() => {
      setAnalyzing((current) => (current ? false : current));
    }, 2000);
  };

  const draftEmail = () => {
    const nextDraft = `Dear Client,

Following our review of the complaint filed against your company, we have identified several strong pieces of evidence for your defense:

1. Prior Art Documentation: Patents filed 3 years before the plaintiff's claim
2. Witness Testimony: 5 corroborating witnesses confirming timeline
3. Financial Records: Clear documentation of independent development

We recommend proceeding with a motion to dismiss based on these grounds.

Best regards,
Your Legal Team`;

    setEmailDraft((current) => (current === nextDraft ? current : nextDraft));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Integrations</h2>
        <p className="text-white/50 text-sm">
          Connect with Word, Outlook, and your document management system
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Word Plugin</h3>
                <p className="text-white/50 text-sm">Draft and edit documents with AI</p>
              </div>
            </div>
            {wordConnected ? (
              <CheckCircle className="w-6 h-6 text-green-400" />
            ) : (
              <AlertCircle className="w-6 h-6 text-white/30" />
            )}
          </div>

          {!wordConnected ? (
            <button
              onClick={connectWord}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition uppercase tracking-wide text-sm"
            >
              Connect Word
            </button>
          ) : (
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2 text-sm">Features Available:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Pull organizational precedents
                  </li>
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    AI-suggested edits
                  </li>
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Instant application of changes
                  </li>
                </ul>
              </div>

              <div>
                <label className="block text-white/70 text-sm font-semibold mb-2 uppercase tracking-wide">
                  Run Custom Playbook
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={playbook}
                    onChange={(event) => setPlaybook((current) => (current === event.target.value ? current : event.target.value))}
                    placeholder="Describe your contract standards..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-white/30 text-sm"
                  />
                  <button
                    onClick={analyzeWithPlaybook}
                    disabled={analyzing || !playbook.trim()}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-white/5 disabled:text-white/30 text-white rounded-lg font-semibold transition text-sm"
                  >
                    {analyzing ? 'Analyzing...' : 'Analyze'}
                  </button>
                </div>
                <p className="text-white/40 text-xs mt-2">
                  AI will flag risky language based on your playbook
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Outlook Integration</h3>
                <p className="text-white/50 text-sm">Draft emails and manage correspondence</p>
              </div>
            </div>
            {outlookConnected ? (
              <CheckCircle className="w-6 h-6 text-green-400" />
            ) : (
              <AlertCircle className="w-6 h-6 text-white/30" />
            )}
          </div>

          {!outlookConnected ? (
            <button
              onClick={connectOutlook}
              className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition uppercase tracking-wide text-sm"
            >
              Connect Outlook
            </button>
          ) : (
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2 text-sm">Features Available:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Draft client emails
                  </li>
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Instant attachment summaries
                  </li>
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Auto-organize to vault
                  </li>
                </ul>
              </div>

              <button
                onClick={draftEmail}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2 text-sm"
              >
                <Sparkles className="w-4 h-4" />
                Draft Client Email
              </button>

              {emailDraft && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium text-sm">Email Draft</h4>
                    <button className="text-blue-400 text-xs hover:text-blue-300 transition">
                      Copy to Clipboard
                    </button>
                  </div>
                  <pre className="text-white/70 text-sm whitespace-pre-wrap leading-relaxed">
                    {emailDraft}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
            <Download className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">External Infrastructure Providers</h3>
            <p className="text-white/50 text-sm">Isolated OAuth mappings for secure document workspace sync</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-5 h-5 animate-spin text-white/40" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {externalInfrastructureProviders.map((provider) => {
              const integration = getIntegrationByProvider(provider.id);
              const status = getProviderStatus(provider.id, integration);
              const oauthState = oauthMappings[provider.id];
              const isActive = status === 'active';

              return (
                <div
                  key={provider.id}
                  className={`border rounded-lg p-4 transition ${
                    isActive
                      ? 'border-green-500/30 bg-green-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                        {getProviderIcon(provider.icon)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{provider.name}</p>
                        <p className="text-white/50 text-xs">{provider.description}</p>
                      </div>
                    </div>
                    {getStatusBadge(status)}
                  </div>

                  {integration?.provider_email && (
                    <p className="text-white/50 text-xs truncate mb-2">{integration.provider_email}</p>
                  )}

                  {integration?.last_sync_at && (
                    <p className="text-white/40 text-xs mb-3">
                      Last sync: {new Date(integration.last_sync_at).toLocaleDateString()}
                    </p>
                  )}

                  {oauthState.message && (
                    <p className="text-white/40 text-xs mb-3">{oauthState.message}</p>
                  )}

                  {integration ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSync(integration.id)}
                        disabled={syncing === integration.id}
                        className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-white/5 disabled:text-white/30 text-white rounded text-xs font-semibold transition flex items-center justify-center gap-1"
                      >
                        <RefreshCw className={`w-3 h-3 ${syncing === integration.id ? 'animate-spin' : ''}`} />
                        {syncing === integration.id ? 'Syncing...' : 'Sync'}
                      </button>
                      <button
                        onClick={() => handleDisconnect(integration.id)}
                        className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-xs font-semibold transition"
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => initiateOAuthFlow(provider.id)}
                      className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold transition"
                    >
                      {provider.actionLabel}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="text-white/40 text-xs leading-relaxed">
            Security Isolation Protocol: provider OAuth mappings are stored in isolated state slots,
            and every mutation is guarded through functional state updates to prevent stale-session
            writes across provider boundaries.
          </p>
        </div>
      </div>
    </div>
  );
}
