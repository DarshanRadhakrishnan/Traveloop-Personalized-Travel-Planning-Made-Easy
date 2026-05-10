import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/trips/:tripId/checklist', authenticateToken, async (req, res) => {
  try {
    const trip = await prisma.trip.findFirst({ where: { id: req.params.tripId, userId: req.user.id } });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    const items = await prisma.checklistItem.findMany({ where: { tripId: req.params.tripId }, orderBy: { category: 'asc' } });
    res.json(items);
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/trips/:tripId/checklist', authenticateToken, async (req, res) => {
  try {
    const trip = await prisma.trip.findFirst({ where: { id: req.params.tripId, userId: req.user.id } });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    const { itemName, category } = req.body;
    if (!itemName) return res.status(400).json({ error: 'Item name required' });
    const item = await prisma.checklistItem.create({
      data: { tripId: req.params.tripId, itemName, category: category || 'other' },
    });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/trips/:tripId/checklist/bulk', authenticateToken, async (req, res) => {
  try {
    const trip = await prisma.trip.findFirst({ where: { id: req.params.tripId, userId: req.user.id } });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    const { items } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: 'Items array required' });
    const created = await prisma.checklistItem.createMany({
      data: items.map(i => ({ tripId: req.params.tripId, itemName: i.itemName, category: i.category || 'other' })),
    });
    const all = await prisma.checklistItem.findMany({ where: { tripId: req.params.tripId }, orderBy: { category: 'asc' } });
    res.status(201).json(all);
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.put('/checklist/:id', authenticateToken, async (req, res) => {
  try {
    const item = await prisma.checklistItem.findUnique({ where: { id: req.params.id }, include: { trip: true } });
    if (!item || item.trip.userId !== req.user.id) return res.status(404).json({ error: 'Not found' });
    const { itemName, category, isPacked } = req.body;
    const updated = await prisma.checklistItem.update({
      where: { id: req.params.id },
      data: { ...(itemName && { itemName }), ...(category && { category }), ...(isPacked !== undefined && { isPacked }) },
    });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.delete('/checklist/:id', authenticateToken, async (req, res) => {
  try {
    const item = await prisma.checklistItem.findUnique({ where: { id: req.params.id }, include: { trip: true } });
    if (!item || item.trip.userId !== req.user.id) return res.status(404).json({ error: 'Not found' });
    await prisma.checklistItem.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.delete('/trips/:tripId/checklist', authenticateToken, async (req, res) => {
  try {
    const trip = await prisma.trip.findFirst({ where: { id: req.params.tripId, userId: req.user.id } });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    await prisma.checklistItem.deleteMany({ where: { tripId: req.params.tripId } });
    res.json({ message: 'Checklist reset' });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

export default router;
