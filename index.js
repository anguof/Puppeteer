const puppeteer = require("puppeteer");
const fs = require("fs");

const mongoose = require("mongoose");
const Movie = require("./models/movie");

const ITEM_LIST = ".item";
const MOVE_NAME = ".hd>a:first-child";
const MOVE_SCORE = ".rating_num";

const DB_URL = "mongodb://localhost/movie";
if (mongoose.connection.readyState == 0) {
  mongoose.connect(
    DB_URL,
    { useNewUrlParser: true, useUnifiedTopology: true },
    function (err, db) {
      if (err) {
        console.log(err);
      } else {
        console.log("connected to " + DB_URL);
      }
    }
  );
}

// 入库
function upsertMovie(movieObj) {
  Movie.create(movieObj, (err, result) => {
    if (err) {
      throw err;
    }
  });
}

// 爬虫
async function run() {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  let users = [];
  for (let i = 0; i <= 2; i++) {
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
  for (let i = 0, length = users.length; i < length; i++) {
    upsertMovie({
      name: users[i]["name"],
      score: users[i]["score"],
      dateCrawled: new Date(),
    });
  }

  // if (!fs.existsSync("./data")) {
  //   fs.mkdirSync("./data");
  // }
  // 将数据以.json格式储存在data文件夹下
  // fs.writeFile(
  //   `./data/movie.json`,
  //   JSON.stringify({ movieList: users }),
  //   (err) => {
  //     if (err) throw err;
  //   }
  // );
}

run();
