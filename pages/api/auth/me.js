import { verifyToken } from '../../../utils/jwt';
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/user';

export default async function handler(req, res) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ error: 'Invalid token' });

  await dbConnect();
  const user = await User.findById(decoded.id).select('-passwordHash');
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.status(200).json({ user });
}
