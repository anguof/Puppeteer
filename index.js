const puppeteer = require("puppeteer");
// const CREDS = require("./creds"); // 登录用
const fs = require("fs");
const xlsx = require("node-xlsx");

const ITEM_LIST = ".item";
const MOVE_NAME = ".hd>a:first-child";
const MOVE_SCORE = ".rating_num";

// 导出Excel
function exportExcel() {
  let list = fs.readdirSync("./data");
  let dataArr = [];
  list.forEach((item, index) => {
    let path = `./data/${item}`;
    let obj = fs.readFileSync(path, "utf-8");
    let content = JSON.parse(obj).movieList;
    let arr = [["电影", "评分"]];
    content.forEach((contentItem) => {
      arr.push([contentItem.name, contentItem.score]);
    });
    dataArr[index] = {
      data: arr,
      name: path.split("./data/")[1], // 名字不能包含 \ / ? * [ ]
    };
  });

  // 写xlsx
  const buffer = xlsx.build(dataArr);
  fs.writeFile("./豆瓣电影250.xlsx", buffer, function (err) {
    if (err) throw err;
    console.log("Write to xls has finished");
  });
}

exportExcel();

// 爬虫数据
// async function run() {
//   const browser = await puppeteer.launch({
//     headless: false,
//   });
//   const page = await browser.newPage();

//   let users = [];
//   for (let i = 0; i <= 10; i++) {
//     // 跳转到指定页码
//     await page.goto(`https://movie.douban.com/top250?start=${i * 25}&filter=`, {
//       waitUntil: "domcontentloaded",
//       timeout: 0,
//     });

//     const itemUsers = await page.evaluate(
//       (sel, moveName, moveScore) => {
//         return Array.prototype.slice
//           .apply(document.querySelectorAll(sel))
//           .map(($userListItem) => {
//             const name = $userListItem
//               .querySelector(moveName)
//               .innerText.split("/")[0]
//               .trim();
//             const score = $userListItem.querySelector(moveScore).innerText;
//             return {
//               name,
//               score,
//             };
//           });
//       },
//       ITEM_LIST,
//       MOVE_NAME,
//       MOVE_SCORE
//     );
//     users = [...users, ...itemUsers];
//   }

//   //   console.log(users);
//   if (!fs.existsSync("./data")) {
//     fs.mkdirSync("./data");
//   } else {
//     // 将数据以.json格式储存在data文件夹下
//     fs.writeFile(
//       `./data/movie.json`,
//       JSON.stringify({ movieList: users }),
//       (err) => {
//         if (err) throw err;
//       }
//     );
//   }

//   exportExcel();
// }

// run();
