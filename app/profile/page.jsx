import { getSession, getProfiles, updateProfile } from '../lib/profile';
import { logout } from '../actions/auth';
import { redirect } from 'next/navigation';
import AvatarDisplay from '../components/AvatarDisplay';
import { Camera, User, ChatCircle, Heart, SignOut } from '@phosphor-icons/react/dist/ssr';

export default async function ProfilePage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  const profiles = await getProfiles();
  const currentUser = profiles.find(p => p.id === session.id);
  const partnerUser = profiles.find(p => p.id !== session.id);

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-20 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-4">
              Account & Profile
            </h1>
            <p className="text-foreground/60 text-sm tracking-[0.1em] uppercase font-medium max-w-md">
              Manage your personal presence and view your partner's details in the gallery.
            </p>
          </div>
          <form action={logout}>
            <button 
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-sm font-bold uppercase tracking-widest text-foreground hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 transition-all active:scale-95"
            >
              <SignOut size={18} weight="bold" />
              Log Out
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Main Edit Section (Left, 8 cols) */}
          <div className="lg:col-span-8">
            <div className="bg-card-bg/50 backdrop-blur-xl rounded-3xl border border-border/60 p-8 sm:p-12 shadow-sm relative overflow-hidden">
              
              <div className="flex items-center gap-4 mb-10 border-b border-border/30 pb-6">
                <User size={24} className="text-accent" weight="duotone" />
                <h2 className="text-2xl font-bold tracking-tight">Your Profile</h2>
              </div>
              
              <form action={updateProfile} className="space-y-10 relative z-10">
                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
                  <div className="relative group">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden bg-foreground/5 border-2 border-border/50 relative shadow-inner transition-transform group-hover:scale-105 duration-500">
                      <AvatarDisplay
                        src={currentUser?.avatar_url}
                        alt="Avatar"
                        fallbackLetter={currentUser?.display_name?.[0]?.toUpperCase() || '?'}
                      />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                        <Camera size={32} className="text-white" weight="fill" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-xs font-bold uppercase tracking-widest text-foreground/60 mb-3">
                      Avatar Image
                    </label>
                    <div className="relative">
                      <input 
                        type="file" 
                        name="avatar" 
                        accept="image/*"
                        className="w-full text-sm text-foreground/70
                          file:mr-4 file:py-2.5 file:px-6
                          file:rounded-full file:border-0
                          file:text-xs file:font-bold file:uppercase file:tracking-widest
                          file:bg-foreground/10 file:text-foreground
                          hover:file:bg-foreground/20
                          cursor-pointer transition-colors"
                      />
                    </div>
                    <p className="text-[11px] text-foreground/40 mt-3 font-medium">Recommended size: 500x500px (JPG, PNG)</p>
                  </div>
                </div>

                <div className="space-y-8 pt-6 border-t border-border/30">
                  <div className="grid grid-cols-1 gap-8">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-foreground/60 mb-3">
                        Display Name
                      </label>
                      <input 
                        type="text" 
                        name="display_name" 
                        defaultValue={currentUser?.display_name || ''}
                        placeholder="How should we call you?"
                        className="w-full px-5 py-4 bg-background/50 border border-border/60 rounded-xl focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all text-base placeholder:text-foreground/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-foreground/60 mb-3">
                        Short Bio
                      </label>
                      <textarea 
                        name="bio" 
                        defaultValue={currentUser?.bio || ''}
                        placeholder="Write a few words about yourself..."
                        rows={4}
                        className="w-full px-5 py-4 bg-background/50 border border-border/60 rounded-xl focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all text-base resize-none placeholder:text-foreground/20 leading-relaxed"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit" 
                    className="px-8 py-4 bg-foreground text-background rounded-full text-sm font-bold uppercase tracking-widest hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Partner & Stats Section (Right, 4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {partnerUser ? (
              <div className="bg-foreground/[0.03] rounded-3xl border border-border/40 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <Heart size={20} className="text-accent" weight="fill" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/70">Your Partner</h3>
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="w-28 h-28 rounded-full overflow-hidden bg-background/50 border border-border/50 relative mb-6 shadow-inner">
                    <AvatarDisplay
                      src={partnerUser.avatar_url}
                      alt="Partner Avatar"
                      fallbackLetter={partnerUser.display_name?.[0]?.toUpperCase() || '?'}
                    />
                  </div>

                  <h4 className="text-xl font-bold tracking-tight mb-2">
                    {partnerUser.display_name || partnerUser.username}
                  </h4>
                  
                  <div className="w-8 h-px bg-border/60 my-4"></div>
                  
                  <div className="text-sm text-foreground/60 italic leading-relaxed px-4">
                    {partnerUser.bio ? `"${partnerUser.bio}"` : "No bio provided yet."}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-foreground/[0.02] rounded-3xl border border-border/30 border-dashed p-8 text-center flex flex-col items-center justify-center h-64 opacity-60">
                <Heart size={32} className="text-foreground/20 mb-4" />
                <p className="text-sm font-medium tracking-wide">Waiting for your partner to join...</p>
              </div>
            )}

            {/* Aesthetic Filler / Stat Box */}
            <div className="bg-accent/5 rounded-3xl border border-accent/10 p-8 relative overflow-hidden group">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-accent/10 rounded-full blur-2xl group-hover:bg-accent/20 transition-colors duration-700"></div>
              <ChatCircle size={24} className="text-accent/60 mb-4" weight="duotone" />
              <h4 className="text-sm font-bold uppercase tracking-widest text-foreground/80 mb-2">Connection</h4>
              <p className="text-xs text-foreground/50 leading-relaxed font-medium">
                The gallery is shared securely between both accounts. Any changes to your profile are reflected instantly.
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
