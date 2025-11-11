import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/user';
import bcrypt from 'bcrypt';
import { signToken } from '../../../utils/jwt';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

  await dbConnect();
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });

  const token = signToken({ id: user._id, email: user.email });
  res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`);

  res.status(201).json({ ok: true, user: { id: user._id, name: user.name, email: user.email } });
}
