import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { showToast } = useToast();

  const navStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderBottom: '1px solid var(--border)',
    padding: '0.75rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
  };

  const navLinksStyle: React.CSSProperties = {
    display: 'flex',
    gap: '2rem',
    alignItems: 'center'
  };

  const linkStyle: React.CSSProperties = {
    textDecoration: 'none',
    color: 'var(--muted-foreground)',
    fontSize: '0.875rem',
    fontWeight: 600,
    transition: 'color 0.2s ease'
  };

  const activeLinkStyle: React.CSSProperties = {
    ...linkStyle,
    color: 'var(--accent)'
  };

  const getStyle = (path: string) => {
    const isActive = path === '/' 
      ? location.pathname === '/' 
      : location.pathname.startsWith(path);
    
    return isActive ? activeLinkStyle : linkStyle;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      showToast('Signed out successfully.');
      navigate('/auth');
    } catch {
      showToast('Failed to sign out.', 'error');
    }
  };

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : '?';
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <nav style={navStyle}>
      <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)', letterSpacing: '-0.025em' }}>
        MailFlow<span style={{ color: 'var(--accent)' }}>AI</span>
      </div>
      <div style={navLinksStyle}>
        <Link to="/" style={getStyle('/')}>Outreach Assistant</Link>
        <Link to="/campaigns" style={getStyle('/campaigns')}>Campaign Manager</Link>
        <Link to="/stats" style={getStyle('/stats')}>Performance Analytics</Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          padding: '0.375rem 0.75rem',
          backgroundColor: 'var(--secondary)',
          borderRadius: '2rem',
        }}>
          {user?.photoURL ? (
            <img 
              src={user.photoURL} 
              alt="avatar" 
              style={{ width: '24px', height: '24px', borderRadius: '50%' }}
            />
          ) : (
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              fontWeight: 700,
            }}>
              {userInitial}
            </div>
          )}
          <span style={{ 
            fontSize: '0.8rem', 
            fontWeight: 600, 
            color: 'var(--primary)',
            maxWidth: '120px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {displayName}
          </span>
        </div>
        <Link
          to="/settings"
          style={{
            padding: '0.375rem 0.75rem',
            backgroundColor: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '0.5rem',
            color: 'var(--muted-foreground)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          Settings
        </Link>
        <button
          onClick={handleSignOut}
          style={{
            padding: '0.375rem 0.75rem',
            backgroundColor: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '0.5rem',
            color: 'var(--muted-foreground)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
};
