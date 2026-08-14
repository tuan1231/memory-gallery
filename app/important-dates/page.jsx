import { getSession, getProfiles } from '../lib/profile';
import { redirect } from 'next/navigation';
import ImportantDatesManager from '../components/ImportantDatesManager';

export default async function ImportantDatesPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  const profiles = await getProfiles();
  const currentUser = profiles.find(p => p.id === session.id) || session;
  const partner = profiles.find(p => p.id !== session.id);

  const userName = currentUser.display_name || currentUser.username || 'Anh';
  const partnerName = partner?.display_name || partner?.username || 'Em';

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-32 px-4 sm:px-8">
      <div className="max-w-[1400px] mx-auto">
        <ImportantDatesManager 
          userId={session.id} 
          userName={userName}
          partnerName={partnerName}
        />
      </div>
    </div>
  );
}
