import { Link, useLocation } from 'react-router-dom';

export const Navbar = () => {
  const location = useLocation();
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
    </nav>
  );
};
