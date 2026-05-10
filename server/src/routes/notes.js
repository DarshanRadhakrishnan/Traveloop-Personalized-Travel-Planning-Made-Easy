import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/trips/:tripId/notes', authenticateToken, async (req, res) => {
  try {
    const trip = await prisma.trip.findFirst({ where: { id: req.params.tripId, userId: req.user.id } });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    const notes = await prisma.tripNote.findMany({
      where: { tripId: req.params.tripId },
      include: { stop: { select: { id: true, cityName: true, country: true, flag: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(notes);
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/trips/:tripId/notes', authenticateToken, async (req, res) => {
  try {
    const trip = await prisma.trip.findFirst({ where: { id: req.params.tripId, userId: req.user.id } });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    const { title, content, stopId, day } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required' });
    const note = await prisma.tripNote.create({
      data: {
        tripId: req.params.tripId,
        title: title || '',
        content,
        stopId: stopId || null,
        day: day || null,
      },
      include: { stop: { select: { id: true, cityName: true, country: true, flag: true } } },
    });
    res.status(201).json(note);
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.put('/notes/:id', authenticateToken, async (req, res) => {
  try {
    const note = await prisma.tripNote.findUnique({ where: { id: req.params.id }, include: { trip: true } });
    if (!note || note.trip.userId !== req.user.id) return res.status(404).json({ error: 'Not found' });
    const { title, content, stopId, day } = req.body;
    const updated = await prisma.tripNote.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(content && { content }),
        ...(stopId !== undefined && { stopId }),
        ...(day !== undefined && { day }),
      },
      include: { stop: { select: { id: true, cityName: true, country: true, flag: true } } },
    });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.delete('/notes/:id', authenticateToken, async (req, res) => {
  try {
    const note = await prisma.tripNote.findUnique({ where: { id: req.params.id }, include: { trip: true } });
    if (!note || note.trip.userId !== req.user.id) return res.status(404).json({ error: 'Not found' });
    await prisma.tripNote.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

export default router;
