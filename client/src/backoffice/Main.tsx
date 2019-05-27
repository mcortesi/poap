import React, { useCallback, useContext, useState } from 'react';
import { slide as Menu } from 'react-burger-menu';
import { Link, Route, withRouter } from 'react-router-dom';
import { AuthContext } from '../auth';
import PoapLogo from '../images/POAP.svg';
import { IssueForEventPage, IssueForUserPage } from './IssuePage';
import { EventsPage } from './EventsPage';

export const MintersPage = () => <div> This is a MintersPage </div>;

const NavigationMenu = withRouter(({ history }) => {
  const auth = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = useCallback(() => setIsOpen(false), []);

  return (
    <Menu isOpen={isOpen} onStateChange={state => setIsOpen(state.isOpen)} right disableAutoFocus>
      <h2>Issue Badges:</h2>
      <Link to="/admin/issue-for-event" onClick={closeMenu}>
        Many Users
      </Link>
      <Link to="/admin/issue-for-user" onClick={closeMenu}>
        Many Events
      </Link>

      <h2>Other Tasks</h2>
      <Link to="/admin/events" onClick={closeMenu}>
        Manage Events
      </Link>
      {/* <Link to="/admin/minters" onClick={closeMenu}>
        Manage Minters
      </Link> */}
      <a
        className="bm-item"
        href=""
        onClick={() => {
          auth.logout();
          history.push('/');
        }}
      >
        Logout
      </a>
    </Menu>
  );
});

export const BackOffice: React.FC = () => (
  <>
    <NavigationMenu />

    <header id="site-header" role="banner">
      <div className="container">
        <div className="col-xs-6 col-sm-6 col-md-6">
          <Link to="/" className="logo">
            <img src={PoapLogo} alt="POAP" />
          </Link>
        </div>
        <div className="col-xs-6 col-sm-6 col-md-6">
          <p className="page-title">BackOffice</p>
        </div>
      </div>
    </header>
    <div className="fix-element" />
    <main className="app-content">
      <div className="container">
        <div className="bk-container">
          <Route path="/admin/issue-for-event" component={IssueForEventPage} />
          <Route path="/admin/issue-for-user" component={IssueForUserPage} />
          <Route path="/admin/events" component={EventsPage} />
          <Route path="/admin/minters" component={MintersPage} />
          <Route
            exact
            path="/admin/"
            render={() => <div>Choose an option from the right side menu</div>}
          />
        </div>
      </div>
    </main>
  </>
);
