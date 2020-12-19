const puppeteer = require("puppeteer");
const fs = require("fs");

const IMAGE_LIST = ".poster-col3>li";
const IMAGE_ITEM = "img";

// 爬虫
async function run() {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  let users = [];
  for (let i = 0; i < 1; i++) {
    // 跳转到指定页码
    await page.goto(`https://movie.douban.com/celebrity/1018562/photos/?type=C&start=${i * 30}&sortby=like&size=a&subtype=a`, {
      waitUntil: "networkidle0",
      timeout: 0,
    });

    const itemUsers = await page.evaluate(
      (sel, moveName) => {
        return Array.prototype.slice
          .apply(document.querySelectorAll(sel))
          .map(($userListItem) => {
            const name = $userListItem
              .querySelector(moveName)
              .src;
            return {
              name
            };
          });
      },
      IMAGE_LIST,
      IMAGE_ITEM,
    );

    users = [...users, ...itemUsers];
    console.log(users);
  }

  await browser.close();
}

run();
