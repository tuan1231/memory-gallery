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
              [{ 'list': 'ordered' }, { 'list': 'bullet' }],
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
  }, []); // Initialize once

  // Sync external value changes (e.g., from template buttons) to the editor
  useEffect(() => {
    if (quillRef.current && value !== undefined) {
      const currentContent = quillRef.current.root.innerHTML;
      if (value !== currentContent) {
        quillRef.current.clipboard.dangerouslyPasteHTML(value || '<p><br></p>');
      }
    }
  }, [value]);

  return <div ref={wrapperRef} className="quill-wrapper-outer bg-background rounded-b-xl [&_.ql-container]:min-h-[250px] [&_.ql-editor]:min-h-[250px]" />;
};

const getReminderTemplates = (userName, partnerName) => [
  {
    id: 'birthday',
    label: 'Sinh nhật',
    title: `Chúc mừng Sinh Nhật ${partnerName}!`,
    content: `<p>Gửi đến ${partnerName} thân thương và ${userName},</p><p><br></p><p>Hôm nay là một ngày vô cùng đặc biệt, không chỉ đối với ${partnerName} mà còn là một ngày vô cùng ý nghĩa trong cuộc đời của ${userName} — ngày mà một nửa yêu thương đã ra đời. Nếu không có ngày hôm nay, làm sao chúng ta có thể may mắn tìm thấy nhau giữa hàng vạn người trên thế giới rộng lớn này?</p><p><br></p><p>Nhìn lại khoảng thời gian hai đứa đã cùng nhau bước qua, từ những ngày đầu còn bỡ ngỡ, những cái nắm tay rụt rè cho đến những lúc buồn vui, giận hờn và thấu hiểu. Mỗi khoảnh khắc ở bên nhau đều là một mảnh ghép quý giá tạo nên bức tranh tình yêu tuyệt đẹp của ${userName} và ${partnerName}. Cảm ơn vì đã luôn kiên nhẫn, luôn bao dung và nắm chặt tay nhau đi qua mọi thăng trầm.</p><p><br></p><p>Nhân ngày sinh nhật của ${partnerName}, xin gửi một lời chúc từ sâu thẳm trái tim: Cuộc sống này trở nên rực rỡ và ấm áp hơn rất nhiều từ khi có sự hiện diện của ${partnerName}. Chúc cho tuổi mới sẽ luôn ngập tràn tiếng cười, bình an và mọi ước mơ đều trở thành hiện thực. Dù chặng đường phía trước có là nắng gắt hay mưa rào, hai ta vẫn sẽ cùng nhau che ô và đi tiếp những chặng đường dài nhé!</p><p><br></p><p>Hãy cứ mãi là một người rạng rỡ như thế. Chúc mừng sinh nhật, tình yêu của chúng ta!</p>`
  },
  {
    id: 'trip',
    label: 'Lịch hẹn đi du lịch',
    title: `Chuyến đi trốn thế giới của ${userName} và ${partnerName}`,
    content: `<p>Gửi ${userName} và ${partnerName},</p><p><br></p><p>Ngày hôm nay không phải là một ngày bình thường, mà là ngày đánh dấu một cột mốc mới trong hành trình yêu thương của hai đứa mình — ngày mà chúng ta tạm gác lại những bộn bề, lo toan của cuộc sống thường nhật để cùng nhau trốn đến một vùng trời mới.</p><p><br></p><p>Người ta vẫn thường nói: "Nơi đẹp nhất không phải là đích đến, mà là nơi có người mình thương". Chúng ta đã, đang và sẽ luôn chứng minh điều đó qua từng chuyến đi. Mỗi một vùng đất mới ta đặt chân đến, mỗi một món ăn lạ ta cùng nhau nếm thử, mỗi một khung cảnh hoàng hôn rực rỡ ta cùng nhau ngắm nhìn... tất cả đều dệt nên những ký ức không bao giờ phai nhạt trong lòng ${userName} và ${partnerName}.</p><p><br></p><p>Chuyến đi lần này, dù là lên rừng hay xuống biển, dù trời nắng đẹp hay có chút mưa bay, thì điều tuyệt vời nhất vẫn là: Chúng ta có nhau ở bên. Hãy nắm thật chặt tay nhau, lưu giữ thật nhiều bức ảnh đẹp, trao nhau những nụ cười rạng rỡ và tận hưởng trọn vẹn từng giây phút tự do, bình yên này nhé!</p><p><br></p><p>Hành trang quý giá nhất mang theo không phải là nhét đầy những chiếc vali, mà là một trái tim đong đầy tình yêu dành cho nhau. Đi thôi, thanh xuân này là của chúng mình!</p>`
  },
  {
    id: 'custom',
    label: 'Tùy chỉnh',
    title: '',
    content: '<p><br></p>'
  }
];

