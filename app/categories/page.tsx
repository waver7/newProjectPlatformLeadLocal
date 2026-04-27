import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui';

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({ where: { isActive: true } });
  return <div className="grid md:grid-cols-3 gap-3">{categories.map((c) => <Card key={c.id}><h2 className="font-semibold">{c.name}</h2><p className="text-sm text-slate-600">{c.description}</p></Card>)}</div>;
}
