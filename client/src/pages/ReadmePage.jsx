import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import MarkdownRenderer from '../components/MarkdownRenderer.jsx';
import { generateReadme, getReadme, listUserReadmes } from '../services/api.js';

export default function ReadmePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const repositoryId = searchParams.get('repositoryId');

  const [readme, setReadme] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [userReadmes, setUserReadmes] = useState([]);
  const [fetchingReadmes, setFetchingReadmes] = useState(true);

  // Find the currently active repository object from the sidebar list
  const activeRepo = userReadmes.find(item => item.repositoryId === repositoryId || item.repository?._id === repositoryId);

  // Fetch all user READMEs on component mount
  useEffect(() => {
    setFetchingReadmes(true);
    listUserReadmes()
      .then((res) => setUserReadmes(res.data || []))
      .catch(() => {})
      .finally(() => setFetchingReadmes(false));
  }, []);

  // Fetch specific repository markdown automatically when repositoryId changes
  useEffect(() => {
    if (!repositoryId) {
      setReadme(null);
      return;
    }

    const fetchReadmeData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getReadme(repositoryId);
        // Fallback checks to extract Markdown text depending on your API wrapper structure
        const md = result.data?.markdown || (typeof result.data === 'string' ? result.data : '');
        setReadme(md || null);
      } catch (err) {
        // Silently clear or handle if it just hasn't been generated yet
        setReadme(null);
      } finally {
        setLoading(false);
      }
    };

    fetchReadmeData();
  }, [repositoryId]);

  const handleGenerate = async () => {
    if (!repositoryId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await generateReadme(repositoryId);
      const md = result.data?.markdown || '';
      setReadme(md);
      // Refresh the historical list in the sidebar
      const res = await listUserReadmes();
      setUserReadmes(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to generate README');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (readme) {
      navigator.clipboard.writeText(readme);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = (md, repoName) => {
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${repoName || 'README'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight mb-2">README Generator</h1>
        <p className="text-surface-400">Generate, view, and download professional README files powered by RAG and Gemini AI.</p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar: All READMEs */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-surface-800/60 bg-surface-900/40 overflow-hidden sticky top-4">
            <div className="px-4 py-3 border-b border-surface-800/60">
              <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Your READMEs</h2>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-2">
              {fetchingReadmes ? (
                <div className="flex justify-center py-6">
                  <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : userReadmes.length === 0 ? (
                <p className="text-xs text-surface-500 text-center py-6">No READMEs generated yet.</p>
              ) : (
                <div className="space-y-1">
                  {userReadmes.map((item) => {
                    const currentId = item.repositoryId || item.repository?._id;
                    const isSelected = currentId === repositoryId;
                    return (
                      <button
                        key={item._id}
                        onClick={() => navigate(`/readme?repositoryId=${currentId}`)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                          isSelected
                            ? 'bg-primary-600/15 text-primary-300'
                            : 'text-surface-400 hover:bg-surface-800/50 hover:text-surface-200'
                        }`}
                      >
                        <p className="text-sm font-medium truncate">{item.repository?.name || 'Unknown'}</p>
                        <p className="text-[11px] text-surface-500 truncate">
                          {item.repository?.language || ''} · {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main: README view */}
        <div className="lg:col-span-2">
          {!repositoryId && (
            <div className="p-8 rounded-xl bg-surface-900/40 border border-surface-800/60 text-center">
              <div className="p-3 rounded-full bg-primary-500/10 text-primary-400 w-fit mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">Select or generate a README</h2>
              <p className="text-sm text-surface-400 mb-5">Choose a repository from the sidebar or analyze a new one.</p>
              <button onClick={() => navigate('/')} className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold rounded-lg transition-colors">Go to Dashboard</button>
            </div>
          )}

          {repositoryId && !readme && !loading && (
            <div className="p-8 rounded-xl bg-surface-900/40 border border-surface-800/60 text-center">
              <p className="text-surface-400 mb-5">Generate a professional README for this repository.</p>
              <button onClick={handleGenerate} className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-primary-600/20 hover:shadow-primary-500/30">
                Generate README
              </button>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-surface-400">Processing with RAG + Gemini...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-error-500/10 border border-error-500/20 text-error-400 text-sm mb-6">{error}</div>
          )}

          {readme && !loading && (
            <div className="animate-fade-in">
              {/* Toolbar */}
              <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-surface-900/60 border border-surface-800/60">
                <div className="flex items-center gap-2 flex-1">
                  <svg className="w-4 h-4 text-success-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs text-surface-400">README ready</span>
                </div>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-surface-800 hover:bg-surface-700 text-surface-300 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                >
                  {copied ? (
                    <><svg className="w-3.5 h-3.5 text-success-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>Copied</>
                  ) : (
                    <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>Copy</>
                  )}
                </button>
                <button
                  onClick={() => handleDownload(readme, activeRepo?.repository?.name || 'README')}
                  className="px-3 py-1.5 bg-surface-800 hover:bg-surface-700 text-surface-300 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download .md
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="px-3 py-1.5 bg-primary-600/20 hover:bg-primary-600/30 text-primary-300 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                  </svg>
                  Regenerate
                </button>
              </div>

              {/* Preview */}
              <div className="rounded-xl border border-surface-800/60 bg-surface-900/40 overflow-hidden">
                <div className="px-5 py-3 border-b border-surface-800/60 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-error-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-warning-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-success-500/60" />
                  </div>
                  <span className="text-xs text-surface-500 ml-2">README.md — Preview</span>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  <MarkdownRenderer content={readme} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}