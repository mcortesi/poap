import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { withAuth } from '.';

export interface PrivateRouteProps extends RouteProps {
  component: React.ComponentType<any>;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = withAuth(
  ({ auth, component: Component, ...rest }) => {
    return (
      <Route
        {...rest}
        render={props => {
          if (auth.isAuthenticated()) {
            return <Component {...props} />;
          } else {
            return (
              <Redirect to={{ pathname: '/login', state: { from: props.location.pathname } }} />
            );
          }
        }}
      />
    );
  }
);
