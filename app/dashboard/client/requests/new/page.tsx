import { createRequestAction } from '@/app/actions/request-actions';
import { requireRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Button, Card } from '@/components/ui';

export default async function NewRequestPage() {
  await requireRole(['CLIENT']);
  const categories = await prisma.category.findMany({ where: { isActive: true } });
  return <Card><h1 className="text-xl font-semibold mb-3">New request</h1><form action={createRequestAction} className="grid md:grid-cols-2 gap-3"><input name="title" placeholder="Title" className="border p-2 rounded md:col-span-2" /><select name="categoryId" className="border p-2 rounded">{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><input name="city" className="border p-2 rounded" placeholder="City" /><input name="zipCode" className="border p-2 rounded" placeholder="Zip code" /><select name="urgency" className="border p-2 rounded"><option>LOW</option><option defaultValue="MEDIUM">MEDIUM</option><option>HIGH</option><option>EMERGENCY</option></select><input name="budget" type="number" className="border p-2 rounded" placeholder="Budget" /><input name="preferredDate" type="date" className="border p-2 rounded" /><input name="phonePrivate" className="border p-2 rounded" placeholder="Private phone" /><input name="emailPrivate" className="border p-2 rounded md:col-span-2" placeholder="Private email" /><textarea name="description" className="border p-2 rounded md:col-span-2" rows={5} placeholder="Description" /><Button type="submit">Submit request</Button></form></Card>;
}
