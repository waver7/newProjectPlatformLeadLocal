import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui';

const iconMap: Record<string, string> = {
  plumbing: '🔧',
  electrical: '💡',
  hvac: '❄️',
  cleaning: '🧽',
  handyman: '🛠️',
  moving: '📦',
  'appliance-repair': '🧺',
  'furniture-assembly': '🪑',
  'lawn-care': '🌿',
  roofing: '🏠',
  painting: '🎨',
  flooring: '🧱',
  other: '✨'
};

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Service categories</h1>
      <div className="grid gap-3 md:grid-cols-3">
        {categories.map((c) => (
          <Card key={c.id}>
            <p className="text-2xl">{iconMap[c.slug] || '🧰'}</p>
            <h2 className="mt-2 font-semibold">{c.name}</h2>
            <p className="text-sm text-slate-600">{c.description || 'Local professionals available for this category.'}</p>
            <Link href={`/requests?category=${c.slug}`} className="mt-3 inline-block text-sm underline">
              Browse jobs
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
