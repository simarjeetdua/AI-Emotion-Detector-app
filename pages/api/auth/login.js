import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/user';
import bcrypt from 'bcrypt';
import { signToken } from '../../../utils/jwt';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

  await dbConnect();
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signToken({ id: user._id, email: user.email });
  res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`);

  res.status(200).json({ ok: true, user: { id: user._id, name: user.name, email: user.email } });
}
