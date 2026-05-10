import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Get all trips for the current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { userId: req.user.id },
      include: {
        stops: {
          select: { id: true, cityName: true, country: true, flag: true },
          orderBy: { orderIndex: 'asc' },
        },
        _count: { select: { stops: true, budgetItems: true } },
      },
      orderBy: { startDate: 'asc' },
    });
    res.json(trips);
  } catch (err) {
    console.error('Get trips error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Community feed — public trips
router.get('/community', optionalAuth, async (req, res) => {
  try {
    const { search, sort, country } = req.query;

    const where = { isPublic: true };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'oldest') orderBy = { createdAt: 'asc' };
    if (sort === 'name') orderBy = { name: 'asc' };

    let trips = await prisma.trip.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, profilePhoto: true } },
        stops: {
          select: { id: true, cityName: true, country: true, flag: true },
          orderBy: { orderIndex: 'asc' },
        },
        _count: { select: { stops: true, notes: true } },
      },
      orderBy,
      take: 50,
    });

    // Filter by country if specified (post-query since SQLite can't filter nested)
    if (country) {
      trips = trips.filter(t => t.stops.some(s => s.country.toLowerCase() === country.toLowerCase()));
    }

    res.json(trips);
  } catch (err) {
    console.error('Community feed error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single trip with all related data
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const trip = await prisma.trip.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: {
        stops: {
          include: { activities: { orderBy: { startTime: 'asc' } } },
          orderBy: { orderIndex: 'asc' },
        },
        budgetItems: true,
        checklistItems: true,
        notes: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json(trip);
  } catch (err) {
    console.error('Get trip error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get public trip by primary id
router.get('/:id/public', optionalAuth, async (req, res) => {
  try {
    const trip = await prisma.trip.findFirst({
      where: { id: req.params.id, isPublic: true },
      include: {
        user: { select: { name: true, profilePhoto: true } },
        stops: {
          include: { activities: { orderBy: { startTime: 'asc' } } },
          orderBy: { orderIndex: 'asc' },
        },
        budgetItems: true,
        notes: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or not public' });
    }

    res.json(trip);
  } catch (err) {
    console.error('Get public trip error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get public trip by shareId
router.get('/shared/:shareId', optionalAuth, async (req, res) => {
  try {
    const trip = await prisma.trip.findFirst({
      where: { shareId: req.params.shareId, isPublic: true },
      include: {
        user: { select: { name: true, profilePhoto: true } },
        stops: {
          include: { activities: { orderBy: { startTime: 'asc' } } },
          orderBy: { orderIndex: 'asc' },
        },
        budgetItems: true,
        notes: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or not public' });
    }

    res.json(trip);
  } catch (err) {
    console.error('Get shared trip error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create trip
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, startDate, endDate, coverPhoto, isPublic } = req.body;

    if (!name || !startDate || !endDate) {
      return res.status(400).json({ error: 'Name, start date, and end date are required' });
    }

    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    const trip = await prisma.trip.create({
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        coverPhoto,
        isPublic: isPublic || false,
        userId: req.user.id,
      },
    });

    res.status(201).json(trip);
  } catch (err) {
    console.error('Create trip error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update trip
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const existing = await prisma.trip.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const { name, description, startDate, endDate, coverPhoto, isPublic } = req.body;

    const trip = await prisma.trip.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(coverPhoto !== undefined && { coverPhoto }),
        ...(isPublic !== undefined && { isPublic }),
      },
    });

    res.json(trip);
  } catch (err) {
    console.error('Update trip error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete trip
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const existing = await prisma.trip.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    await prisma.trip.delete({ where: { id: req.params.id } });
    res.json({ message: 'Trip deleted' });
  } catch (err) {
    console.error('Delete trip error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Clone a public trip
router.post('/:id/clone', authenticateToken, async (req, res) => {
  try {
    const original = await prisma.trip.findFirst({
      where: { id: req.params.id, isPublic: true },
      include: {
        stops: { include: { activities: true } },
        budgetItems: true,
        checklistItems: true,
      },
    });

    if (!original) {
      return res.status(404).json({ error: 'Trip not found or not public' });
    }

    const cloned = await prisma.trip.create({
      data: {
        name: `${original.name} (Copy)`,
        description: original.description,
        startDate: original.startDate,
        endDate: original.endDate,
        coverPhoto: original.coverPhoto,
        isPublic: false,
        userId: req.user.id,
        stops: {
          create: original.stops.map((stop) => ({
            cityName: stop.cityName,
            country: stop.country,
            lat: stop.lat,
            lng: stop.lng,
            flag: stop.flag,
            arrivalDate: stop.arrivalDate,
            departureDate: stop.departureDate,
            orderIndex: stop.orderIndex,
            activities: {
              create: stop.activities.map((act) => ({
                name: act.name,
                type: act.type,
                cost: act.cost,
                durationMinutes: act.durationMinutes,
                description: act.description,
                imageUrl: act.imageUrl,
                startTime: act.startTime,
              })),
            },
          })),
        },
        budgetItems: {
          create: original.budgetItems.map((bi) => ({
            category: bi.category,
            estimatedCost: bi.estimatedCost,
            actualCost: 0,
            notes: bi.notes,
          })),
        },
        checklistItems: {
          create: original.checklistItems.map((ci) => ({
            itemName: ci.itemName,
            category: ci.category,
            isPacked: false,
          })),
        },
      },
      include: { stops: true },
    });

    res.status(201).json(cloned);
  } catch (err) {
    console.error('Clone trip error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
