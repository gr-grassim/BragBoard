import { useState, useEffect } from 'react';
import { X, Send, User, Image as ImageIcon, Trash2 } from 'lucide-react'; 
import { useAuth } from '../contexts/AuthContext';

export default function CreateShoutoutModal({ onClose, onShoutoutCreated }) {
    const { token } = useAuth();
    const [users, setUsers] = useState([]);
    
    // Form States
    const [selectedUserIds, setSelectedUserIds] = useState([]); // Array of IDs
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);

    // 1. Fetch Users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/users/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error("Failed to load users", error);
            }
        };
        fetchUsers();
    }, [token]);

    // Helper: Add User to Selection
    const handleSelectUser = (e) => {
        const userId = parseInt(e.target.value);
        if (!userId) return;
        
        // Prevent duplicates
        if (!selectedUserIds.includes(userId)) {
            setSelectedUserIds([...selectedUserIds, userId]);
        }
        // Reset dropdown
        e.target.value = ""; 
    };

    // Helper: Remove User from Selection
    const removeUser = (idToRemove) => {
        setSelectedUserIds(selectedUserIds.filter(id => id !== idToRemove));
    };

    // 2. Submit Logic (Using FormData for File Uploads)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedUserIds.length === 0) return;

        setLoading(true);
        try {
            // We must use FormData object to send files
            const formData = new FormData();
            formData.append('content', content);
            // Backend expects string "1,2,3"
            formData.append('receiver_ids', selectedUserIds.join(',')); 
            
            if (imageFile) {
                formData.append('image', imageFile);
            }

            const response = await fetch('http://127.0.0.1:8000/shoutouts', {
                method: 'POST',
                headers: {
                    // Do NOT set Content-Type header manually when using FormData
                    // The browser sets it automatically with the boundary
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                onShoutoutCreated(); 
                onClose();
            } else {
                const err = await response.json();
                alert(err.detail || "Failed to send");
            }
        } catch (error) {
            console.error("Failed to post shoutout", error);
        } finally {
            setLoading(false);
        }
    };

    // Helper to get user name by ID
    const getUserName = (id) => users.find(u => u.id === id)?.name || 'Unknown';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-orange-100 relative animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-orange-50 bg-gradient-to-r from-amber-50 to-orange-50 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-stone-800">New Shout-out</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-stone-400 hover:text-red-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    
                    {/* 1. Multi-Select Users */}
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Who is this for?</label>
                        
                        {/* Dropdown to add */}
                        <div className="relative mb-3">
                            <User className="absolute left-4 top-3.5 w-5 h-5 text-stone-400" />
                            <select 
                                className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 font-medium focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none appearance-none cursor-pointer"
                                onChange={handleSelectUser}
                                defaultValue=""
                            >
                                <option value="" disabled>Select a colleague to add...</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>{user.name} ({user.department})</option>
                                ))}
                            </select>
                        </div>

                        {/* Selected Tags Pills */}
                        <div className="flex flex-wrap gap-2">
                            {selectedUserIds.map(id => (
                                <span key={id} className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-bold">
                                    {getUserName(id)}
                                    <button 
                                        type="button" 
                                        onClick={() => removeUser(id)}
                                        className="hover:text-red-600"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* 2. Message Area */}
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Your Message</label>
                        <textarea 
                            required
                            rows="4"
                            className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 font-medium focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none resize-none"
                            placeholder="Enter your shout-out message..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>

                    {/* 3. Image Upload */}
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Attach Image (Optional)</label>
                        <div className="flex items-center gap-3">
                            <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl transition-colors font-medium text-sm">
                                <ImageIcon className="w-4 h-4" />
                                <span>{imageFile ? "Change Image" : "Choose Image"}</span>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={(e) => setImageFile(e.target.files[0])}
                                />
                            </label>
                            {imageFile && (
                                <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                                    <span className="truncate max-w-[150px]">{imageFile.name}</span>
                                    <button type="button" onClick={() => setImageFile(null)}>
                                        <Trash2 className="w-3 h-3 hover:text-red-500" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-2 flex justify-end gap-3 border-t border-stone-100 mt-4">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl font-bold text-stone-500 hover:bg-stone-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading || selectedUserIds.length === 0}
                            className="px-6 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-orange-200 flex items-center gap-2 transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending...' : (
                                <>
                                    <span>Post Shout-out</span>
                                    <Send className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}