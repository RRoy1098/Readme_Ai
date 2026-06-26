import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import RepoInput from '../components/RepoInput.jsx';
import { analyzeRepository, listUserRepositories } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [repos, setRepos] = useState([]);
  const [fetchingRepos, setFetchingRepos] = useState(true);

  // Fetch user's repositories on mount
  useEffect(() => {
    setFetchingRepos(true);
    listUserRepositories()
      .then((data) => setRepos(data.data || []))
      .catch(() => {}) // silently fail — just shows empty
      .finally(() => setFetchingRepos(false));
  }, []);

  const handleAnalyze = useCallback(async (githubUrl) => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeRepository(githubUrl);
      const repo = result.data?.repository;
      if (repo?._id) {
        setRepos((prev) => [repo, ...prev.filter((r) => r._id !== repo._id)].slice(0, 20));
        navigate(`/analyze?id=${repo._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to analyze repository');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-300 text-xs font-semibold tracking-wider mb-4 ring-1 ring-primary-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
          AI-Powered Repository Intelligence
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight mb-3">
          Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-surface-400 text-lg max-w-2xl leading-relaxed">
          Paste a GitHub URL to analyze its structure, generate professional README files,
          ask questions about the code, and search semantically — all powered by Gemini AI.
        </p>
      </div>

      {/* Input */}
      <div className="mb-10 p-6 rounded-2xl bg-surface-900/50 border border-surface-800/60 backdrop-blur-sm">
        <h2 className="text-sm font-semibold text-surface-300 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
          Analyze New Repository
        </h2>
        <RepoInput value={url} onChange={setUrl} onSubmit={handleAnalyze} loading={loading} error={error} />
      </div>

      {/* My Repositories */}
      <div>
        <h2 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
          </svg>
          My Repositories
        </h2>

        {fetchingRepos ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : repos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-surface-700/60 p-8 text-center">
            <svg className="w-10 h-10 text-surface-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
            </svg>
            <p className="text-surface-500 text-sm">No repositories yet. Paste a GitHub URL above to get started.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {repos.map((repo) => (
              <button
                key={repo._id}
                onClick={() => navigate(`/analyze?id=${repo._id}`)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-900/40 border border-surface-800/40 hover:border-surface-700/60 hover:bg-surface-800/40 transition-all duration-200 text-left group"
              >
                <div className="p-2 rounded-lg bg-primary-500/10 text-primary-400 group-hover:bg-primary-500/20 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-200 truncate">{repo.name || repo.githubUrl}</p>
                  <p className="text-xs text-surface-500 truncate">
                    {repo.language !== 'Detecting...' ? `${repo.language} · ` : ''}
                    {repo.statistics?.files || 0} files
                  </p>
                </div>
                <span className="text-xs text-surface-600">
                  {repo.createdAt ? new Date(repo.createdAt).toLocaleDateString() : ''}
                </span>
                <svg className="w-4 h-4 text-surface-600 group-hover:text-surface-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
