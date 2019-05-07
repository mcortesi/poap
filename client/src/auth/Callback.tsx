import { History } from 'history';
import { AuthService, withAuth } from '.';
import React from 'react';
import { withRouter } from 'react-router';

class Callback_ extends React.Component<{ auth: AuthService; history: History }> {
  async componentDidMount() {
    const path = await this.props.auth.handleCallback();
    this.props.history.push(path);
  }

  render() {
    return <div>Loading user profile.</div>;
  }
}

// @ts-ignore
export const Callback = withRouter(withAuth(Callback_));
