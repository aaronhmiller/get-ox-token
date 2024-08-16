//import puppeteer from "npm:puppeteer";
import puppeteer from "https://deno.land/x/puppeteer/mod.ts";
import { copy } from "https://deno.land/x/clipboard/mod.ts";
import { load } from "https://deno.land/std/dotenv/mod.ts";

const env = await load();

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    //    protocol: 'webDriverBiDi',
    //    product: "firefox",
    //    executablePath: "/Applications/Firefox.app/Contents/MacOS/firefox",
    args: ["--window-size=2200,1000"],
  }); // launch browser
  const page = await browser.newPage(); // open a new page

  // Set the viewport to a typical desktop resolution
  await page.setViewport({ width: 2200, height: 1000 });

  // Navigate to the website with Google OAuth, waitUntil so redirects are followed
  await page.goto("https://app.ox.security/login", {
    waitUntil: "networkidle2",
  });

  // Listen for requests that contain the bearer token
  page.on("request", (request) => {
    const url = request.url();
    if (url.includes("https://api.cloud.ox.security/api/report-service")) {
      console.log("Request made to:", url);
      console.log("Authorization header:", request.headers()["authorization"]);
      let fullToken = request.headers()["authorization"];
      if (fullToken && fullToken.startsWith("Bearer ")) {
        // Remove "Bearer " from the start of the string
        const trimmedToken = fullToken.replace("Bearer ", "");
        console.log("Copying to clipboard...");
        copy(trimmedToken);
      } else {
        console.log("Token is not set.");
      }
    }
  });

  // Wait for Google login page to load (yes, load is the default it's here for clarity)
  await page.waitForNavigation({ waitUntil: "load" });

  // Wait for "Continue with Google" button and select it
  await page.waitForFunction(() => {
    return document.querySelector('button[data-provider="google"]') !== null;
  });
  //, { timeout: 300 } //is it needed?
  await page.click('button[data-provider="google"]');

  // Wait for Google login page to load
  await page.waitForNavigation({ waitUntil: "networkidle2" });

  // Enter Google email
  const usr = env.USR;
  await page.type('input[type="email"]', usr);
  await page.click("#identifierNext");

  // Wait for password field
  await page.waitForSelector('input[type="password"]', { visible: true });

  // Enter Google password
  const pwd1 = env.PWD1;
  await page.type('input[type="password"]', pwd1);
  await page.click("#passwordNext"); // Click on the "Next" button

  // Wait for page to load
  await page.waitForSelector('input[name="username"]');

  // Enter email again
  await page.type('input[name="username"]', usr);
  await page.click('button[type="submit"]'); // Click on the "Continue" button

  // Wait for password field
  await page.waitForSelector('input[type="password"]', { visible: true });

  // Enter different Google password
  const pwd2 = env.PWD2;
  await page.type('input[type="password"]', pwd2);
  await page.click('button[type="submit"]'); // Click on the "Continue" button

  // Wait for the final page to load (redirected to the original website)
  await page.waitForNavigation({ waitUntil: "networkidle2" });

  // close browser
  await browser.close();
})();
