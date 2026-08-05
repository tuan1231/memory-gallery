import MainLayoutWrapper from './MainLayoutWrapper';
import { getSession } from '../lib/profile';

export default async function ServerLayoutWrapper({ children }) {
  const session = await getSession();
  
  const user = session ? {
    avatarUrl: session.avatar_url || null,
    displayName: session.display_name || session.username || '',
  } : null;

  return (
    <MainLayoutWrapper user={user}>
      {children}
    </MainLayoutWrapper>
  );
}
