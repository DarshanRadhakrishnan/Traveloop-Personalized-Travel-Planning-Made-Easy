import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateShort(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function daysBetween(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  return Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24)));
}

export function getTripStatus(startDate, endDate) {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (now < start) return 'upcoming';
  if (now > end) return 'past';
  return 'active';
}

export function getCostLabel(index) {
  const labels = { 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' };
  return labels[index] || '$';
}

export const activityTypes = [
  { value: 'sightseeing', label: 'Sightseeing', icon: '🏛️' },
  { value: 'food', label: 'Food & Dining', icon: '🍽️' },
  { value: 'adventure', label: 'Adventure', icon: '🏔️' },
  { value: 'culture', label: 'Culture', icon: '🎭' },
  { value: 'history', label: 'History', icon: '📜' },
  { value: 'nature', label: 'Nature', icon: '🌿' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎪' },
  { value: 'relaxation', label: 'Relaxation', icon: '🧘' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'nightlife', label: 'Nightlife', icon: '🌃' },
  { value: 'transport', label: 'Transport', icon: '🚆' },
];

export function getActivityIcon(type) {
  const found = activityTypes.find(a => a.value === type);
  return found ? found.icon : '📍';
}

export function getActivityLabel(type) {
  const found = activityTypes.find(a => a.value === type);
  return found ? found.label : type;
}
