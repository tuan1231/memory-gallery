import { getSession } from '../lib/profile';
import { redirect } from 'next/navigation';
import ImportantDatesManager from '../components/ImportantDatesManager';

export default async function ImportantDatesPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-32 px-4 sm:px-8">
      <div className="max-w-[1400px] mx-auto">
        <ImportantDatesManager userId={session.id} />
      </div>
    </div>
  );
}
