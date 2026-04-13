import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui';

export default async function RequestDetail({ params }: { params: { id: string } }) {
  const req = await prisma.request.findUnique({ where: { id: params.id }, include: { category: true } });
  if (!req || req.status !== 'OPEN') notFound();
  return <Card><h1 className="text-2xl font-bold">{req.title}</h1><p className="text-sm text-slate-600">{req.city} • {req.category.name}</p><p className="mt-4 whitespace-pre-wrap">{req.description}</p><p className="mt-3 text-sm">Contact hidden until contractor is awarded.</p></Card>;
}
