const puppeteer = require("puppeteer");

const script = async (username, credentials) => {
  const browser = await puppeteer.launch({
    args: ["--incognito"],
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto("https://www.instagram.com/accounts/login", {
    waitUntil: "networkidle2",
  });
  const acceptCookieBtn = await page.$x(
    "//button[contains(text(), 'Accept All')]"
  );
  if (acceptCookieBtn.length > 0) {
    await acceptCookieBtn[0].click();
  } else {
    console.log("No, cookies acceptance message.");
  }
  await page.type("input[name=username]", credentials.username, { delay: 20 });
  await page.type("input[name=password]", credentials.password, { delay: 100 });
  await page.click("button[type=submit]", { delay: 2000 });

  await page.waitFor(5000);

  const notifyBtns = await page.$x("//button[contains(text(), 'Not Now')]");
  if (notifyBtns.length > 0) {
    await notifyBtns[0].click();
  } else {
    console.log("No notification buttons to click.");
  }

  await page.goto(`https://www.instagram.com/${username}`, {
    waitUntil: "networkidle2",
  });
  // await page.click('a[href="/rmbhh/"]');
  await page.waitFor(2000);
  const followersBtn = await page.$(
    "div[id=react-root] > section > main > div > header > section > ul > li:nth-child(2) > a"
  );
  await followersBtn.evaluate((btn) => btn.click());

  await page.waitFor(3000);
  const followersDialog = 'div[role="dialog"] > div > div:nth-child(2)';
  await page.waitForSelector(
    'div[role="dialog"] > div > div:nth-child(2) > ul'
  );
  await scrollDown(followersDialog, page);

  console.log("getting followers");
  const list1 = await page.$$(
    'div[role="dialog"] > div > div:nth-child(2) > ul > div > li > div > div > div:nth-child(2) > div > span > a'
  );

  const followers = await Promise.all(
    list1.map(async (item) => {
      const username = await (await item.getProperty("innerText")).jsonValue();
      return username;
    })
  );

  const closeBtn = await page.$(
    'div[role="dialog"] > div > div > div > div:nth-child(3) > button'
  );
  await closeBtn.evaluate((btn) => btn.click());

  const followingBtn = await page.$(
    "div[id=react-root] > section > main > div > header > section > ul > li:nth-child(3) > a"
  );
  await followingBtn.evaluate((btn) => btn.click());

  await page.waitFor(3000);

  const followerCnt = followers.length;
  console.log(`followers: ${followerCnt}`);
  await browser.close();
  return {
    followerCnt,
    followers,
  };
};

async function scrollDown(selector, page) {
  await page.evaluate(async (selector) => {
    const section = document.querySelector(selector);
    await new Promise((resolve, reject) => {
      let totalHeight = 0;
      let distance = 100;
      const timer = setInterval(() => {
        var scrollHeight = section.scrollHeight;
        section.scrollTop = 100000000;
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  }, selector);
}

module.exports = { script };
