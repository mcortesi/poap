import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { AuthProvider, AuthService } from './auth';
import { Callback } from './auth/Callback';
import { PrivateRoute } from './auth/PrivateRoute';
import { BackOffice } from './backoffice/Main';
import { ClaimPage } from './ClaimPage';
import { ScanPage } from './ScanPage';

type AppProps = { auth: AuthService };
const App: React.FC<AppProps> = ({ auth }) => (
  <AuthProvider value={auth}>
    <Router>
      <Switch>
        <Route exact path="/callback" component={Callback} />
        <PrivateRoute path="/admin" component={BackOffice} />
        <Route path="/claim/:event" component={ClaimPage} />
        <Route path="/" component={ScanPage} />
      </Switch>
    </Router>
  </AuthProvider>
);

export default App;
