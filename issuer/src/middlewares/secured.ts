import { Request, Response } from 'express';

export function secured(req: Request, res: Response, next: Function) {
  if (req.user) {
    return next();
  }
  if (req.session) {
    req.session.returnTo = req.originalUrl;
  }
  res.redirect('/admin/login');
}
