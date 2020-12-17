const fs = require("fs");
const xlsx = require("node-xlsx");

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
