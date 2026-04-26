import { prisma } from './prisma';

export async function getSettings() {
  let settings = await prisma.adminSettings.findFirst();
  if (!settings) settings = await prisma.adminSettings.create({ data: {} });
  return settings;
}
