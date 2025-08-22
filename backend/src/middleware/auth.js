import jwt from 'jsonwebtoken';

export function auth(req, res, next) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const token = auth.slice(7);
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'dev_secret');
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (req.user.role !== role) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}


