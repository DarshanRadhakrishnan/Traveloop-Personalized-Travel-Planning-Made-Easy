import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/trips/:tripId/budget', authenticateToken, async (req, res) => {
  try {
    const trip = await prisma.trip.findFirst({ where: { id: req.params.tripId, userId: req.user.id } });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    const items = await prisma.budgetItem.findMany({ where: { tripId: req.params.tripId } });
    res.json(items);
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/trips/:tripId/budget', authenticateToken, async (req, res) => {
  try {
    const trip = await prisma.trip.findFirst({ where: { id: req.params.tripId, userId: req.user.id } });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    const { category, estimatedCost, actualCost, notes } = req.body;
    const item = await prisma.budgetItem.create({
      data: { tripId: req.params.tripId, category: category || 'other', estimatedCost: estimatedCost || 0, actualCost: actualCost || 0, notes },
    });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.put('/budget/:id', authenticateToken, async (req, res) => {
  try {
    const item = await prisma.budgetItem.findUnique({ where: { id: req.params.id }, include: { trip: true } });
    if (!item || item.trip.userId !== req.user.id) return res.status(404).json({ error: 'Not found' });
    const { category, estimatedCost, actualCost, notes } = req.body;
    const updated = await prisma.budgetItem.update({
      where: { id: req.params.id },
      data: { ...(category && { category }), ...(estimatedCost !== undefined && { estimatedCost }), ...(actualCost !== undefined && { actualCost }), ...(notes !== undefined && { notes }) },
    });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.delete('/budget/:id', authenticateToken, async (req, res) => {
  try {
    const item = await prisma.budgetItem.findUnique({ where: { id: req.params.id }, include: { trip: true } });
    if (!item || item.trip.userId !== req.user.id) return res.status(404).json({ error: 'Not found' });
    await prisma.budgetItem.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

export default router;
