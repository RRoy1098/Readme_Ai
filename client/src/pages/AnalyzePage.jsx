import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import RepoInput from '../components/RepoInput.jsx';
import StatCard from '../components/StatCard.jsx';
import { analyzeRepository, getRepository } from '../services/api.js';

export default function AnalyzePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const repoId = searchParams.get('id');

  const [repo, setRepo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (repoId) {
      setLoading(true);
      getRepository(repoId)
        .then((res) => setRepo(res.data))
        .catch((err) => setError(err.response?.data?.error || 'Failed to load repository'))
        .finally(() => setLoading(false));
    }
  }, [repoId]);

  const handleAnalyze = async (githubUrl) => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeRepository(githubUrl);
      const repo = result.data?.repository;
      if (repo) {
        setRepo(repo);
        navigate(`/analyze?id=${repo._id}`, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Repository Analysis</h1>
        <p className="text-surface-400">Analyze and explore repository structure, metadata, and statistics.</p>
      </div>

      <div className="mb-8 p-5 rounded-xl bg-surface-900/40 border border-surface-800/60">
        <RepoInput value={url} onChange={setUrl} onSubmit={handleAnalyze} loading={loading} error={error} />
      </div>

      {loading && !repo && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-surface-400">Analyzing repository...</p>
          </div>
        </div>
      )}

      {repo && (
        <div className="animate-fade-in">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8 p-5 rounded-xl bg-surface-900/60 border border-surface-800/60">
            <div className="p-3 rounded-xl bg-primary-500/10 text-primary-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{repo.name}</h2>
              <p className="text-sm text-surface-400">{repo.githubUrl}</p>
            </div>
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => navigate(`/readme?repositoryId=${repo._id}`)}
                className="px-4 py-2 bg-primary-600/20 hover:bg-primary-600/30 text-primary-300 text-sm font-medium rounded-lg transition-colors"
              >
                Generate README
              </button>
              <button
                onClick={() => navigate(`/chat?repositoryId=${repo._id}`)}
                className="px-4 py-2 bg-accent-600/20 hover:bg-accent-600/30 text-accent-300 text-sm font-medium rounded-lg transition-colors"
              >
                Chat
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>}
              label="Language" value={repo.language || '—'} color="primary"
            />
            <StatCard
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>}
              label="Framework" value={repo.framework || '—'} color="accent"
            />
            <StatCard
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" /></svg>}
              label="Database" value={repo.database || '—'} color="success"
            />
            <StatCard
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>}
              label="Package Manager" value={repo.packageManager || '—'} color="warning"
            />
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-xl bg-surface-900/40 border border-surface-800/60 p-4">
              <p className="text-xs text-surface-500 uppercase tracking-wider mb-1">Files</p>
              <p className="text-xl font-bold text-white">{repo.statistics?.files ?? '—'}</p>
            </div>
            <div className="rounded-xl bg-surface-900/40 border border-surface-800/60 p-4">
              <p className="text-xs text-surface-500 uppercase tracking-wider mb-1">Folders</p>
              <p className="text-xl font-bold text-white">{repo.statistics?.folders ?? '—'}</p>
            </div>
            <div className="rounded-xl bg-surface-900/40 border border-surface-800/60 p-4">
              <p className="text-xs text-surface-500 uppercase tracking-wider mb-1">Lines of Code</p>
              <p className="text-xl font-bold text-white">{repo.statistics?.linesOfCode ?? repo.statistics?.lines ?? '—'}</p>
            </div>
            <div className="rounded-xl bg-surface-900/40 border border-surface-800/60 p-4">
              <p className="text-xs text-surface-500 uppercase tracking-wider mb-1">Dependencies</p>
              <p className="text-xl font-bold text-white">{repo.dependencies?.length ?? '—'}</p>
            </div>
          </div>

          {/* Dependencies & Folder Tree */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-surface-800/60 bg-surface-900/40 overflow-hidden">
              <div className="px-5 py-3 border-b border-surface-800/60">
                <h3 className="text-sm font-semibold text-surface-300">Dependencies</h3>
              </div>
              <div className="p-5 max-h-64 overflow-y-auto">
                {repo.dependencies?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {repo.dependencies.map((dep, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-md bg-surface-800/60 text-xs text-surface-300 font-mono">
                        {dep}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-surface-500">No dependencies detected</p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-surface-800/60 bg-surface-900/40 overflow-hidden">
              <div className="px-5 py-3 border-b border-surface-800/60">
                <h3 className="text-sm font-semibold text-surface-300">Folder Structure</h3>
              </div>
              <div className="p-5 max-h-64 overflow-y-auto">
                {repo.folderTree?.length > 0 ? (
                  <div className="space-y-0.5 font-mono text-xs">
                    {repo.folderTree.map((item, i) => {
                      // Handle both string arrays and object arrays
                      const rawPath = typeof item === 'string' ? item : item.path;
                      const lastSegment = rawPath.split('/').pop() || rawPath;
                      // A path is a file if the last segment has a known file extension
                      const hasFileExt = /\.\w+$/.test(lastSegment);
                      const isFile = hasFileExt || (rawPath.includes('.') && lastSegment !== '.');
                      const depth = rawPath.split('/').length - (rawPath.endsWith('/') ? 1 : 0);
                      return (
                        <div key={i} className="flex items-center gap-2 text-surface-400" style={{ paddingLeft: `${depth * 12}px` }}>
                          <span className="text-surface-600 flex-shrink-0">{isFile ? '📄' : '📁'}</span>
                          <span className={isFile ? '' : 'text-surface-300 font-medium'}>{rawPath || '.'}</span>
                        </div>
                      );
                    })}

                  </div>
                ) : (
                  <p className="text-sm text-surface-500">No folder structure available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
