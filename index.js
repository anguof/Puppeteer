const puppeteer = require("puppeteer");
// const CREDS = require("./creds"); // 登录用
const fs = require("fs");

const ITEM_LIST = ".item";
const MOVE_NAME = ".hd>a:first-child";
const MOVE_SCORE = ".rating_num";

// 爬虫
async function run() {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  let users = [];
  for (let i = 0; i <= 10; i++) {
    // 跳转到指定页码
    await page.goto(`https://movie.douban.com/top250?start=${i * 25}&filter=`, {
      waitUntil: "domcontentloaded",
      timeout: 0,
    });

    const itemUsers = await page.evaluate(
      (sel, moveName, moveScore) => {
        return Array.prototype.slice
          .apply(document.querySelectorAll(sel))
          .map(($userListItem) => {
            const name = $userListItem
              .querySelector(moveName)
              .innerText.split("/")[0]
              .trim();
            const score = $userListItem.querySelector(moveScore).innerText;
            return {
              name,
              score,
            };
          });
      },
      ITEM_LIST,
      MOVE_NAME,
      MOVE_SCORE
    );
    users = [...users, ...itemUsers];
  }

  console.log(users);

  if (!fs.existsSync("./data")) {
    fs.mkdirSync("./data");
  }
  // 将数据以.json格式储存在data文件夹下
  fs.writeFile(
    `./data/movie.json`,
    JSON.stringify({ movieList: users }),
    (err) => {
      if (err) throw err;
    }
  );
}

run();
