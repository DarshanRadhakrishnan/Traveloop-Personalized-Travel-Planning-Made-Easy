import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const passwordHash = await bcrypt.hash('demo123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@traveloop.com' },
    update: {},
    create: {
      name: 'Alex Wanderer',
      email: 'demo@traveloop.com',
      passwordHash,
      role: 'admin',
    },
  });

  // Create demo trip
  const trip = await prisma.trip.create({
    data: {
      userId: user.id,
      name: 'European Adventure',
      description: 'A 2-week journey across the most beautiful cities in Europe.',
      startDate: new Date('2026-06-15'),
      endDate: new Date('2026-06-30'),
      coverPhoto: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
      isPublic: true,
      stops: {
        create: [
          {
            cityName: 'Paris', country: 'France', flag: '🇫🇷',
            lat: 48.8566, lng: 2.3522,
            arrivalDate: new Date('2026-06-15'), departureDate: new Date('2026-06-19'), orderIndex: 0,
            activities: {
              create: [
                { name: 'Eiffel Tower Visit', type: 'sightseeing', cost: 26, durationMinutes: 120, startTime: '09:00', description: 'Skip-the-line tickets to the top' },
                { name: 'Louvre Museum', type: 'culture', cost: 17, durationMinutes: 180, startTime: '14:00', description: 'World-famous art museum' },
                { name: 'Seine River Cruise', type: 'sightseeing', cost: 15, durationMinutes: 60, startTime: '19:00', description: 'Sunset cruise along the Seine' },
              ],
            },
          },
          {
            cityName: 'Barcelona', country: 'Spain', flag: '🇪🇸',
            lat: 41.3851, lng: 2.1734,
            arrivalDate: new Date('2026-06-19'), departureDate: new Date('2026-06-23'), orderIndex: 1,
            activities: {
              create: [
                { name: 'Sagrada Familia', type: 'sightseeing', cost: 26, durationMinutes: 120, startTime: '10:00', description: 'Gaudi masterpiece basilica' },
                { name: 'La Boqueria Market', type: 'food', cost: 30, durationMinutes: 90, startTime: '13:00', description: 'Fresh tapas and local cuisine' },
                { name: 'Park Güell', type: 'sightseeing', cost: 10, durationMinutes: 120, startTime: '16:00', description: 'Colorful mosaic park' },
              ],
            },
          },
          {
            cityName: 'Rome', country: 'Italy', flag: '🇮🇹',
            lat: 41.9028, lng: 12.4964,
            arrivalDate: new Date('2026-06-23'), departureDate: new Date('2026-06-27'), orderIndex: 2,
            activities: {
              create: [
                { name: 'Colosseum Tour', type: 'culture', cost: 16, durationMinutes: 150, startTime: '09:00', description: 'Ancient Roman amphitheater' },
                { name: 'Vatican Museums', type: 'culture', cost: 17, durationMinutes: 240, startTime: '13:00', description: 'Sistine Chapel and Vatican art' },
                { name: 'Trastevere Food Tour', type: 'food', cost: 65, durationMinutes: 180, startTime: '18:00', description: 'Local Italian cuisine walk' },
              ],
            },
          },
          {
            cityName: 'Santorini', country: 'Greece', flag: '🇬🇷',
            lat: 36.3932, lng: 25.4615,
            arrivalDate: new Date('2026-06-27'), departureDate: new Date('2026-06-30'), orderIndex: 3,
            activities: {
              create: [
                { name: 'Oia Sunset', type: 'relaxation', cost: 0, durationMinutes: 120, startTime: '18:00', description: 'World-famous sunset views' },
                { name: 'Sailing Tour', type: 'adventure', cost: 120, durationMinutes: 300, startTime: '10:00', description: 'Catamaran tour around the island' },
              ],
            },
          },
        ],
      },
      budgetItems: {
        create: [
          { category: 'transport', estimatedCost: 800, actualCost: 750, notes: 'Flights + trains' },
          { category: 'stay', estimatedCost: 1200, actualCost: 1150, notes: 'Hotels and Airbnb' },
          { category: 'activities', estimatedCost: 350, actualCost: 342, notes: 'All attractions' },
          { category: 'meals', estimatedCost: 600, actualCost: 580, notes: 'Restaurants and cafes' },
        ],
      },
      checklistItems: {
        create: [
          { itemName: 'Passport', category: 'documents', isPacked: true },
          { itemName: 'Travel Insurance', category: 'documents', isPacked: true },
          { itemName: 'Phone Charger', category: 'electronics', isPacked: true },
          { itemName: 'Camera', category: 'electronics', isPacked: false },
          { itemName: 'Sunscreen', category: 'toiletries', isPacked: false },
          { itemName: 'Comfortable Walking Shoes', category: 'clothing', isPacked: true },
          { itemName: 'Rain Jacket', category: 'clothing', isPacked: false },
        ],
      },
      notes: {
        create: [
          { content: 'Remember to book the Eiffel Tower tickets at least 2 weeks in advance!' },
          { content: 'Barcelona has amazing street food near La Boqueria - don\'t miss the fresh juice stands.' },
        ],
      },
    },
  });

  console.log(`✅ Created demo user: ${user.email} (password: demo123)`);
  console.log(`✅ Created demo trip: ${trip.name}`);
  console.log('🌱 Seeding complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
