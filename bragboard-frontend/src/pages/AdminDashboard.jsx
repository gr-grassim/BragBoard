import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, TrendingUp, Users, AlertTriangle, CheckCircle, Trash2, Download } from 'lucide-react';

export default function AdminDashboard() {
    const { token } = useAuth();
    const [stats, setStats] = useState({ top_contributors: [], most_tagged: [] });
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statsRes = await fetch('http://127.0.0.1:8000/admin/stats', { headers: { Authorization: `Bearer ${token}` } });
                if(statsRes.ok) setStats(await statsRes.json());
                const reportsRes = await fetch('http://127.0.0.1:8000/admin/reports', { headers: { Authorization: `Bearer ${token}` } });
                if(reportsRes.ok) setReports(await reportsRes.json());
            } catch (error) { console.error(error); } finally { setLoading(false); }
        };
        fetchData();
    }, [token]);

    const handleDismiss = async (reportId) => {
        try {
            await fetch(`http://127.0.0.1:8000/admin/reports/${reportId}/resolve`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
            setReports(reports.filter(r => r.id !== reportId));
        } catch(e) { console.error(e); }
    };

    const handleDeletePost = async (shoutoutId, reportId) => {
        if(!confirm("Are you sure?")) return;
        try {
            await fetch(`http://127.0.0.1:8000/shoutouts/${shoutoutId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
            setReports(reports.filter(r => r.id !== reportId));
        } catch(e) { console.error(e); }
    };

    const downloadCSV = async (endpoint, filename) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000${endpoint}`, { headers: { Authorization: `Bearer ${token}` } });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch(e) { console.error("Download failed", e); }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <div className="flex justify-between items-end mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600"><Shield className="w-8 h-8" /></div>
                    <div><h2 className="text-3xl font-black text-stone-800">Admin Dashboard</h2><p className="text-stone-500 font-medium">Overview and Moderation</p></div>
                </div>
                
                {/* EXPORT BUTTONS */}
                <div className="flex gap-2">
                    <button onClick={() => downloadCSV('/admin/export/users', 'users.csv')} className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 text-stone-600 font-bold rounded-xl hover:bg-stone-50 shadow-sm transition-all"><Download className="w-4 h-4" /> Users CSV</button>
                    <button onClick={() => downloadCSV('/admin/export/shoutouts', 'shoutouts.csv')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"><Download className="w-4 h-4" /> Shoutouts CSV</button>
                </div>
            </div>

            {/* Stats (Re-used for Admin View) */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                    <div className="flex items-center gap-2 mb-4 text-emerald-600 font-bold uppercase text-xs tracking-widest"><TrendingUp className="w-4 h-4" /> Top Contributors</div>
                    <ul className="space-y-3">{stats.top_contributors.map((user, idx) => <li key={idx} className="flex justify-between p-3 bg-stone-50 rounded-lg"><span className="font-bold text-stone-700">{idx+1}. {user.name}</span><span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md">{user.count} Posts</span></li>)}</ul>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                    <div className="flex items-center gap-2 mb-4 text-orange-600 font-bold uppercase text-xs tracking-widest"><Users className="w-4 h-4" /> Most Recognized</div>
                    <ul className="space-y-3">{stats.most_tagged.map((user, idx) => <li key={idx} className="flex justify-between p-3 bg-stone-50 rounded-lg"><span className="font-bold text-stone-700">{idx+1}. {user.name}</span><span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-md">{user.count} Shout-outs</span></li>)}</ul>
                </div>
            </div>

            {/* Reports */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center gap-2 text-red-700 font-bold"><AlertTriangle className="w-5 h-5" /><h3>Pending Reports ({reports.length})</h3></div>
                {reports.length === 0 ? <div className="p-10 text-center text-stone-400">No pending reports. All clear!</div> : 
                    <div className="divide-y divide-stone-100">
                        {reports.map(report => (
                            <div key={report.id} className="p-6 flex flex-col md:flex-row gap-4 justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1"><span className="font-bold text-stone-800">Reported by {report.reporter.name}</span></div>
                                    <p className="text-red-600 font-medium text-sm mb-3">Reason: "{report.reason}"</p>
                                    <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 text-sm text-stone-600 italic">"{report.shoutout.content}"</div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleDismiss(report.id)} className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 font-bold text-sm"><CheckCircle className="w-4 h-4" /> Dismiss</button>
                                    <button onClick={() => handleDeletePost(report.shoutout.id, report.id)} className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-bold text-sm"><Trash2 className="w-4 h-4" /> Delete Post</button>
                                </div>
                            </div>
                        ))}
                    </div>
                }
            </div>
        </div>
    );
}