import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/trips/:tripId/notes', authenticateToken, async (req, res) => {
  try {
    const trip = await prisma.trip.findFirst({ where: { id: req.params.tripId, userId: req.user.id } });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    const notes = await prisma.tripNote.findMany({ where: { tripId: req.params.tripId }, orderBy: { createdAt: 'desc' } });
    res.json(notes);
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/trips/:tripId/notes', authenticateToken, async (req, res) => {
  try {
    const trip = await prisma.trip.findFirst({ where: { id: req.params.tripId, userId: req.user.id } });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    const { content, stopId } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required' });
    const note = await prisma.tripNote.create({
      data: { tripId: req.params.tripId, content, stopId: stopId || null },
    });
    res.status(201).json(note);
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.put('/notes/:id', authenticateToken, async (req, res) => {
  try {
    const note = await prisma.tripNote.findUnique({ where: { id: req.params.id }, include: { trip: true } });
    if (!note || note.trip.userId !== req.user.id) return res.status(404).json({ error: 'Not found' });
    const { content, stopId } = req.body;
    const updated = await prisma.tripNote.update({
      where: { id: req.params.id },
      data: { ...(content && { content }), ...(stopId !== undefined && { stopId }) },
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
