"use client";

import { useState, useMemo, useEffect } from "react";
import { addComment, reactToComment } from "../lib/actions";
import { motion, AnimatePresence } from "motion/react";
import { UserCircle, Heart, ThumbsUp, Smiley } from "@phosphor-icons/react";
import Link from 'next/link';

const EMOJIS = [
  { id: 'heart', icon: Heart, color: 'text-red-500' },
  { id: 'like', icon: ThumbsUp, color: 'text-blue-500' },
  { id: 'smile', icon: Smiley, color: 'text-yellow-500' }
];

export default function CommentSection({ storyId, initialComments = [], currentUser = null, profiles = [] }) {
  const [comments, setComments] = useState(initialComments);
  const [replyTo, setReplyTo] = useState(null);
  const [userReactions, setUserReactions] = useState({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`reactions_${storyId}`);
      if (stored) setUserReactions(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
  }, [storyId]);
  
  // Organize comments into a tree (parent -> children)
  const commentTree = useMemo(() => {
    const root = [];
    const map = new Map();
    
    comments.forEach(c => map.set(c.id, { ...c, children: [] }));
    
    comments.forEach(c => {
      if (c.parent_id && map.has(c.parent_id)) {
        map.get(c.parent_id).children.push(map.get(c.id));
      } else {
        root.push(map.get(c.id));
      }
    });
    return root;
  }, [comments]);

  const handleAddComment = async (e, parentId = null) => {
    e.preventDefault();
    if (!currentUser) return;

    const formData = new FormData(e.target);
    const content = formData.get("content");
    const author = currentUser.display_name || currentUser.username;
    const avatar = currentUser.avatar_url;
    
    // Optimistic UI update
    const tempId = Date.now().toString();
    const newComment = {
      id: tempId,
      story_id: storyId,
      parent_id: parentId,
      author_name: author,
      avatar_url: avatar,
      content,
      created_at: new Date().toISOString(),
      reactions: {}
    };
    
    setComments(prev => [...prev, newComment]);
    e.target.reset();
    if (parentId) setReplyTo(null);
    
    try {
      const savedComment = await addComment(storyId, content, parentId);
      setComments(prev => prev.map(c => c.id === tempId ? savedComment : c));
    } catch (err) {
      alert(err.message);
      setComments(prev => prev.filter(c => c.id !== tempId));
    }
  };

  const handleReact = async (commentId, emojiId) => {
    const oldEmojiId = userReactions[commentId];
    const newEmojiId = oldEmojiId === emojiId ? null : emojiId; // Toggle off if clicked same

    // Update user reactions state and localstorage
    const newUserReactions = { ...userReactions };
    if (newEmojiId) {
      newUserReactions[commentId] = newEmojiId;
    } else {
      delete newUserReactions[commentId];
    }
    setUserReactions(newUserReactions);
    try {
      localStorage.setItem(`reactions_${storyId}`, JSON.stringify(newUserReactions));
    } catch (e) {}

    // Optimistic update for UI
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        const currentReactions = { ...c.reactions };
        
        // Remove old emoji count
        if (oldEmojiId && currentReactions[oldEmojiId] > 0) {
          currentReactions[oldEmojiId] -= 1;
          if (currentReactions[oldEmojiId] === 0) delete currentReactions[oldEmojiId];
        }
        
        // Add new emoji count
        if (newEmojiId) {
          currentReactions[newEmojiId] = (currentReactions[newEmojiId] || 0) + 1;
        }
        
        return { ...c, reactions: currentReactions };
      }
      return c;
    }));
    
    try {
      await reactToComment(commentId, newEmojiId, oldEmojiId);
    } catch (err) {
      console.error(err);
    }
  };

  const CommentForm = ({ parentId = null, onCancel = null }) => {
    if (!currentUser) {
      return (
        <div className="mt-4 bg-background/50 border border-border/50 rounded-2xl p-6 text-center">
          <p className="text-foreground/70 mb-4 text-sm font-medium">Please sign in to comment</p>
          <Link href="/login" className="bg-foreground text-background px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity inline-block">
            Sign in
          </Link>
        </div>
      );
    }
    
    return (
      <form onSubmit={(e) => handleAddComment(e, parentId)} className="mt-4 bg-background/50 border border-border/50 rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
             {currentUser.avatar_url ? (
               <img src={currentUser.avatar_url} alt="" className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full bg-foreground/10 flex items-center justify-center font-bold text-xs text-foreground/50">
                 {(currentUser.display_name || currentUser.username || '?').charAt(0).toUpperCase()}
               </div>
             )}
          </div>
          <span className="text-sm font-bold">{currentUser.display_name || currentUser.username}</span>
        </div>
        <textarea 
          name="content" 
          placeholder="Write a comment..." 
          required 
          rows={2}
          className="w-full bg-transparent border-none px-2 focus:outline-none text-sm resize-none"
        />
        <div className="flex justify-end gap-2 mt-2">
          {onCancel && (
            <button type="button" onClick={onCancel} className="text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-foreground/5">Cancel</button>
          )}
          <button type="submit" className="text-xs font-bold uppercase tracking-wider bg-foreground text-background px-4 py-1.5 rounded-full hover:scale-105 transition-transform">Post</button>
        </div>
      </form>
    );
  };

  const CommentItem = ({ comment, depth = 0 }) => {
    const avatarUrl = comment.avatar_url || profiles.find(p => p.display_name === comment.author_name || p.username === comment.author_name)?.avatar_url;

    return (
      <div className={`mb-4 ${depth > 0 ? 'ml-6 md:ml-12 border-l-2 border-border/30 pl-4' : ''}`}>
        <div className="flex gap-3">
          <div className="mt-1 w-8 h-8 rounded-full overflow-hidden shrink-0">
             {avatarUrl ? (
               <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
             ) : (
               <UserCircle size={32} weight="fill" className="text-foreground/30" />
             )}
          </div>
          <div className="flex-1">
            <div className="bg-foreground/5 rounded-2xl rounded-tl-none p-3 px-4 inline-block">
              <h5 className="font-bold text-sm tracking-tight">{comment.author_name}</h5>
              <p className="text-sm text-foreground/80 mt-1 whitespace-pre-wrap">{comment.content}</p>
            </div>
            
            <div className="flex items-center gap-4 mt-2 ml-2">
              <span className="text-[10px] text-foreground/40 font-medium uppercase tracking-wider">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
              <button 
                onClick={() => setReplyTo(comment.id)} 
                className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 hover:text-accent transition-colors"
              >
                Reply
              </button>
              
              <div className="flex gap-1 bg-foreground/5 rounded-full px-2 py-1 items-center">
                {EMOJIS.map(emo => {
                  const Icon = emo.icon;
                  const count = comment.reactions?.[emo.id] || 0;
                  const isSelected = userReactions[comment.id] === emo.id;
                  
                  // Only show emojis that haven't been clicked if user wants to change, or show all if already clicked by someone
                  return (
                     <button 
                       key={emo.id} 
                       onClick={() => handleReact(comment.id, emo.id)}
                       className={`flex items-center gap-1 hover:scale-110 transition-transform p-1 ${isSelected ? 'bg-background/40 rounded shadow-sm' : ''}`}
                       title={emo.id}
                     >
                       <Icon size={14} weight={isSelected || count > 0 ? "fill" : "regular"} className={isSelected || count > 0 ? emo.color : 'text-foreground/40'} />
                       {count > 0 && <span className={`text-[10px] font-bold ${isSelected ? emo.color : 'text-foreground/60'}`}>{count}</span>}
                     </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        
        <AnimatePresence>
          {replyTo === comment.id && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="ml-12 overflow-hidden">
              <CommentForm parentId={comment.id} onCancel={() => setReplyTo(null)} />
            </motion.div>
          )}
        </AnimatePresence>

        {comment.children && comment.children.length > 0 && (
          <div className="mt-4">
            {comment.children.map(child => (
              <CommentItem key={child.id} comment={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full mt-16 pt-12 border-t border-border/30">
      <h3 className="text-2xl font-bold tracking-tight uppercase mb-8">
        Comments ({comments.length})
      </h3>
      
      <CommentForm />
      
      <div className="mt-12">
        {commentTree.map(comment => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}
