import classNames from 'classnames';
import React from 'react';
import { Link, Route, withRouter } from 'react-router-dom';
import { withAuth } from '../auth';
import { useToggleState } from '../react-helpers';
import { IssuePage } from './IssuePage';
import './NavigationMenu.css';

export const EventsPage = () => <div> This is a EventsPage </div>;
export const MintersPage = () => <div> This is a MintersPage </div>;

const NavigationMenu = () => {
  const [responsive, toggleResponsive] = useToggleState(false);

  return (
    <div className={classNames({ topnav: true, responsive })} id="myTopnav">
      <Link to="/admin/issue">Issue tokens</Link>
      <Link to="/admin/events">Manage Events</Link>
      <Link to="/admin/minters">Manage Minters</Link>
      <a className="icon" onClick={() => toggleResponsive()}>
        <i className="fa fa-bars" />
      </a>
    </div>
  );
};

const AuthStatus = withRouter(
  // @ts-ignore
  withAuth(({ auth, history }) =>
    auth.isAuthenticated() ? (
      <p>
        Welcome!{' '}
        <button
          onClick={() => {
            auth.logout();
            history.push('/');
          }}
        >
          Sign out
        </button>
      </p>
    ) : (
      <p>You are not logged in.</p>
    )
  )
);

export const BackOffice: React.FC = () => (
  <>
    <NavigationMenu />
    <Route path="/admin/issue" component={IssuePage} />
    <Route path="/admin/events" component={EventsPage} />
    <Route path="/admin/minters" component={MintersPage} />
  </>
);
