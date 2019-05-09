import React from 'react';
import { Link } from 'react-router-dom';

import FooterShadow from '../images/footer-shadow.svg';
import FooterShadowDesktop from '../images/footer-shadow-desktop.svg';
import FooterPattern from '../images/footer-pattern.svg';
import PoapLogo from '../images/POAP.svg';

export const ScanHeader: React.FC = () => (
  <>
    <header id="site-header" role="banner">
      <div className="container">
        <div className="col-xs-6 col-sm-6 col-md-6">
          <Link to="/" className="logo">
            <img src={PoapLogo} alt="POAP" />
          </Link>
        </div>
        <div className="col-xs-6 col-sm-6 col-md-6">
          <p className="page-title">Scan</p>
        </div>
      </div>
    </header>
    <div className="fix-element" />
  </>
);

export const ScanFooter: React.FC = () => (
  <footer role="contentinfo" className="footer-events">
    <div className="image-footer">
      <img src={FooterShadow} className="mobile" alt="" />
      <img src={FooterShadowDesktop} className="desktop" alt="" />
    </div>
    <div className="footer-content">
      <div className="container">
        <img src={FooterPattern} alt="" className="decoration" />
        <p>
          Powered by <b>POAP</b>
        </p>
        <p>An EthDenver 2019 hack</p>
      </div>
    </div>
  </footer>
);
