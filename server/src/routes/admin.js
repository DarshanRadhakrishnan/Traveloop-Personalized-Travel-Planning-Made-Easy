import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalTrips = await prisma.trip.count();
    const totalStops = await prisma.stop.count();
    const totalActivities = await prisma.activity.count();

    const popularCities = await prisma.stop.groupBy({
      by: ['cityName', 'country'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    const recentUsers = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true, _count: { select: { trips: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json({ totalUsers, totalTrips, totalStops, totalActivities, popularCities, recentUsers });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

export default router;
