import { Link, useLocation } from 'react-router-dom';

export const Navbar = () => {
  const location = useLocation();
  const navStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderBottom: '1px solid #eee',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    position: 'sticky',
    top: 0,
    zIndex: 100
  };

  const navLinksStyle: React.CSSProperties = {
    display: 'flex',
    gap: '2rem',
    alignItems: 'center'
  };

  const linkStyle: React.CSSProperties = {
    textDecoration: 'none',
    color: '#666',
    fontSize: '0.9rem',
    fontWeight: 600
  };

  const activeLinkStyle: React.CSSProperties = {
    ...linkStyle,
    color: '#0066ff'
  };

  const getStyle = (path: string) => {
    if (path === '/') return location.pathname === '/' ? activeLinkStyle : linkStyle;
    return location.pathname.startsWith(path) ? activeLinkStyle : linkStyle;
  };

  return (
    <nav style={navStyle}>
      <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#111' }}>
        ColdEmail<span style={{ color: '#0066ff' }}>Engine</span>
      </div>
      <div style={navLinksStyle}>
        <Link to="/" style={getStyle('/')}>Single Send</Link>
        <Link to="/campaigns" style={getStyle('/campaigns')}>Campaigns</Link>
        <Link to="/stats" style={getStyle('/stats')}>Analytics</Link>
      </div>
    </nav>
  );
};
