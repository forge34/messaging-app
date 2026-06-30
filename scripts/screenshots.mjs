import { chromium } from "playwright";
import { mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(__dirname, "screenshots");
const BASE = process.env.BASE_URL || "http://localhost:5173";

if (!existsSync(OUTPUT)) mkdirSync(OUTPUT, { recursive: true });

async function shot(page, name) {
  const path = join(OUTPUT, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  console.log(`  ✓ ${name}.png`);
}

async function login(page) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill("input[name=\"username\"]", "forge");
  await page.fill("input[name=\"password\"]", "password");
  await page.click("button[type=\"submit\"]");
  await page.waitForURL(/\/app\/conversations/, { timeout: 20000 });
  await page.waitForLoadState("networkidle");
}

async function setDarkMode(page) {
  await page.evaluate(() => localStorage.setItem("theme", "dark"));
  await page.reload();
  await page.waitForLoadState("networkidle");
}

async function captureViewport(browser, width, height, suffix) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  const isMobile = suffix !== "";

  try {
    // ── 1. Landing page ──
    console.log(`\n--- ${isMobile ? "Mobile (375×812)" : "Desktop (1920×1080)"} ---`);
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await shot(page, `01-landing${suffix}`);

    // ── 2. Login ──
    await login(page);

    // ── 3. Dark mode ──
    await setDarkMode(page);

    // ── 4. Conversations page ──
    // Desktop: DM list + Find People side-by-side
    // Mobile: full-screen DM list
    if (isMobile) {
      await page.goto(`${BASE}/app/conversations`, { waitUntil: "networkidle" });
    } else {
      await page.goto(`${BASE}/app/conversations/@me`, { waitUntil: "networkidle" });
    }
    await page.waitForTimeout(1000);
    await shot(page, `03-conversations${suffix}`);

    // ── 5. Open conversation with forge22332232 ──
    const TARGET_USER = "forge22332232";
    const convLink = page
      .locator("a")
      .filter({ has: page.locator("img") })
      .filter({ hasText: TARGET_USER })
      .first();

    if (await convLink.count() > 0) {
      await convLink.click();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1500);
      await shot(page, `04-chat-view${suffix}`);
    } else {
      console.log(`  ⚠ No conversation with "${TARGET_USER}" found — skipping chat screenshot`);
    }

    // ── 6. Add reaction, then open reaction menu on another message ──
    const chatArea = page.locator(".overflow-y-scroll");
    const msgElements = chatArea.locator("> div");
    const msgCount = await msgElements.count();

    if (msgCount >= 4) {
      // Pick 4th-from-last — add a reaction to it
      const reactIdx = Math.max(0, msgCount - 4);
      const reactMsg = msgElements.nth(reactIdx);

      await reactMsg.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await reactMsg.hover();
      await page.waitForTimeout(400);

      const smileBtn = (msg) =>
        msg.locator("button").filter({ has: page.locator(".lucide-smile") });

      let firstBtn = smileBtn(reactMsg);
      if (await firstBtn.count() > 0) {
        await firstBtn.click();
        await page.waitForTimeout(800);

        const picker = page.locator("aside.EmojiPickerReact").first();
        if (await picker.count() > 0) {
          const emojiBtn = picker.locator("button").first();
          if (await emojiBtn.count() > 0) {
            await emojiBtn.click();
            await page.waitForTimeout(600);
            console.log("  ✓ Added reaction to 4th-from-last message");
          }
        }
      }

      // Now open reaction menu on 3rd-from-last and screenshot
      const shotIdx = Math.max(0, msgCount - 3);
      const shotMsg = msgElements.nth(shotIdx);

      await shotMsg.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await shotMsg.hover();
      await page.waitForTimeout(400);

      const secondBtn = smileBtn(shotMsg);
      if (await secondBtn.count() > 0) {
        await secondBtn.click();
        await page.waitForTimeout(800);

        const picker2 = page.locator("aside.EmojiPickerReact").first();
        if (await picker2.count() > 0) {
          const msgBox = await shotMsg.boundingBox();
          const pickerBox = await picker2.boundingBox();

          if (msgBox && pickerBox) {
            const pad = 16;
            const x = Math.min(msgBox.x, pickerBox.x) - pad;
            const y = Math.min(msgBox.y, pickerBox.y) - pad;
            const right = Math.max(msgBox.x + msgBox.width, pickerBox.x + pickerBox.width) + pad;
            const bottom = Math.max(msgBox.y + msgBox.height, pickerBox.y + pickerBox.height) + pad;

            await page.screenshot({
              path: join(OUTPUT, `06-reaction-menu${suffix}.png`),
              clip: { x, y, width: right - x, height: bottom - y },
            });
            console.log(`  ✓ 06-reaction-menu${suffix}.png`);
          }
        } else {
          console.log(`  ⚠ Emoji picker did not appear — skipping reaction screenshot`);
        }
      } else {
        console.log(`  ⚠ No reaction button found — skipping reaction screenshot`);
      }
    } else {
      console.log(`  ⚠ Not enough messages for reaction screenshot`);
    }

    // ── 7. Profile page ──
    await page.goto(`${BASE}/app/users/profile`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await shot(page, `05-profile${suffix}`);
  } finally {
    await ctx.close();
  }
}

async function main() {
  console.log("Starting screenshot capture...");
  const browser = await chromium.launch({ headless: true });
  try {
    await captureViewport(browser, 1920, 1080, "");
    await captureViewport(browser, 375, 812, "-mobile");
    console.log("\nDone — all screenshots saved to screenshots/");
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
