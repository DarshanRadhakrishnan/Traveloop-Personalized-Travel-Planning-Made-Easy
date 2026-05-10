import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Add activity to stop
router.post('/stops/:stopId/activities', authenticateToken, async (req, res) => {
  try {
    const stop = await prisma.stop.findUnique({
      where: { id: req.params.stopId },
      include: { trip: true },
    });

    if (!stop || stop.trip.userId !== req.user.id) {
      return res.status(404).json({ error: 'Stop not found' });
    }

    const { name, type, cost, durationMinutes, description, imageUrl, startTime } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Activity name is required' });
    }

    const activity = await prisma.activity.create({
      data: {
        stopId: req.params.stopId,
        name,
        type: type || 'sightseeing',
        cost: cost || 0,
        durationMinutes: durationMinutes || 60,
        description,
        imageUrl,
        startTime,
      },
    });

    res.status(201).json(activity);
  } catch (err) {
    console.error('Add activity error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update activity
router.put('/activities/:id', authenticateToken, async (req, res) => {
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: req.params.id },
      include: { stop: { include: { trip: true } } },
    });

    if (!activity || activity.stop.trip.userId !== req.user.id) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    const { name, type, cost, durationMinutes, description, imageUrl, startTime } = req.body;

    const updated = await prisma.activity.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(cost !== undefined && { cost }),
        ...(durationMinutes !== undefined && { durationMinutes }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(startTime !== undefined && { startTime }),
      },
    });

    res.json(updated);
  } catch (err) {
    console.error('Update activity error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete activity
router.delete('/activities/:id', authenticateToken, async (req, res) => {
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: req.params.id },
      include: { stop: { include: { trip: true } } },
    });

    if (!activity || activity.stop.trip.userId !== req.user.id) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    await prisma.activity.delete({ where: { id: req.params.id } });
    res.json({ message: 'Activity deleted' });
  } catch (err) {
    console.error('Delete activity error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
