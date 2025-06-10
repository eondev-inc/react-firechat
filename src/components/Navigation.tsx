import React from 'react';
import { Link } from 'react-router-dom';

const Navigation: React.FC = () => {
  return (
    <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <ul style={{ listStyle: 'none', display: 'flex', gap: '1rem', margin: 0, padding: 0 }}>
        <li>
          <Link to="/" style={{ textDecoration: 'none', color: '#646cff' }}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/about" style={{ textDecoration: 'none', color: '#646cff' }}>
            About
          </Link>
        </li>
        <li>
          <Link to="/contact" style={{ textDecoration: 'none', color: '#646cff' }}>
            Contact
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;

