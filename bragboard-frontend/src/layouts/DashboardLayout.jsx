import { useState } from 'react';
import { Home, Users, Briefcase, LogOut, Settings, UserCircle, Sun, Trophy } from 'lucide-react'; 
import { useAuth } from '../contexts/AuthContext';
import Feed from '../pages/Feed'; 
import UserDirectory from '../pages/UserDirectory'; 
import Profile from '../pages/Profile'; 
import Leaderboard from '../pages/Leaderboard';
import CreateShoutoutModal from '../components/CreateShoutoutModal'; 
import AdminDashboard from '../pages/AdminDashboard';

const DEPARTMENT_FILTERS = [ 'All Departments', 'Engineering', 'HR', 'Sales' ];

const NavItem = ({ icon: Icon, text, onClick, active }) => (
  <button
    onClick={onClick}
    className={`group flex items-center px-4 py-3 text-sm font-bold rounded-2xl transition-all duration-300 w-full mb-2 relative overflow-hidden ${
      active 
        ? 'bg-white text-orange-600 shadow-lg shadow-orange-200/50 ring-1 ring-orange-100' 
        : 'text-stone-500 hover:bg-white/60 hover:text-orange-600 hover:pl-6 hover:shadow-sm'
    }`}
  >
    {active && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 to-orange-500"></div>}
    <Icon className={`w-5 h-5 mr-3 transition-transform duration-300 ${active ? 'scale-110 text-orange-500' : 'group-hover:text-orange-500 group-hover:scale-110'}`} />
    <span className="relative z-10">{text}</span>
  </button>
);

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [currentView, setCurrentView] = useState('feed'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedRefreshKey, setFeedRefreshKey] = useState(0); 

  const handleShoutoutCreated = () => {
      setIsModalOpen(false); 
      setCurrentView('feed');  
      setFeedRefreshKey(prev => prev + 1); 
  };

  const renderContent = () => {
    switch(currentView) {
      case 'feed':
        return <Feed key={feedRefreshKey} departmentFilter={departmentFilter} />;
      case 'directory':
        return <UserDirectory departmentFilter={departmentFilter} />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'profile':
        return <Profile />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <Feed key={feedRefreshKey} departmentFilter={departmentFilter} />;
    }
  };

  const Header = () => (
    <header className="flex items-center justify-between h-20 px-8 border-b border-orange-100/50 bg-white/40 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 transform hover:rotate-12 transition-transform cursor-pointer">
            <Sun className="text-white w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-rose-600 tracking-tight">
            BragBoard
        </h1>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="text-right hidden md:block">
            <div className="text-sm font-bold text-stone-700 tracking-wide">{user?.name}</div>
            <div className="text-xs text-orange-500 uppercase font-black tracking-widest">{user?.role}</div>
        </div>
        <button onClick={logout} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-stone-500 bg-white/50 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all border border-transparent hover:border-rose-100 shadow-sm">
          <LogOut className="w-4 h-4" /> <span>Logout</span>
        </button>
      </div>
    </header>
  );

  const Sidebar = () => (
    <aside className="w-72 border-r border-orange-100/50 flex flex-col pt-8 bg-white/30 backdrop-blur-2xl relative z-20">
      <div className="px-6 mb-8">
        <h2 className="text-xs font-black text-stone-400 uppercase tracking-[0.2em] mb-4 px-2">Menu</h2>
        <div className="space-y-1">
            <NavItem icon={Home} text="Home" active={currentView === 'feed'} onClick={() => setCurrentView('feed')} />
            <NavItem icon={Users} text="User Directory" active={currentView === 'directory'} onClick={() => setCurrentView('directory')} />
            <NavItem icon={Trophy} text="Wall of Fame" active={currentView === 'leaderboard'} onClick={() => setCurrentView('leaderboard')} /> {/* <--- NEW ITEM */}
            <NavItem icon={UserCircle} text="My Profile" active={currentView === 'profile'} onClick={() => setCurrentView('profile')} />
            <NavItem icon={Briefcase} text="New Shout-Out" onClick={() => setIsModalOpen(true)} />
            
            {/* --- ADMIN MENU ITEM --- */}
            {user?.role === 'admin' && (
              <NavItem 
                icon={Settings} 
                text="Admin Dashboard" 
                active={currentView === 'admin'}
                onClick={() => setCurrentView('admin')} 
              />
            )}
        </div>
      </div>
      <div className="px-6 pb-6 pt-6 border-t border-orange-100/30">
        <h2 className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.1em] mb-2 px-4">Filter by department</h2>
        <div className="space-y-0.5">
          {DEPARTMENT_FILTERS.map(dept => (
            <button key={dept} onClick={() => setDepartmentFilter(dept)} className={`block w-full text-left px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${departmentFilter === dept ? 'text-stone-800 font-bold bg-stone-100' : 'text-stone-500 font-medium hover:text-stone-800 hover:bg-stone-50' }`}>{dept}</button>
          ))}
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 text-stone-800 font-sans selection:bg-orange-200 selection:text-orange-900">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-200/30 rounded-full blur-[120px] mix-blend-multiply"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] bg-rose-200/30 rounded-full blur-[120px] mix-blend-multiply"></div>
          <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-orange-100/40 rounded-full blur-[100px] mix-blend-multiply"></div>
      </div>
      <div className="relative z-10 flex flex-col h-screen">
        <Header />
        <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8"><div className="max-w-7xl mx-auto">{renderContent()}</div></main>
        </div>
      </div>
      {isModalOpen && <CreateShoutoutModal onClose={() => setIsModalOpen(false)} onShoutoutCreated={handleShoutoutCreated} />}
    </div>
  );
}