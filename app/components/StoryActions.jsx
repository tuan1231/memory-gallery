"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { archiveStory, deleteStoryPermanently, restoreStory } from '../actions';
import { Trash, Archive, ArrowUUpLeft, X } from '@phosphor-icons/react';

export default function StoryActions({ storyId, isArchived }) {
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, action: null });
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const openModal = (actionType) => {
    setModalState({ isOpen: true, action: actionType });
    setPassword('');
    setErrorMsg('');
  };

  const closeModal = () => {
    setModalState({ isOpen: false, action: null });
  };

  const handleConfirm = async () => {
    if (!password) {
      setErrorMsg("Vui lòng nhập mật khẩu!");
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      if (modalState.action === 'archive') {
        await archiveStory(storyId, password);
        alert("Đã chuyển vào lưu trữ. Thẻ sẽ bị xóa vĩnh viễn sau 3 ngày.");
        router.push('/');
      } else if (modalState.action === 'restore') {
        await restoreStory(storyId, password);
        alert("Khôi phục thành công.");
        router.push('/');
      } else if (modalState.action === 'delete') {
        await deleteStoryPermanently(storyId, password);
        alert("Đã xóa vĩnh viễn.");
        router.push('/archive');
      }
      router.refresh();
      closeModal();
    } catch (error) {
      setErrorMsg(error.message || "Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mt-8 pt-8 border-t border-border">
        {isArchived ? (
          <div className="flex gap-4">
            <button
              onClick={() => openModal('restore')}
              className="flex items-center gap-2 px-6 py-3 bg-foreground text-background font-bold rounded-xl hover:opacity-90 transition-opacity uppercase tracking-widest text-sm"
            >
              <ArrowUUpLeft size={20} />
              Khôi phục
            </button>
            <button
              onClick={() => openModal('delete')}
              className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-500/20 transition-colors uppercase tracking-widest text-sm border border-red-500/20"
            >
              <Trash size={20} />
              Xóa Vĩnh Viễn
            </button>
          </div>
        ) : (
          <button
            onClick={() => openModal('archive')}
            className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-500/20 transition-colors uppercase tracking-widest text-sm border border-red-500/20"
          >
            <Archive size={20} />
            Xóa (Lưu trữ)
          </button>
        )}
      </div>

      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card-bg w-full max-w-md rounded-3xl p-8 border border-border shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button onClick={closeModal} className="absolute top-6 right-6 p-2 rounded-full hover:bg-foreground/5 transition-colors">
              <X size={24} />
            </button>
            
            <h3 className="text-2xl font-bold mb-2">Xác nhận hành động</h3>
            <p className="text-foreground/70 mb-6">
              {modalState.action === 'archive' && "Bạn có chắc muốn xóa thẻ này vào kho lưu trữ?"}
              {modalState.action === 'restore' && "Bạn có muốn khôi phục thẻ này về trang chủ?"}
              {modalState.action === 'delete' && "Hành động này không thể hoàn tác. Bạn chắc chứ?"}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground/80 uppercase tracking-wider mb-2">
                  Mật khẩu bí mật
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="Nhập mật khẩu..."
                  autoFocus
                />
              </div>

              {errorMsg && (
                <div className="text-red-500 text-sm font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  {errorMsg}
                </div>
              )}

              <button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full bg-foreground text-background font-bold tracking-widest uppercase rounded-xl px-4 py-4 mt-4 hover:opacity-90 transition-all disabled:opacity-50"
              >
                {loading ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
