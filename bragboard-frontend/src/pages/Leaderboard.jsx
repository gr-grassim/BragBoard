import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Medal, Star, Flame } from 'lucide-react';

export default function Leaderboard() {
    const { token } = useAuth();
    const [stats, setStats] = useState({ top_contributors: [], most_tagged: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/leaderboard', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if(response.ok) setStats(await response.json());
            } catch (error) {
                console.error("Leaderboard fetch error", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    const RankIcon = ({ rank }) => {
        if (rank === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
        if (rank === 1) return <Medal className="w-6 h-6 text-stone-400" />;
        if (rank === 2) return <Medal className="w-6 h-6 text-orange-700" />;
        return <span className="font-bold text-stone-400">#{rank + 1}</span>;
    };

    if (loading) return <div className="p-10 text-center">Loading Leaderboard...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="text-center space-y-2">
                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Wall of Fame</h2>
                <p className="text-stone-500 font-medium">Celebrating our top performers and supportive teammates.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                
                {/* Most Recognized (Received) */}
                <div className="bg-white rounded-3xl shadow-xl shadow-orange-100/50 overflow-hidden border border-orange-100 relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-orange-500"></div>
                    <div className="p-6 text-center bg-orange-50/50 border-b border-orange-100">
                        <div className="inline-flex p-3 bg-white rounded-2xl shadow-sm text-orange-500 mb-3"><Star className="w-8 h-8 fill-current" /></div>
                        <h3 className="text-xl font-black text-stone-800">Most Appreciated</h3>
                        <p className="text-xs font-bold text-orange-400 uppercase tracking-widest">Received the most Shout-outs</p>
                    </div>
                    <div className="p-4">
                        {stats.most_tagged.map((user, idx) => (
                            <div key={idx} className={`flex items-center gap-4 p-4 rounded-2xl mb-2 transition-transform hover:scale-[1.02] ${idx === 0 ? 'bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-100' : 'bg-white border border-stone-50'}`}>
                                <div className="w-8 flex justify-center"><RankIcon rank={idx} /></div>
                                <div className="flex-1 font-bold text-stone-700 text-lg">{user.name}</div>
                                <div className="text-2xl font-black text-orange-500">{user.count}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Contributors (Sent) */}
                <div className="bg-white rounded-3xl shadow-xl shadow-blue-100/50 overflow-hidden border border-blue-100 relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                    <div className="p-6 text-center bg-blue-50/50 border-b border-blue-100">
                        <div className="inline-flex p-3 bg-white rounded-2xl shadow-sm text-blue-500 mb-3"><Flame className="w-8 h-8 fill-current" /></div>
                        <h3 className="text-xl font-black text-stone-800">Top Supporters</h3>
                        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Sent the most Shout-outs</p>
                    </div>
                    <div className="p-4">
                        {stats.top_contributors.map((user, idx) => (
                            <div key={idx} className={`flex items-center gap-4 p-4 rounded-2xl mb-2 transition-transform hover:scale-[1.02] ${idx === 0 ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100' : 'bg-white border border-stone-50'}`}>
                                <div className="w-8 flex justify-center"><RankIcon rank={idx} /></div>
                                <div className="flex-1 font-bold text-stone-700 text-lg">{user.name}</div>
                                <div className="text-2xl font-black text-blue-500">{user.count}</div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}