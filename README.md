# 掘金自动签到抽奖脚本

这是一个 Node.js 脚本，用于自动在[掘金](https://juejin.cn/)网站上进行每日签到和免费抽奖，以帮助用户自动获取矿石和相关奖励。

## 功能

-   自动进行每日签到。
-   自动进行每日免费抽奖。
-   通过保存登录状态，避免每次运行时都重新登录。

## 工作原理

脚本使用 [Playwright](https://playwright.dev/) 库来模拟浏览器操作。

1.  **`setupAuth.js`**: 这个脚本会启动一个浏览器实例，让用户手动登录一次掘金。成功登录后，它会将当前页面的登录状态（如 Cookies 和 Local Storage）保存到 `auth.json` 文件中。
2.  **`main.js`**: 这个主脚本会读取 `auth.json` 文件中的登录状态，然后启动一个无头浏览器（在后台运行，没有图形界面）。它会利用已保存的登录信息直接访问掘金的签到和抽奖页面，并执行相应的点击操作。

## 使用方法

### 1. 环境准备

-   确保你的电脑上已经安装了 [Node.js](https://nodejs.org/) (建议使用 LTS 版本)。

### 2. 安装依赖

在项目根目录下打开终端，运行以下命令来安装项目所需的依赖库：

```bash
npm install
```

### 3. 设置登录凭证

这是最关键的一步。运行以下命令，脚本会打开一个浏览器窗口，请在该窗口中手动登录你的掘金账号：

```bash
node setupAuth.js
```

登录成功后，回到终端，按 `Enter` 键。脚本会将你的登录状态保存到 `auth.json` 文件中。

**注意**：请务必保管好 `auth.json` 文件，不要泄露给他人，因为它包含了你的登录凭证。

### 4. 运行主程序

完成以上步骤后，你就可以运行主脚本来自动执行签到和抽奖了：

```bash
node main.js
```

脚本会自动完成操作并输出日志。

### 5. (可选) 使用 GitHub Actions 设置定时任务

为了实现每日自动运行，你可以使用 GitHub Actions 来定时执行签到任务。

#### 步骤：

1. **Fork 或上传项目到 GitHub**
   将项目代码上传到你的 GitHub 仓库中。

2. **设置 GitHub Secrets**
   - 进入你的 GitHub 仓库页面
   - 点击 `Settings` → `Secrets and variables` → `Actions`
   - 点击 `New repository secret`
   - 创建一个名为 `AUTH_JSON` 的 secret，将你本地 `auth.json` 文件的内容复制粘贴进去

3. **创建 GitHub Actions 工作流**
   在项目根目录创建 `.github/workflows/daily-checkin.yml` 文件：

```yaml
name: 掘金自动签到

on:
  schedule:
    # 每天北京时间早上 9 点执行（UTC 时间 1:00）
    - cron: '0 1 * * *'
  workflow_dispatch: # 允许手动触发

jobs:
  checkin:
    runs-on: ubuntu-latest
    
    steps:
    - name: 检出代码
      uses: actions/checkout@v3
      
    - name: 设置 Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: 安装依赖
      run: npm install
      
    - name: 创建 auth.json
      run: echo '${{ secrets.AUTH_JSON }}' > auth.json
      
    - name: 执行签到
      run: node main.js
      
    - name: 删除 auth.json
      if: always()
      run: rm -f auth.json
```

4. **测试运行**
   - 提交代码后，可以在仓库的 `Actions` 标签页手动触发工作流测试
   - 之后会按照设定的时间自动执行

#### 注意事项：
- GitHub Actions 的免费额度对于个人项目来说通常足够使用
- 可以根据需要调整执行时间（修改 cron 表达式）
- 建议定期检查 Actions 的执行日志，确保签到正常运行

## 项目文件说明

-   `main.js`: 自动签到和抽奖的主脚本。
-   `setupAuth.js`: 用于生成 `auth.json` 登录凭证文件的脚本。
-   `package.json`: Node.js 项目配置文件，包含了项目依赖等信息。
-   `auth.json`: (自动生成) 保存用户登录状态的文件。**请勿将此文件提交到公共代码库。**
-   `.gitignore`: Git 配置文件，已默认忽略 `node_modules` 和 `auth.json`。

## 注意事项

-   如果脚本运行失败，可以尝试重新运行 `node setupAuth.js` 来更新登录凭证。
-   网站的页面结构可能会发生变化，导致脚本失效。如果遇到问题，可能需要根据最新的页面结构更新 `main.js` 中的选择器。
