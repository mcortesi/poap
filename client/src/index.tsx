import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { authClient } from './auth';
import * as serviceWorker from './serviceWorker';

async function main() {
  await authClient.init();

  ReactDOM.render(<App auth={authClient} />, document.getElementById('root'));
}

main().catch(err => {
  console.error('Error starting app');
  console.error(err);
});

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
