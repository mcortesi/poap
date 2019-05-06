import dotenv from 'dotenv';
import { Router } from 'express';
import passport from 'passport';

const router = Router();
dotenv.config();

// Perform the login, after login Auth0 will redirect to callback
router.get(
  '/admin/login',
  passport.authenticate('auth0', {
    scope: 'openid email profile',
  }),
  function(req, res) {
    res.redirect('/admin/issue');
  }
);

// Perform the final stage of authentication and redirect to previously requested URL or '/user'
router.get('/admin/callback', function(req, res, next) {
  passport.authenticate('auth0', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect('/admin/login');
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      let returnTo = '/admin';

      if (req.session) {
        returnTo = req.session.returnTo;
        delete req.session.returnTo;
      }
      console.log('redirecting to ', returnTo);
      res.redirect(returnTo);
    });
  })(req, res, next);
});

// Perform session logout and redirect to homepage
router.get('/admin/logout', (req, res) => {
  req.logout();
  res.redirect('/admin/');
  // let returnTo = req.protocol + '://' + req.hostname;
  // const port = req.connection.localPort;
  // if (port !== undefined && port !== 80 && port !== 443) {
  //   returnTo += ':' + port;
  // }
  // const logoutURL = new URL(util.format('https://%s/admin/logout', process.env.AUTH0_DOMAIN));
  // const searchString = querystring.stringify({
  //   client_id: process.env.AUTH0_CLIENT_ID,
  //   returnTo: returnTo,
  // });
  // logoutURL.search = searchString;

  // res.redirect(logoutURL as any);
});

export default router;
