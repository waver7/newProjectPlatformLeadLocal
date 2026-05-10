import { prisma } from './prisma';

export async function getSettings() {
  const existing = await prisma.adminSettings.findFirst();
  if (existing) return existing;
  // Only reached before any seed run; safe to create here
  try {
    return await prisma.adminSettings.create({ data: {} });
  } catch {
    // Another request beat us to it
    return (await prisma.adminSettings.findFirst())!;
  }
}