export default function ImportantDatesManager({ userId, userName = 'Bạn', partnerName = 'Người ấy' }) {
  const [dates, setDates] = useState([]);
  const REMINDER_TEMPLATES = getReminderTemplates(userName, partnerName);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [emailContent, setEmailContent] = useState('');
  const [title, setTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('custom');
  const [recipient, setRecipient] = useState('both');
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
    const formData = new FormData(e.target);
    // Explicitly set the custom recipient state in formData so server action gets it
    formData.set('recipient', recipient);
    formData.set('email_content', emailContent);

    if (!emailContent || emailContent.trim() === '' || emailContent === '<p><br></p>') {
      alert("Please enter an email message.");
      return;
    }

    // Create the main event
    const res = await addImportantDate(formData);

    // If it's a birthday template, also create the auto-reminder for the creator
    if (res.success && selectedTemplate === 'birthday') {
      const reminderFormData = new FormData();
      reminderFormData.append('title', `Nhắc nhở: Sắp đến sinh nhật của ${partnerName} rồi!`);
      reminderFormData.append('date', formData.get('date'));
      reminderFormData.append('is_recurring', formData.get('is_recurring') || '');
      reminderFormData.append('recipient', 'me');
      reminderFormData.append('email_content', `<p>Chào ${userName},</p><p><br></p><p>Hôm nay là sinh nhật của ${partnerName} đấy! Hãy chắc chắn rằng bạn đã chuẩn bị sẵn sàng một món quà thật ý nghĩa, một bó hoa tươi thắm và một kế hoạch hẹn hò lãng mạn nhé.</p><p><br></p><p>Chúc hai bạn có một ngày kỷ niệm thật tuyệt vời!</p>`);

      await addImportantDate(reminderFormData);
    }

    if (res.success) {
      formRef.current?.reset();
      setEmailContent('');
      setTitle('');
      setSelectedTemplate('custom');
      setRecipient('both');
      setIsAdding(false);
      fetchDates();
    } else {
      alert(res.error || 'Failed to add date');
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
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center text-foreground/30 hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0 z-10"
                    >
                      <Trash size={16} weight="bold" />
                    </button>

                    <div className="mb-4 pr-12">
                      <h4 className="text-xl font-bold tracking-tight break-words">{item.title}</h4>
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

              <div className="mb-6">
                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/50 mb-3">Choose a Template</label>
                <div className="flex flex-wrap gap-2">
                  {REMINDER_TEMPLATES.map(temp => (
                    <button
                      key={temp.id}
                      type="button"
                      onClick={() => {
                        setSelectedTemplate(temp.id);
                        setTitle(temp.title);
                        setEmailContent(temp.content);
                        if (temp.id === 'birthday') {
                          setRecipient('partner'); // Sinh nhật auto send to partner
                        } else {
                          setRecipient('both');
                        }
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${selectedTemplate === temp.id
                          ? 'bg-foreground text-background border-foreground'
                          : 'bg-background text-foreground/70 border-border/40 hover:border-foreground/30 hover:bg-foreground/5'
                        }`}
                    >
                      {temp.label}
                    </button>
                  ))}
                </div>
              </div>

              <form ref={formRef} onSubmit={handleAdd} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/50 mb-2">Event Title</label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
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

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-2 border-b border-border/20 pb-6 gap-4">
                  <div className="flex items-center gap-3">
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

                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/50">Gửi thư này cho ai?</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="recipientType"
                          value="both"
                          checked={recipient === 'both'}
                          onChange={() => setRecipient('both')}
                          className="accent-foreground"
                        />
                        <span className="text-sm font-medium text-foreground/80">Cả hai</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="recipientType"
                          value="me"
                          checked={recipient === 'me'}
                          onChange={() => setRecipient('me')}
                          className="accent-foreground"
                        />
                        <span className="text-sm font-medium text-foreground/80">Chỉ gửi cho tôi</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="recipientType"
                          value="partner"
                          checked={recipient === 'partner'}
                          onChange={() => setRecipient('partner')}
                          className="accent-foreground"
                        />
                        <span className="text-sm font-medium text-foreground/80">Chỉ gửi cho người ấy</span>
                      </label>
                    </div>
                  </div>
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
