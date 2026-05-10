import { distanceMiles, lookupZip } from '@/lib/geo';

describe('lookupZip', () => {
  it('returns coordinates for a known Columbus ZIP', () => {
    const coords = lookupZip('43201');
    expect(coords).not.toBeNull();
    expect(coords!.lat).toBeCloseTo(39.976, 1);
    expect(coords!.lon).toBeCloseTo(-82.995, 1);
  });

  it('returns coordinates for a known Cleveland ZIP', () => {
    const coords = lookupZip('44101');
    expect(coords).not.toBeNull();
    expect(coords!.lat).toBeGreaterThan(41);
    expect(coords!.lat).toBeLessThan(42);
  });

  it('returns coordinates for a known Cincinnati ZIP', () => {
    const coords = lookupZip('45201');
    expect(coords).not.toBeNull();
    expect(coords!.lat).toBeCloseTo(39.1, 0);
  });

  it('returns null for an unknown ZIP', () => {
    expect(lookupZip('00000')).toBeNull();
    expect(lookupZip('99999')).toBeNull();
  });

  it('trims whitespace from ZIP input', () => {
    expect(lookupZip('  43201  ')).not.toBeNull();
  });

  it('returns null for empty string', () => {
    expect(lookupZip('')).toBeNull();
  });
});

describe('distanceMiles', () => {
  const columbus = { lat: 39.961, lon: -83.002 };    // Columbus downtown
  const cleveland = { lat: 41.499, lon: -81.694 };   // Cleveland downtown
  const cincinnati = { lat: 39.103, lon: -84.512 };  // Cincinnati downtown
  const dayton = { lat: 39.759, lon: -84.192 };      // Dayton downtown

  it('returns 0 for identical points', () => {
    expect(distanceMiles(columbus, columbus)).toBeCloseTo(0, 5);
  });

  it('Columbus to Cleveland is approximately 140 miles', () => {
    const d = distanceMiles(columbus, cleveland);
    expect(d).toBeGreaterThan(130);
    expect(d).toBeLessThan(160);
  });

  it('Columbus to Cincinnati is approximately 100 miles', () => {
    const d = distanceMiles(columbus, cincinnati);
    expect(d).toBeGreaterThan(90);
    expect(d).toBeLessThan(115);
  });

  it('Columbus to Dayton is approximately 70 miles', () => {
    const d = distanceMiles(columbus, dayton);
    expect(d).toBeGreaterThan(60);
    expect(d).toBeLessThan(85);
  });

  it('distance is symmetric (A→B equals B→A)', () => {
    const ab = distanceMiles(columbus, cleveland);
    const ba = distanceMiles(cleveland, columbus);
    expect(ab).toBeCloseTo(ba, 6);
  });

  it('nearby ZIPs (same city) are within 5 miles of each other', () => {
    const zip1 = lookupZip('43201')!;  // Columbus
    const zip2 = lookupZip('43215')!;  // Columbus downtown
    expect(distanceMiles(zip1, zip2)).toBeLessThan(5);
  });

  it('Columbus ZIP to Cleveland ZIP is > 100 miles', () => {
    const colZip = lookupZip('43201')!;
    const cleZip = lookupZip('44101')!;
    expect(distanceMiles(colZip, cleZip)).toBeGreaterThan(100);
  });
});
