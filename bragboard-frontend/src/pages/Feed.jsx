import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Heart, Clock, User as UserIcon, ThumbsUp, Star, Send, Trash2, Edit2, X, Check, Flag, AlertTriangle } from 'lucide-react';

export default function Feed({ departmentFilter }) {
  const { token, user } = useAuth();
  const [shoutouts, setShoutouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  const [editingShoutout, setEditingShoutout] = useState(null); 
  const [editingComment, setEditingComment] = useState(null);   
  const [reportingShoutout, setReportingShoutout] = useState(null); 

  useEffect(() => {
    const fetchShoutouts = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/shoutouts', { headers: { Authorization: `Bearer ${token}` } });
        if (response.ok) setShoutouts(await response.json());
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    fetchShoutouts();
  }, [token, refreshKey]); 

  const filteredShoutouts = shoutouts.filter(shoutout => {
    if (departmentFilter === 'All Departments') return true;
    return shoutout.recipients.some(user => user.department === departmentFilter);
  });

  const handleReaction = async (shoutoutId, type) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/shoutouts/${shoutoutId}/react`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ type })
      });
      if (response.ok) setRefreshKey(prev => prev + 1); 
    } catch (error) { console.error(error); }
  };

  const handlePostComment = async (shoutoutId) => {
    const content = commentInputs[shoutoutId];
    if (!content || !content.trim()) return;
    try {
        const response = await fetch(`http://127.0.0.1:8000/shoutouts/${shoutoutId}/comments`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ content })
        });
        if (response.ok) { setCommentInputs(prev => ({ ...prev, [shoutoutId]: '' })); setRefreshKey(prev => prev + 1); }
    } catch (error) { console.error(error); }
  };

  const deleteShoutout = async (id) => {
      if(!confirm("Are you sure you want to delete this post?")) return;
      try { await fetch(`http://127.0.0.1:8000/shoutouts/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); setRefreshKey(prev => prev + 1); } catch(e) { console.error(e); }
  };

  const updateShoutout = async () => {
      try { await fetch(`http://127.0.0.1:8000/shoutouts/${editingShoutout.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: editingShoutout.content }) }); setEditingShoutout(null); setRefreshKey(prev => prev + 1); } catch(e) { console.error(e); }
  };

  const deleteComment = async (id) => { if(!confirm("Delete this comment?")) return; try { await fetch(`http://127.0.0.1:8000/comments/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); setRefreshKey(prev => prev + 1); } catch(e) { console.error(e); } };

  const updateComment = async () => { try { await fetch(`http://127.0.0.1:8000/comments/${editingComment.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: editingComment.content }) }); setEditingComment(null); setRefreshKey(prev => prev + 1); } catch(e) { console.error(e); } };

  const submitReport = async (shoutoutId, reason) => {
    try { await fetch(`http://127.0.0.1:8000/shoutouts/${shoutoutId}/report`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ reason }) }); alert("Report submitted to Admins."); setReportingShoutout(null); } catch(e) { console.error(e); }
  };

  const handleInputChange = (shoutoutId, text) => setCommentInputs(prev => ({ ...prev, [shoutoutId]: text }));
  const getReactionCount = (reactions, type) => reactions.filter(r => r.type === type).length;
  const hasUserReacted = (reactions, type) => reactions.some(r => r.type === type && r.user_id === user?.id);
  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500"></div></div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-end mb-8">
        <div><h2 className="text-3xl font-black text-stone-800 tracking-tight">{departmentFilter === 'All Departments' ? 'All Departments Feed' : `${departmentFilter} Team`}</h2><p className="text-stone-500 font-medium mt-1">Celebrating wins across the board.</p></div>
        <div className="bg-white/50 px-4 py-2 rounded-xl text-xs font-bold text-orange-600 border border-orange-100 shadow-sm">{filteredShoutouts.length} Posts</div>
      </div>

      <div className="grid gap-6">
        {filteredShoutouts.map((shoutout) => (
          <div key={shoutout.id} className="group bg-white/70 backdrop-blur-md border border-white/60 p-6 rounded-3xl shadow-sm hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-amber-300 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                 {/* Report Button (For everyone except sender) */}
                 {user?.id !== shoutout.sender_id && (
                     <button onClick={() => setReportingShoutout({id: shoutout.id})} className="p-1.5 bg-white text-stone-400 hover:text-red-500 rounded-lg shadow-sm" title="Report"><Flag className="w-3.5 h-3.5" /></button>
                 )}
                 {/* Edit/Delete (Owner OR Admin) */}
                {(user?.id === shoutout.sender_id || user?.role === 'admin') && (
                    <>
                        {user?.id === shoutout.sender_id && <button onClick={() => setEditingShoutout({id: shoutout.id, content: shoutout.content})} className="p-1.5 bg-white text-stone-400 hover:text-blue-500 rounded-lg shadow-sm"><Edit2 className="w-3.5 h-3.5" /></button>}
                        <button onClick={() => deleteShoutout(shoutout.id)} className="p-1.5 bg-white text-stone-400 hover:text-red-500 rounded-lg shadow-sm"><Trash2 className="w-3.5 h-3.5" /></button>
                    </>
                )}
            </div>

            {reportingShoutout?.id === shoutout.id && (
                <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur flex items-center justify-center p-6">
                    <div className="w-full max-w-sm">
                        <div className="flex items-center gap-2 text-red-600 font-bold mb-2"><AlertTriangle className="w-5 h-5"/> Report Post</div>
                        <p className="text-sm text-stone-500 mb-3">Why are you reporting this?</p>
                        <div className="space-y-2">
                            <button onClick={() => submitReport(shoutout.id, "Inappropriate Content")} className="w-full text-left px-4 py-2 bg-stone-100 hover:bg-red-50 text-sm font-medium rounded-lg">Inappropriate Content</button>
                            <button onClick={() => submitReport(shoutout.id, "Spam")} className="w-full text-left px-4 py-2 bg-stone-100 hover:bg-red-50 text-sm font-medium rounded-lg">Spam</button>
                            <button onClick={() => setReportingShoutout(null)} className="w-full text-center mt-2 text-xs font-bold text-stone-400 hover:text-stone-600">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-start gap-4 relative z-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center shadow-inner text-stone-400 shrink-0 font-bold text-xl overflow-hidden">
                 {shoutout.sender.avatar_path ? <img src={shoutout.sender.avatar_path} alt={shoutout.sender.name} className="w-full h-full object-cover" /> : shoutout.sender.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2 leading-relaxed">
                  <span className="font-bold text-stone-800">{shoutout.sender.name}</span><span className="text-xs font-bold text-stone-400 uppercase tracking-wider">shouted out</span>
                  <div className="flex flex-wrap gap-2">{shoutout.recipients.map(r => <span key={r.id} className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-100">{r.name}</span>)}</div>
                </div>
                {editingShoutout?.id === shoutout.id ? (
                    <div className="mb-4 flex gap-2"><textarea value={editingShoutout.content} onChange={(e) => setEditingShoutout({...editingShoutout, content: e.target.value})} className="w-full p-2 border border-orange-300 rounded-lg outline-none bg-orange-50" /><div className="flex flex-col gap-1"><button onClick={updateShoutout} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"><Check className="w-4 h-4" /></button><button onClick={() => setEditingShoutout(null)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><X className="w-4 h-4" /></button></div></div>
                ) : ( <p className="text-stone-600 leading-relaxed text-lg mb-4">"{shoutout.content}"</p> )}
                {shoutout.image_path && <div className="mb-4 rounded-xl overflow-hidden border border-stone-100 shadow-sm"><img src={shoutout.image_path} alt="Shoutout" className="w-full h-auto max-h-96 object-cover" /></div>}
                <div className="flex items-center justify-between pt-4 border-t border-stone-100/50 mb-4">
                    <div className="flex items-center gap-4 text-xs font-bold text-stone-400"><div className="flex items-center gap-1.5 bg-stone-100/50 px-3 py-1.5 rounded-lg"><Clock className="w-3.5 h-3.5" /><span>{formatDate(shoutout.created_at)}</span></div></div>
                    <div className="flex items-center gap-1">{['like', 'heart', 'star'].map(type => (<button key={type} onClick={() => handleReaction(shoutout.id, type)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${hasUserReacted(shoutout.reactions, type) ? 'bg-orange-100 text-orange-600' : 'bg-stone-50 text-stone-400'}`}>{type === 'like' ? <ThumbsUp className="w-3.5 h-3.5" /> : type === 'heart' ? <Heart className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}<span>{getReactionCount(shoutout.reactions, type) || ''}</span></button>))}</div>
                </div>
                <div className="bg-stone-50/50 rounded-xl p-4">
                    {shoutout.comments && shoutout.comments.length > 0 && (
                        <div className="space-y-3 mb-4">
                            {shoutout.comments.map(comment => (
                                <div key={comment.id} className="flex gap-3 text-sm group/comment relative">
                                    <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center text-[10px] font-bold text-stone-500 shrink-0 overflow-hidden">{comment.user.avatar_path ? <img src={comment.user.avatar_path} alt={comment.user.name} className="w-full h-full object-cover" /> : comment.user.name.charAt(0)}</div>
                                    <div className="flex-1"><div className="flex items-baseline gap-2"><span className="font-bold text-stone-700">{comment.user.name}</span><span className="text-[10px] text-stone-400">{formatDate(comment.created_at)}</span></div>{editingComment?.id === comment.id ? (<div className="flex gap-2 mt-1"><input value={editingComment.content} onChange={(e) => setEditingComment({...editingComment, content: e.target.value})} className="w-full p-1 text-sm border border-stone-300 rounded" /><button onClick={updateComment}><Check className="w-3 h-3 text-green-600" /></button><button onClick={() => setEditingComment(null)}><X className="w-3 h-3 text-red-600" /></button></div>) : ( <p className="text-stone-600">{comment.content}</p> )}</div>
                                    {(user?.id === comment.user_id || user?.role === 'admin') && !editingComment && (<div className="absolute right-0 top-0 opacity-0 group-hover/comment:opacity-100 flex gap-1">{user?.id === comment.user_id && <button onClick={() => setEditingComment({id: comment.id, content: comment.content})} className="text-stone-400 hover:text-blue-500"><Edit2 className="w-3 h-3" /></button>}<button onClick={() => deleteComment(comment.id)} className="text-stone-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button></div>)}
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="relative"><input type="text" placeholder="Write a comment..." className="w-full pl-4 pr-12 py-3 bg-white border border-stone-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-200 outline-none transition-all" value={commentInputs[shoutout.id] || ''} onChange={(e) => handleInputChange(shoutout.id, e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handlePostComment(shoutout.id)} /><button onClick={() => handlePostComment(shoutout.id)} className="absolute right-2 top-2 p-1.5 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-500 hover:text-white transition-colors"><Send className="w-4 h-4" /></button></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}