// Drives the portfolio for `film.mjs --drive`: the index is the signature, so the film shows it being used.
// Scroll to the work, glide the pointer down the rows (the preview follows it), switch to the grid, glide again.
export default async ({ page }) => {
  const glide = async (x0, y0, x1, y1, ms) => {
    const steps = Math.max(2, Math.round(ms / 16));
    for (let i = 1; i <= steps; i++) {
      const t = i / steps, e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      await page.mouse.move(x0 + (x1 - x0) * e, y0 + (y1 - y0) * e);
      await page.waitForTimeout(16);
    }
  };
  const { innerWidth: w, innerHeight: h } = await page.evaluate(() => ({ innerWidth, innerHeight }));
  await page.waitForTimeout(400);
  const workTop = await page.evaluate(() => document.querySelector('#work').getBoundingClientRect().top + scrollY);
  // A wheel every 50 ms so the smooth scroll interpolates between them.
  for (let done = 0, total = workTop - 40; done < total; ) { const d = Math.min(140, total - done); await page.mouse.wheel(0, d); done += d; await page.waitForTimeout(50); }
  await page.waitForTimeout(600);
  const rows = await page.evaluate(() => [...document.querySelectorAll('[data-row]')].slice(0, 3).map((r) => { const b = r.getBoundingClientRect(); return [b.left + b.width * 0.38, b.top + b.height / 2]; }));
  let [x, y] = [w * 0.85, h * 0.4];
  for (const [rx, ry] of rows) { await glide(x, y, rx, ry, 320); [x, y] = [rx, ry]; await page.waitForTimeout(220); }
  const grid = await page.evaluate(() => { const b = document.querySelector('[data-view="grid"]').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; });
  await glide(x, y, grid[0], grid[1], 380); [x, y] = grid;
  await page.mouse.down(); await page.mouse.up();
  await page.waitForTimeout(1000);
  const tiles = await page.evaluate(() => [...document.querySelectorAll('[data-row]')].slice(0, 3).map((r) => { const b = r.getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height * 0.4]; }).filter(([, ty]) => ty > 0 && ty < innerHeight));
  for (const [tx, ty] of tiles) { await glide(x, y, tx, ty, 360); [x, y] = [tx, ty]; await page.waitForTimeout(260); }
  await page.waitForTimeout(400);
};
