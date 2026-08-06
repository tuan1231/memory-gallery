'use client';

import { useState } from 'react';
import { changePassword } from '../actions/auth';
import { LockKey } from '@phosphor-icons/react';

export default function ChangePasswordForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const formData = new FormData(e.currentTarget);
    const oldPassword = formData.get('oldPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    
    try {
      const res = await changePassword(formData);
      
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setSuccess('Password changed successfully!');
        e.target.reset(); // clear form
      }
    } catch (err) {
      setError('An error occurred, please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-6 border-t border-border/30 mt-8 relative z-10">
      {!isOpen && (
        <button 
          type="button" 
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-foreground/5 text-foreground rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-foreground/10 active:scale-[0.98] transition-all"
        >
          <LockKey size={18} weight="bold" />
          Change Password
        </button>
      )}

      {isOpen && (
        <div className="bg-background/40 p-6 sm:p-8 rounded-2xl border border-border/50 shadow-inner">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/30">
            <LockKey size={20} className="text-accent" weight="duotone" />
            <h3 className="text-lg font-bold tracking-tight">Change Password</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm font-medium">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-xl text-green-500 text-sm font-medium">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-foreground/60 mb-2">
              Current Password
            </label>
            <input 
              type="password" 
              name="oldPassword" 
              placeholder="Enter current password..."
              className="w-full px-5 py-4 bg-background/50 border border-border/60 rounded-xl focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all text-base placeholder:text-foreground/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-foreground/60 mb-2">
              New Password
            </label>
            <input 
              type="password" 
              name="newPassword" 
              placeholder="Enter new password..."
              className="w-full px-5 py-4 bg-background/50 border border-border/60 rounded-xl focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all text-base placeholder:text-foreground/20"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-foreground/60 mb-2">
              Confirm New Password
            </label>
            <input 
              type="password" 
              name="confirmPassword" 
              placeholder="Re-enter new password..."
              className="w-full px-5 py-4 bg-background/50 border border-border/60 rounded-xl focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all text-base placeholder:text-foreground/20"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-4">
          <button 
            type="button" 
            onClick={() => {
              setIsOpen(false);
              setError('');
              setSuccess('');
            }}
            className="px-8 py-4 bg-transparent border border-border/60 text-foreground rounded-full text-sm font-bold uppercase tracking-widest hover:bg-foreground/5 active:scale-[0.98] transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="px-8 py-4 bg-foreground text-background rounded-full text-sm font-bold uppercase tracking-widest hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Password'}
          </button>
        </div>
        </form>
        </div>
      )}
    </div>
  );
}
