import { useState, useEffect } from 'react';
import { X, Clock, AlignLeft, Video, Calendar, CheckCircle2 } from 'lucide-react';
import { format, addHours } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function EventModal({ isOpen, onClose, selectedDate, onSave, event = null }) {
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (event) {
        setTitle(event.title);
        setDescription(event.description);
        setStartTime(format(new Date(event.start_time), "yyyy-MM-dd'T'HH:mm"));
        setEndTime(format(new Date(event.end_time), "yyyy-MM-dd'T'HH:mm"));
      } else {
        setTitle('');
        setDescription('');
        const start = selectedDate || new Date();
        start.setHours(new Date().getHours() + 1, 0, 0, 0);
        const end = addHours(start, 1);
        setStartTime(format(start, "yyyy-MM-dd'T'HH:mm"));
        setEndTime(format(end, "yyyy-MM-dd'T'HH:mm"));
      }
    }
  }, [isOpen, event, selectedDate]);

  const [isMeetingLinked, setIsMeetingLinked] = useState(!!event?.room_id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    if (startTime && endTime && new Date(endTime) <= new Date(startTime)) {
      alert("End time must be after start time");
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        id: event?.id,
        title: title || '(No title)',
        description,
        start_time: startTime,
        end_time: endTime,
        room_id: event?.room_id || (isMeetingLinked ? Math.random().toString(36).substring(7) : ""),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-[3.5rem] shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden"
          >
            <div className="flex items-center justify-between px-10 py-6 border-b border-gray-50 bg-white">
              <h3 className="text-xl font-bold text-gray-800 tracking-tight">
                {event ? 'Edit Event' : 'New Event'}
              </h3>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-10 py-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <input
                    type="text"
                    placeholder="Add title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-full px-8 py-3.5 text-lg font-bold text-gray-800 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder-gray-400"
                    autoFocus
                    required
                  />
                </div>

                <div className="flex items-start gap-6 text-gray-600 px-2">
                  <div className="mt-8"><Clock size={20} className="text-gray-400" /></div>
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">Start Time</label>
                      <input
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-full px-6 py-3 text-sm text-gray-700 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none w-full transition-all cursor-pointer"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">End Time</label>
                      <input
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-full px-6 py-3 text-sm text-gray-700 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none w-full transition-all cursor-pointer"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-gray-600 px-2">
                  <div><Video size={20} className={isMeetingLinked ? "text-blue-600" : "text-gray-400"} /></div>
                  <button 
                    type="button"
                    onClick={() => setIsMeetingLinked(!isMeetingLinked)}
                    className={`flex-1 py-3 px-8 rounded-full font-bold transition-all flex items-center justify-center gap-3 transform active:scale-95 ${isMeetingLinked ? 'bg-blue-50 text-blue-700 border-2 border-blue-200 shadow-sm' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100'}`}
                  >
                    {isMeetingLinked ? (
                      <>Meeting Linked <CheckCircle2 size={18} /></>
                    ) : (
                      <>Add Shnoor Meeting</>
                    )}
                  </button>
                </div>

                <div className="flex items-start gap-6 text-gray-600 px-2">
                  <div className="mt-4"><AlignLeft size={20} className="text-gray-400" /></div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">Description</label>
                    <textarea
                      placeholder="Add description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-[2rem] px-6 py-4 text-sm text-gray-700 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none min-h-[120px] resize-none transition-all placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-50 px-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-3 rounded-full text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`px-12 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-black shadow-2xl shadow-blue-200 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSaving ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : null}
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
