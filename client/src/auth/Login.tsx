import { History } from 'history';
import { AuthService, withAuth } from '.';
import React from 'react';
import { withRouter } from 'react-router';

class Login_ extends React.Component<{ history: History; auth: AuthService; from: string }> {
  async componentDidMount() {
    await this.props.auth.login(this.props.from);
  }

  render() {
    return null;
  }
}

// @ts-ignore
export const Login = withRouter(withAuth(Login_));
