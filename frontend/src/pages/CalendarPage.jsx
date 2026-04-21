import { useState, useEffect } from 'react';
import { addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
import MeetingHeader from '../components/MeetingHeader';
import MeetingSidebar from '../components/MeetingSidebar';
import CalendarHeader from '../components/CalendarHeader';
import CalendarSidebar from '../components/CalendarSidebar';
import { MonthView, WeekView, DayView } from '../components/CalendarViews';
import EventModal from '../components/EventModal';
import { buildApiUrl } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('Month');
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [toast, setToast] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(buildApiUrl('/api/calendar/events'));
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  };

  const handlePrev = () => {
    if (view === 'Month') setCurrentDate(subMonths(currentDate, 1));
    else if (view === 'Week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (view === 'Month') setCurrentDate(addMonths(currentDate, 1));
    else if (view === 'Week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const handleToday = () => setCurrentDate(new Date());

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (eventData) => {
    const isUpdate = !!eventData.id;
    const method = isUpdate ? 'PUT' : 'POST';
    const url = isUpdate 
      ? buildApiUrl(`/api/calendar/events/${eventData.id}`)
      : buildApiUrl('/api/calendar/events');

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        setToast({ 
          message: isUpdate ? 'Event updated successfully!' : 'Saved successfully!',
          type: 'success'
        });
        setTimeout(() => setToast(null), 3000);
        fetchEvents();
        setIsModalOpen(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setToast({ 
          message: `Server Error (${response.status}): ${errorData.detail || 'Internal server error'}`,
          type: 'error'
        });
        setTimeout(() => setToast(null), 5000);
      }
    } catch (err) {
      console.error('Failed to save event:', err);
      setToast({ 
        message: `Network Error: ${err.message || 'Could not connect to server'}`,
        type: 'error'
      });
      setTimeout(() => setToast(null), 5000);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden text-gray-900">
      <MeetingHeader toggleSidebar={() => setIsSidebarOpen(prev => !prev)} />
      
      <div className="flex flex-1 overflow-hidden">
        {isSidebarOpen && <MeetingSidebar onClose={() => setIsSidebarOpen(false)} />}
        <CalendarSidebar 
          currentDate={currentDate} 
          onDateSelect={setCurrentDate}
          onCreateEvent={() => {
            setSelectedEvent(null);
            setSelectedDate(new Date());
            setIsModalOpen(true);
          }}
        />
        
        <main className="flex-1 flex flex-col min-w-0">
          <CalendarHeader 
            currentDate={currentDate} 
            onPrev={handlePrev} 
            onNext={handleNext} 
            onToday={handleToday}
            view={view}
            setView={setView}
          />
          {view === 'Month' && (
            <MonthView 
              currentDate={currentDate} 
              events={events} 
              onDateClick={handleDateClick} 
            />
          )}
          {view === 'Week' && (
            <WeekView 
              currentDate={currentDate} 
              events={events} 
              onSlotClick={handleDateClick} 
            />
          )}
          {view === 'Day' && (
            <DayView 
              currentDate={currentDate} 
              events={events} 
              onSlotClick={handleDateClick} 
            />
          )}
        </main>
      </div>

      <EventModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
        onSave={handleSaveEvent}
        event={selectedEvent}
      />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={`fixed bottom-12 left-1/2 z-[100] backdrop-blur-md text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 border ${
              toast.type === 'error' 
                ? 'bg-red-900/90 border-red-500/20' 
                : 'bg-gray-900/90 border-white/10'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="text-red-400" size={24} />
            ) : (
              <CheckCircle2 className="text-emerald-400" size={24} />
            )}
            <span className="font-semibold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
