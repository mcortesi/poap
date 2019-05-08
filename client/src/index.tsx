import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { authClient } from './auth';
import * as serviceWorker from './serviceWorker';
import './scss/main.scss';
import './poap-eth';
import AOS from 'aos';

async function main() {
  await authClient.init();
  AOS.init({
    once: true,
  });
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

/*
    //Sticky header
    var header = $("header");
    var fix = $(".fix-element")

    $(window).scroll(function() {
        var scroll = $(window).scrollTop();

        if (scroll >= 100) {
            header.addClass("fixed");
            fix.addClass("fixed");
        }
        if (scroll == 0) {
            header.removeClass("fixed");
            fix.removeClass("fixed");
        }
    });
    */
