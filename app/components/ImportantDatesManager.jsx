'use client';

import { useState, useEffect, useRef } from 'react';
import { CalendarBlank, Plus, Trash, BellRinging } from '@phosphor-icons/react';
import { getImportantDates, addImportantDate, deleteImportantDate } from '../lib/important-dates';

export default function ImportantDatesManager({ userId }) {
  const [dates, setDates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const formRef = useRef(null);

  const fetchDates = async () => {
    setIsLoading(true);
    const data = await getImportantDates();
    setDates(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDates();
  }, []);

  const handleAdd = async (formData) => {
    const res = await addImportantDate(formData);
    if (res.success) {
      formRef.current?.reset();
      setIsAdding(false);
      fetchDates();
    } else {
      alert(res.error || 'Failed to add important date.');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this reminder?')) {
      const res = await deleteImportantDate(id);
      if (res.success) {
        fetchDates();
      } else {
        alert(res.error || 'Failed to delete important date.');
      }
    }
  };

  return (
    <div className="mt-12 bg-card-bg/50 backdrop-blur-xl rounded-3xl border border-border/60 p-8 sm:p-12 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-10 border-b border-border/30 pb-6">
        <div className="flex items-center gap-4">
          <BellRinging size={24} className="text-accent" weight="duotone" />
          <h2 className="text-2xl font-bold tracking-tight">Important Dates</h2>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-xs font-bold uppercase tracking-widest hover:bg-accent/20 transition-colors"
        >
          <Plus size={16} weight="bold" />
          Add New
        </button>
      </div>

      {isAdding && (
        <form ref={formRef} action={handleAdd} className="mb-10 space-y-6 bg-background/50 p-6 rounded-2xl border border-border/40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-foreground/60 mb-3">
                Title
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="e.g. 1st Anniversary"
                className="w-full px-5 py-4 bg-background/50 border border-border/60 rounded-xl focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all text-base placeholder:text-foreground/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-foreground/60 mb-3">
                Date
              </label>
              <input
                type="date"
                name="date"
                required
                className="w-full px-5 py-4 bg-background/50 border border-border/60 rounded-xl focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all text-base placeholder:text-foreground/20"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-foreground/60 mb-3">
              Email Content
            </label>
            <textarea
              name="email_content"
              required
              rows={4}
              placeholder="Write the message you want both of you to receive on this day..."
              className="w-full px-5 py-4 bg-background/50 border border-border/60 rounded-xl focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all text-base resize-none placeholder:text-foreground/20"
            />
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              name="is_recurring" 
              id="is_recurring" 
              defaultChecked
              className="w-4 h-4 rounded border-border/60 text-accent focus:ring-accent/50"
            />
            <label htmlFor="is_recurring" className="text-sm text-foreground/70 font-medium">
              Repeat every year
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-3 bg-foreground text-background rounded-full text-sm font-bold uppercase tracking-widest hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              Save Reminder
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="text-center py-10 opacity-50 text-sm font-bold uppercase tracking-widest">
          Loading dates...
        </div>
      ) : dates.length === 0 ? (
        <div className="text-center py-10 opacity-50 border border-dashed border-border/50 rounded-2xl">
          <CalendarBlank size={32} className="mx-auto mb-4 opacity-50" />
          <p className="text-sm font-medium tracking-wide">No important dates added yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {dates.map((item) => {
            const dateObj = new Date(item.date);
            const formattedDate = dateObj.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            });

            return (
              <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-background/30 border border-border/40 rounded-2xl hover:border-border/80 transition-colors">
                <div>
                  <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                  <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-foreground/60 font-bold">
                    <span className="flex items-center gap-1">
                      <CalendarBlank size={14} />
                      {formattedDate}
                    </span>
                    {item.is_recurring && (
                      <span className="px-2 py-0.5 bg-accent/10 text-accent rounded text-[10px]">Yearly</span>
                    )}
                  </div>
                  <p className="text-sm text-foreground/70 mt-2 line-clamp-2">
                    {item.email_content}
                  </p>
                </div>
                
                {item.user_id === userId && (
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                    title="Delete"
                  >
                    <Trash size={18} weight="bold" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
