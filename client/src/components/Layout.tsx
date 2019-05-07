import React from 'react';

export const Header: React.FC = () => (
  <header>
    <div className="wrap">
      <a href="/">POAP</a>
      <img className="logo" alt="" src="/images/poap.png" />
    </div>
  </header>
);

export const Footer: React.FC = () => (
  <footer>
    <div className="wrap">
      <p>
        Powered by <a href="https://poap.xyz">POAP</a>
        <br />
        An ETHDenver hack
      </p>
    </div>
  </footer>
);

export const Layout: React.FC = ({ children }) => (
  <>
    <Header />
    <main>{children}</main>
    <Footer />
  </>
);
