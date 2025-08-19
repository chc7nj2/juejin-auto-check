
const { chromium } = require('playwright');
const readline = require('readline');

function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("正在打开掘金登录页面...");
  await page.goto('https://juejin.cn/');

  console.log("\n" + "=".repeat(50));
  console.log("请在打开的浏览器窗口中手动完成登录操作。");
  console.log("登录成功后，不要关闭浏览器，回到这里按 Enter 键继续...");
  console.log("=".repeat(50));

  await askQuestion(''); // 等待用户按回车

  console.log("正在保存登录状态到 auth.json...");
  await context.storageState({ path: 'auth.json' });
  console.log("登录状态已成功保存！现在可以关闭浏览器了。");

  await browser.close();
})();
