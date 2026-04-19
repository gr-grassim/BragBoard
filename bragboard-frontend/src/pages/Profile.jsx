import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Briefcase, Shield, Edit2, Save, X, Loader2, Camera } from 'lucide-react';

export default function Profile() {
  const { user, token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    department: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user?.name || '',
        department: user?.department || 'Engineering'
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (response.ok) window.location.reload(); 
    } catch (error) { console.error(error); } 
    finally { setIsLoading(false); }
  };

  // NEW: Handle Avatar Upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append('avatar', file);

    try {
        const response = await fetch('http://127.0.0.1:8000/users/me/avatar', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: uploadData
        });
        if (response.ok) window.location.reload();
    } catch (error) { console.error("Avatar upload failed", error); }
    finally { setIsUploading(false); }
  };

  return (
    <div className="flex justify-center items-start pt-10 min-h-[500px]">
      <div className="relative w-full max-w-md group">
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-rose-500 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-white/90 backdrop-blur-xl rounded-[1.7rem] shadow-xl overflow-hidden border border-white/50">
            
            <div className="h-32 bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 skew-y-6 transform origin-bottom-left"></div>
                <div className="absolute top-4 right-4 flex gap-2">
                    {isEditing ? (
                        <>
                            <button onClick={() => setIsEditing(false)} className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md transition-all"><X className="w-4 h-4" /></button>
                            <button onClick={handleSave} disabled={isLoading} className="p-2 bg-white text-orange-600 rounded-full shadow-lg hover:scale-105 transition-all disabled:opacity-50">
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md transition-all group/edit"><Edit2 className="w-4 h-4 group-hover/edit:scale-110 transition-transform" /></button>
                    )}
                </div>
            </div>

            <div className="px-6 pb-8 text-center">
                
                {/* --- AVATAR SECTION --- */}
                <div className="relative -mt-16 mb-4 inline-block group/avatar">
                    <div className="w-32 h-32 rounded-full border-[5px] border-white shadow-lg bg-orange-50 flex items-center justify-center overflow-hidden relative">
                        {user?.avatar_path ? (
                            <img src={user.avatar_path} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-500 to-rose-600">
                                {user?.name?.charAt(0).toUpperCase()}
                            </span>
                        )}
                        
                        {/* Upload Overlay */}
                        {isUploading ? (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white"><Loader2 className="w-8 h-8 animate-spin" /></div>
                        ) : (
                            <div 
                                onClick={() => fileInputRef.current.click()}
                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer text-white font-bold text-xs"
                            >
                                <div className="flex flex-col items-center">
                                    <Camera className="w-6 h-6 mb-1" />
                                    <span>Change</span>
                                </div>
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                    </div>
                </div>

                <div className="mb-1">
                    {isEditing ? (
                        <input name="name" value={formData.name} onChange={handleChange} className="text-2xl font-bold text-center text-stone-800 bg-orange-50 border-b-2 border-orange-300 focus:border-orange-500 outline-none w-full max-w-[200px] px-2 py-1 rounded-t-lg" />
                    ) : (
                        <h2 className="text-2xl font-bold text-stone-800 tracking-tight">{user?.name}</h2>
                    )}
                </div>

                <div className="flex items-center justify-center gap-2 text-stone-500 text-sm font-medium mb-8">
                    <Mail className="w-4 h-4 text-orange-500" />
                    <span>{user?.email}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-2xl border transition-colors ${isEditing ? 'bg-white border-orange-300 ring-2 ring-orange-100' : 'bg-orange-50 border-orange-100'}`}>
                        <div className="flex justify-center mb-2"><div className="p-2 bg-orange-100 rounded-lg text-orange-600"><Briefcase className="w-5 h-5" /></div></div>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Department</p>
                        {isEditing ? (
                            <select name="department" value={formData.department} onChange={handleChange} className="w-full text-center font-bold text-stone-700 bg-transparent outline-none cursor-pointer">
                                <option value="Engineering">Engineering</option><option value="Sales">Sales</option><option value="Marketing">Marketing</option><option value="HR">HR</option>
                            </select>
                        ) : (
                            <p className="font-bold text-stone-700">{user?.department || 'N/A'}</p>
                        )}
                    </div>

                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100">
                         <div className="flex justify-center mb-2"><div className="p-2 bg-rose-100 rounded-lg text-rose-600"><Shield className="w-5 h-5" /></div></div>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Role</p>
                        <p className="font-bold text-stone-700 capitalize">{user?.role}</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}