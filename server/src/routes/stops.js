import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Add stop to trip
router.post('/trips/:tripId/stops', authenticateToken, async (req, res) => {
  try {
    const trip = await prisma.trip.findFirst({
      where: { id: req.params.tripId, userId: req.user.id },
      include: { stops: true },
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const { cityName, country, lat, lng, flag, arrivalDate, departureDate } = req.body;

    if (!cityName || !country || !arrivalDate || !departureDate) {
      return res.status(400).json({ error: 'City name, country, arrival and departure dates are required' });
    }

    const maxOrder = trip.stops.length > 0
      ? Math.max(...trip.stops.map((s) => s.orderIndex))
      : -1;

    const stop = await prisma.stop.create({
      data: {
        tripId: req.params.tripId,
        cityName,
        country,
        lat: lat || null,
        lng: lng || null,
        flag: flag || null,
        arrivalDate: new Date(arrivalDate),
        departureDate: new Date(departureDate),
        orderIndex: maxOrder + 1,
      },
    });

    res.status(201).json(stop);
  } catch (err) {
    console.error('Add stop error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update stop
router.put('/stops/:id', authenticateToken, async (req, res) => {
  try {
    const stop = await prisma.stop.findUnique({
      where: { id: req.params.id },
      include: { trip: true },
    });

    if (!stop || stop.trip.userId !== req.user.id) {
      return res.status(404).json({ error: 'Stop not found' });
    }

    const { cityName, country, lat, lng, flag, arrivalDate, departureDate } = req.body;

    const updated = await prisma.stop.update({
      where: { id: req.params.id },
      data: {
        ...(cityName && { cityName }),
        ...(country && { country }),
        ...(lat !== undefined && { lat }),
        ...(lng !== undefined && { lng }),
        ...(flag !== undefined && { flag }),
        ...(arrivalDate && { arrivalDate: new Date(arrivalDate) }),
        ...(departureDate && { departureDate: new Date(departureDate) }),
      },
    });

    res.json(updated);
  } catch (err) {
    console.error('Update stop error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete stop
router.delete('/stops/:id', authenticateToken, async (req, res) => {
  try {
    const stop = await prisma.stop.findUnique({
      where: { id: req.params.id },
      include: { trip: true },
    });

    if (!stop || stop.trip.userId !== req.user.id) {
      return res.status(404).json({ error: 'Stop not found' });
    }

    await prisma.stop.delete({ where: { id: req.params.id } });
    res.json({ message: 'Stop deleted' });
  } catch (err) {
    console.error('Delete stop error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reorder stops
router.put('/trips/:tripId/stops/reorder', authenticateToken, async (req, res) => {
  try {
    const trip = await prisma.trip.findFirst({
      where: { id: req.params.tripId, userId: req.user.id },
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const { orderedIds } = req.body;

    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: 'orderedIds must be an array' });
    }

    const updates = orderedIds.map((id, index) =>
      prisma.stop.update({
        where: { id },
        data: { orderIndex: index },
      })
    );

    await prisma.$transaction(updates);

    const stops = await prisma.stop.findMany({
      where: { tripId: req.params.tripId },
      include: { activities: true },
      orderBy: { orderIndex: 'asc' },
    });

    res.json(stops);
  } catch (err) {
    console.error('Reorder stops error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
