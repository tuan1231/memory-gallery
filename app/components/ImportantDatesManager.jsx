'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash, ArrowRight, EnvelopeSimple, Repeat, X } from '@phosphor-icons/react';
import { getImportantDates, addImportantDate, deleteImportantDate } from '../lib/important-dates';
import { motion, useReducedMotion, AnimatePresence } from 'motion/react';
import 'quill/dist/quill.snow.css';

const QuillEditor = ({ value, onChange }) => {
  const wrapperRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    if (wrapperRef.current) {
      // Clear previous instances for React Strict Mode
      wrapperRef.current.innerHTML = '<div class="editor-container"></div>';
      const editorElement = wrapperRef.current.querySelector('.editor-container');

      import('quill').then((QuillModule) => {
        const Quill = QuillModule.default;
        const q = new Quill(editorElement, {
          theme: 'snow',
          placeholder: 'Write a sweet message to send to both of you...',
          modules: {
            toolbar: [
              [{ 'header': [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              ['link'],
              ['clean']
            ]
          }
        });
        
        quillRef.current = q;
        
        q.on('text-change', () => {
          onChange(q.root.innerHTML);
        });

        if (value && value !== '<p><br></p>') {
          q.clipboard.dangerouslyPasteHTML(value);
        }
      });
    }

    return () => {
      if (wrapperRef.current) {
        wrapperRef.current.innerHTML = '';
      }
      quillRef.current = null;
    };
  }, []); // Empty dependency array, but handles strict mode via cleanup

  return <div ref={wrapperRef} className="quill-wrapper-outer bg-background rounded-b-xl [&_.ql-container]:min-h-[250px] [&_.ql-editor]:min-h-[250px]" />;
};

export default function ImportantDatesManager({ userId }) {
  const [dates, setDates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [emailContent, setEmailContent] = useState('');
  const formRef = useRef(null);
  const reduce = useReducedMotion();

  const fetchDates = async () => {
    setIsLoading(true);
    const data = await getImportantDates();
    setDates(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDates();
  }, []);

  // Close modal on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsAdding(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const formData = new FormData(formRef.current);
    
    // Add the rich text content manually
    formData.set('email_content', emailContent);

    if (!emailContent || emailContent.trim() === '' || emailContent === '<p><br></p>') {
      alert("Please enter an email message.");
      return;
    }

    const res = await addImportantDate(formData);
    if (res.success) {
      formRef.current?.reset();
      setEmailContent('');
      setIsAdding(false);
      fetchDates();
    } else {
      alert(res.error || 'Failed to add important date.');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this reminder?')) {
      const res = await deleteImportantDate(id);
      if (res.success) {
        fetchDates();
      } else {
        alert(res.error || 'Failed to delete important date.');
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 relative">
      
      {/* Left Column: Header & Actions (Sticky) */}
      <div className="lg:col-span-4 lg:sticky lg:top-32 lg:self-start lg:h-auto z-10">
        <motion.div 
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-foreground/50 mb-6">
            Reminders
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tighter uppercase mb-6 leading-[0.9]">
            Important<br />Dates
          </h1>
          <p className="text-base text-foreground/60 leading-relaxed max-w-[35ch] mb-10">
            Set up email reminders for anniversaries and special days. Both of you will receive the message when the day arrives.
          </p>

          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-between w-full p-5 bg-foreground text-background rounded-2xl group hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] transition-all duration-300"
          >
            <span className="text-sm font-bold uppercase tracking-[0.1em]">Create Reminder</span>
            <div className="w-8 h-8 rounded-full bg-background/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus size={16} weight="bold" />
            </div>
          </button>
        </motion.div>
      </div>

      {/* Right Column: List of Dates */}
      <div className="lg:col-span-8">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin"></div>
          </div>
        ) : dates.length === 0 ? (
          <div className="h-full min-h-[40vh] flex flex-col items-center justify-center text-center p-8 bg-foreground/[0.02] border border-border/20 rounded-3xl border-dashed">
            <EnvelopeSimple size={48} className="text-foreground/20 mb-6" weight="thin" />
            <h3 className="text-xl font-bold tracking-tight mb-2">No dates tracked</h3>
            <p className="text-sm text-foreground/50 max-w-sm">
              Create your first reminder to ensure you both receive an email when the special day arrives.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {dates.map((item, i) => {
              const dateObj = new Date(item.date);
              const formattedDate = dateObj.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              });
              
              const day = dateObj.getDate().toString().padStart(2, '0');
              const month = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();

              return (
                <motion.div
                  key={item.id}
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="group flex flex-col sm:flex-row bg-background border border-border/40 rounded-3xl overflow-hidden hover:border-foreground/30 transition-colors duration-500"
                >
                  {/* Big Date Block */}
                  <div className="sm:w-48 bg-foreground/[0.03] border-b sm:border-b-0 sm:border-r border-border/40 p-8 flex flex-col items-center justify-center shrink-0">
                    <span className="text-4xl md:text-5xl font-bold tracking-tighter leading-none mb-1">{day}</span>
                    <span className="text-sm font-bold uppercase tracking-[0.2em] text-foreground/60">{month}</span>
                  </div>
                  
                  {/* Content Block */}
                  <div className="p-8 flex-1 flex flex-col relative">
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <h4 className="text-xl font-bold tracking-tight">{item.title}</h4>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-foreground/30 hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
                      >
                        <Trash size={16} weight="bold" />
                      </button>
                    </div>
                    
                    <div 
                      className="text-sm text-foreground/80 leading-relaxed mb-6 flex-1 quill-content"
                      dangerouslySetInnerHTML={{ __html: item.email_content }}
                    />
                    
                    <div className="flex items-center gap-4 mt-auto">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent/60"></span>
                        {formattedDate}
                      </div>
                      {item.is_recurring && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/50">
                          <Repeat size={12} weight="bold" />
                          Yearly
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Creation Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-3xl bg-background border border-border/40 rounded-3xl shadow-2xl p-6 sm:p-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold tracking-tight mb-1">New Reminder</h3>
                  <p className="text-xs text-foreground/50 uppercase tracking-[0.1em] font-medium">Compose your message</p>
                </div>
                <button 
                  onClick={() => setIsAdding(false)} 
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-foreground/5 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form ref={formRef} onSubmit={handleAdd} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/50 mb-2">Event Title</label>
                    <input
                      type="text"
                      name="title"
                      required
                      placeholder="e.g. 1st Anniversary"
                      className="w-full bg-foreground/[0.02] border border-border/40 p-4 rounded-xl text-base focus:outline-none focus:border-foreground/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/50 mb-2">Event Date</label>
                    <input
                      type="date"
                      name="date"
                      required
                      className="w-full bg-foreground/[0.02] border border-border/40 p-4 rounded-xl text-base focus:outline-none focus:border-foreground/50 transition-colors text-foreground/80"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 py-2 border-b border-border/20 pb-6">
                  <input 
                    type="checkbox" 
                    name="is_recurring" 
                    id="is_recurring" 
                    defaultChecked
                    className="w-4 h-4 rounded border-border/60 text-foreground focus:ring-foreground/50 accent-foreground cursor-pointer"
                  />
                  <label htmlFor="is_recurring" className="text-sm font-medium text-foreground/70 cursor-pointer">
                    Repeat this reminder every year
                  </label>
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/50 mb-3">Email Message</label>
                  <div className="rounded-xl overflow-hidden border border-border/40 focus-within:border-foreground/50 transition-colors bg-background">
                    <QuillEditor value={emailContent} onChange={setEmailContent} />
                  </div>
                </div>

                <div className="flex justify-end pt-8">
                  <button
                    type="submit"
                    className="px-8 py-4 bg-foreground text-background rounded-full text-xs font-bold uppercase tracking-[0.15em] hover:opacity-90 transition-opacity flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    Save Reminder <ArrowRight size={14} weight="bold" />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
