import { Video, Phone, CalendarDays } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { getMeetingPreferences, getTranslator } from '../utils/meetingUtils';

export default function MeetingSidebar({ onClose }) {
  const [language, setLanguage] = useState(getMeetingPreferences().language);
  const activeClass = "w-full flex items-center gap-4 px-4 py-3 bg-blue-50 text-blue-700 rounded-full font-medium shadow-sm transition-all group";
  const inactiveClass = "w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 text-gray-500 rounded-full font-medium transition-all group";
  const t = useMemo(() => getTranslator(language), [language]);

  useEffect(() => {
    const syncPreferences = (event) => setLanguage((event.detail || getMeetingPreferences()).language);
    window.addEventListener('meeting-preferences-updated', syncPreferences);
    return () => window.removeEventListener('meeting-preferences-updated', syncPreferences);
  }, []);

  return (
    <>
      {/* Persistent backdrop when sidebar is open */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 transition-opacity animate-in fade-in duration-300" 
        onClick={onClose}
      />
      <aside className="fixed top-16 bottom-0 left-0 z-50 w-72 bg-white border-r border-gray-100 flex flex-col py-6 shadow-[20px_0_50px_rgba(0,0,0,0.1)] animate-in slide-in-from-left-full duration-500 ease-out">
        <nav className="space-y-2 px-2">
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? activeClass : inactiveClass}
            onClick={onClose}
          >
            <Video size={20} className="group-hover:scale-110 transition-transform" />
            <span>{t('meetings')}</span>
          </NavLink>
          
          <NavLink 
            to="/calls" 
            className={({ isActive }) => isActive ? activeClass : inactiveClass}
            onClick={onClose}
          >
            <Phone size={20} className="group-hover:scale-110 transition-transform" />
            <span>{t('calls')}</span>
          </NavLink>

          <NavLink
            to="/calendar"
            className={({ isActive }) => isActive ? activeClass : inactiveClass}
            onClick={onClose}
          >
            <CalendarDays size={20} className="group-hover:scale-110 transition-transform" />
            <span>{t('calendar')}</span>
          </NavLink>
        </nav>
      </aside>
    </>
  );
}
