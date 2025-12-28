import { useEffect, useState } from 'react';
import { FileText, Calendar, ArrowRight, AlertTriangle } from 'lucide-react';
// I will assume standard shadcn-like components might NOT exist or I should use raw tailwind if unsure.
// Looking at Header.tsx, it uses raw tailwind mostly. I'll stick to raw tailwind to be safe and "use current theme".

interface Release {
    version: string;
    date: string;
    changes: string[];
}

interface ReleaseData {
    releases: Release[];
    upcoming: string[];
    known_issues?: string[]; // Optional since it might not always exist
}

import { Layout } from '@/widgets/layout';

export function ReleaseNotesPage() {
    const [data, setData] = useState<ReleaseData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/data/release_notes.json')
            .then(res => {
                if (!res.ok) throw new Error('Failed to load release notes');
                return res.json();
            })
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError('Could not load release notes');
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <Layout>
                <div className="flex h-full items-center justify-center text-slate-400">
                    <div className="animate-pulse flex flex-col items-center gap-2">
                        <FileText className="h-8 w-8 opacity-50" />
                        <span>Loading release notes...</span>
                    </div>
                </div>
            </Layout>
        );
    }

    if (error || !data) {
        return (
            <Layout>
                <div className="flex h-full items-center justify-center text-red-400">
                    <div className="flex flex-col items-center gap-2">
                        <FileText className="h-8 w-8" />
                        <span>{error || 'No data found'}</span>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto py-12 px-6">
                <header className="mb-12">
                    <h1 className="text-3xl font-bold text-slate-100 mb-2 flex items-center gap-3">
                        <FileText className="h-8 w-8 text-sky-500" />
                        Release Notes
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Latest updates and improvements to CoreSplorer.
                    </p>
                </header>

                <div className="space-y-12">


                    {/* Release History */}
                    <div className="space-y-8">
                        {data.releases.map((release) => (
                            <div key={release.version} className="relative pl-8 border-l border-slate-800 pb-8 last:pb-0">
                                <div className="absolute left-[-5px] top-0 h-2.5 w-2.5 rounded-full bg-sky-500 ring-4 ring-slate-950" />
                                
                                <div className="flex items-baseline gap-4 mb-3">
                                    <h2 className="text-2xl font-bold text-slate-100">
                                        v{release.version}
                                    </h2>
                                    <div className="flex items-center text-sm text-slate-500 gap-1 bg-slate-900/50 px-2 py-0.5 rounded-full border border-slate-800">
                                        <Calendar className="h-3 w-3" />
                                        {release.date}
                                    </div>
                                </div>

                                <ul className="space-y-3">
                                    {release.changes.map((change, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-slate-300 group">
                                            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-700 group-hover:bg-sky-400 transition-colors" />
                                            <span className="leading-relaxed">{change}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Known Issues */}
                    {data.known_issues && data.known_issues.length > 0 && (
                        <section className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-amber-400 mb-4 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Known Issues
                            </h2>
                            <ul className="space-y-2">
                                {data.known_issues.map((issue, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-slate-300">
                                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                                        <span>{issue}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Upcoming Changes */}
                    {data.upcoming && data.upcoming.length > 0 && (
                        <section className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-indigo-400 mb-4 flex items-center gap-2">
                                <ArrowRight className="h-5 w-5" />
                                Upcoming Changes
                            </h2>
                            <ul className="space-y-2">
                                {data.upcoming.map((change, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-slate-300">
                                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                                        <span>{change}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>
            </div>
        </Layout>
    );
}
