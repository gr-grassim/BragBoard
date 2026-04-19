import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Briefcase, Search } from 'lucide-react';

export default function UserDirectory({ departmentFilter }) {
    const { token } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, [departmentFilter]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            let url = 'http://127.0.0.1:8000/users/';
            if (departmentFilter && departmentFilter !== 'All Departments') {
                url += `?department=${encodeURIComponent(departmentFilter)}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch users');
            
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            console.error(err);
            setError('Could not load user directory.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-stone-800 tracking-tight">Team Directory</h2>
                <p className="text-stone-500 mt-1">
                    Showing {users.length} members in <span className="font-bold text-orange-500">{departmentFilter}</span>
                </p>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full mx-auto mb-4"></div>
                    <p className="text-stone-400 font-medium">Loading team members...</p>
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-center">
                    {error}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {users.map((user) => (
                        // CARD: Compact Horizontal Layout
                        <div 
                            key={user.id} 
                            className="group bg-white p-5 rounded-2xl shadow-sm border border-stone-100 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-100/50 transition-all duration-300 flex flex-col justify-between h-full"
                        >
                            {/* Top Section: Avatar + Name Side-by-Side */}
                            <div className="flex items-center space-x-4 mb-4">
                                
                                {/* --- UPDATED AVATAR LOGIC --- */}
                                <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 text-orange-600 border border-white shadow-sm flex items-center justify-center text-lg font-bold overflow-hidden">
                                    {user.avatar_path ? (
                                        <img 
                                            src={user.avatar_path} 
                                            alt={user.name} 
                                            className="w-full h-full object-cover" 
                                        />
                                    ) : (
                                        user.name.charAt(0).toUpperCase()
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <h3 className="font-bold text-stone-800 truncate group-hover:text-orange-600 transition-colors">
                                        {user.name}
                                    </h3>
                                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-stone-50 text-stone-500 border border-stone-100 mt-1">
                                        {user.role}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Divider Line */}
                            <div className="border-t border-stone-50 mb-3"></div>
                            
                            {/* Bottom Section: Details */}
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center text-stone-500">
                                    <Briefcase className="w-4 h-4 mr-2 text-orange-300 shrink-0" />
                                    <span className="truncate">{user.department || "No Dept"}</span>
                                </div>
                                <div className="flex items-center text-stone-500">
                                    <Mail className="w-4 h-4 mr-2 text-orange-300 shrink-0" />
                                    <span className="truncate">{user.email}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {users.length === 0 && (
                        <div className="col-span-full text-center py-20 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
                            <Search className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                            <p className="text-stone-400 font-medium">No team members found.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}