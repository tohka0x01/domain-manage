# 🌐 域名管理系统

一个现代化的域名管理工具，基于 Cloudflare Workers 和 D1 数据库构建，帮助你统一管理多个域名的注册商、托管商、到期时间等信息，并提供自动化的 Telegram 到期提醒功能。

![iOS风格UI](https://img.shields.io/badge/UI-Modern%20Glass-007AFF)
![Cloudflare](https://img.shields.io/badge/Deploy-Cloudflare-F38020)
![D1 Database](https://img.shields.io/badge/Database-D1-F38020)
![Workers](https://img.shields.io/badge/Runtime-Workers-F38020)

---

## 🎯 在线演示

> **📍 Demo 站点**：[https://demo.vibo.qzz.io/](https://demo.vibo.qzz.io/)  
> **🔑 演示密钥**：`test`

立即访问演示站点，体验完整功能无需部署！

---

## ✨ 功能特性

### 核心功能

- 📋 **域名列表管理**：添加、编辑、删除域名信息
- 📊 **可视化展示**：直观的到期进度条和状态标签
- ⏰ **到期提醒**：30 天/7 天内到期域名高亮警示
- 🔔 **Telegram 通知**：定时自动推送域名到期提醒（北京时间每日 09:00）
- 🔐 **访问验证**：通过密钥保护页面访问安全
- ⚙️ **站点设置**：自定义站点名称、通知模板配置

### 技术特性

- 📱 **响应式设计**：完美适配桌面和移动设备
- 🎨 **现代化 UI**：玻璃态（Glass Morphism）设计风格，动画流畅
- ⚡ **无服务器架构**：基于 Cloudflare Workers，全球边缘部署
- 💾 **D1 数据库**：SQLite 兼容，免费配额慷慨
- 🌍 **国际化支持**：中英文双语切换

## 🎨 界面预览

### 进度条颜色说明

- 🔵 **蓝色**：无限期域名
- 🟢 **绿色**：正常（>30 天）
- 🟠 **橙色**：30 天内到期
- 🔴 **红色**：7 天内到期
- 🩷 **粉红**：已过期

## 📋 前置要求

在开始之前，请确保你已准备以下内容：

1. **Cloudflare 账号**：[免费注册](https://dash.cloudflare.com/sign-up)
2. **Node.js 环境**：[下载安装](https://nodejs.org/) (推荐 v18 或更高版本)
3. **Git**：用于克隆项目（可选，也可直接下载 ZIP）
4. **Telegram Bot**（可选）：如需到期提醒功能，需创建 Telegram Bot

---

## 🚀 快速部署

### 方式一：一键部署（推荐）

点击下方按钮即可快速部署到 Cloudflare Workers：

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/tohka0x01/domain-manage)

> **✨ 全自动部署流程**：
>
> 1. **一键启动** - 点击按钮后自动创建项目副本到你的 GitHub 账号
> 2. **授权连接** - 授权 Cloudflare Workers 访问你的 GitHub 仓库
> 3. **自动配置** - Cloudflare 自动完成以下操作：
>    - ✅ 创建 D1 数据库实例
>    - ✅ 运行数据库迁移脚本（自动创建表和初始数据）
>    - ✅ 部署 Worker 应用
>    - ✅ 绑定静态资源
> 4. **配置密钥** - 设置 `ACCESS_KEY` 环境变量（**唯一需要手动操作的步骤**）
>
> **🔐 部署后配置访问密钥（必须）**：
>
> 在 Cloudflare Workers 管理页面：
>
> 1. 进入你的 Worker → **Settings** → **Variables**
> 2. 找到 `ACCESS_KEY` 变量，点击 **Edit**
> 3. 修改为你的自定义密码（**建议使用强密码**）
> 4. 点击 **Save and Deploy**
> 5. 访问你的 Worker URL，使用设置的密钥登录
>
> **🎯 可选配置**：
>
> 部署完成后，在系统设置页面可以配置：
>
> - **Telegram 通知** - 配置 Bot Token 和 Chat ID，接收域名到期提醒
> - **通知提前天数** - 自定义到期提醒时间（默认：30、15、7、3、1 天）
> - **站点名称** - 自定义系统标题
>
> **🔄 获取更新**：
>
> 部署后如需同步原仓库的新功能和 Bug 修复，请查看 [🔄 更新到最新版本](#-更新到最新版本) 章节。

---

### 方式二：手动部署

#### 步骤 1: 克隆项目

```bash
git clone https://github.com/your-username/domain-manage.git
cd domain-manage
```

或直接下载 ZIP 文件并解压。

#### 步骤 2: 安装依赖

```bash
npm install
```

**安装内容：**

- `wrangler` - Cloudflare Workers 开发工具
- 其他必要的开发依赖

#### 步骤 3: 登录 Cloudflare

首次使用需要登录 Cloudflare 账号：

```bash
npx wrangler login
```

**操作步骤：**

1. 执行命令后会自动打开浏览器
2. 登录你的 Cloudflare 账号
3. 点击"允许"授权 Wrangler 访问
4. 返回终端，看到成功提示即可

#### 步骤 4: 创建 D1 数据库

```bash
npm run db:create
```

**执行结果示例：**

```
✅ Successfully created DB 'domain-manage-db'
Created your database using D1's new storage backend.

[[d1_databases]]
binding = "DB"
database_name = "domain-manage-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**⚠️ 重要：** 复制输出中的 `database_id` 值，下一步需要用到。

#### 步骤 5: 配置 wrangler.toml

打开 `wrangler.toml` 文件，完成以下配置：

##### 5.1 配置数据库 ID

找到第 15 行，将 `database_id` 替换为上一步复制的值：

```toml
[[d1_databases]]
binding = "DB"
database_name = "domain-manage-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # 替换为你的数据库 ID
```

##### 5.2 配置访问密钥（必须）

找到第 32 行，设置你的访问密钥：

```toml
ACCESS_KEY = "your-secure-password-here"  # 替换为你的强密码
```

**密钥要求：**

- ✅ 至少 12 个字符
- ✅ 建议包含字母、数字、特殊字符
- ✅ 不要使用弱密码如 `123456`、`password`

**生成强密钥（推荐）：**

```bash
# 方法 1: 使用 Node.js 生成随机密钥
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"

# 方法 2: 使用 UUID
node -e "console.log(require('crypto').randomUUID())"
```

复制输出结果，粘贴到 `ACCESS_KEY` 的值中。

##### 5.3 配置 Cron 触发器（可选）

如果需要修改通知时间，编辑第 25 行：

```toml
[triggers]
crons = ["0 1 * * *"]  # 每天 UTC 01:00（北京时间 09:00）
```

**常用时间配置：**

- `0 1 * * *` - 每天 UTC 01:00（北京时间 09:00）
- `0 0 * * *` - 每天 UTC 00:00（北京时间 08:00）
- `0 2 * * *` - 每天 UTC 02:00（北京时间 10:00）

#### 步骤 6: 初始化数据库表结构

```bash
npm run db:init
```

**执行内容：**

- 创建 `domains` 表（存储域名信息）
- 创建 `settings` 表（存储站点配置）
- 插入默认设置数据

#### 步骤 7: 部署到 Cloudflare Workers

```bash
npm run deploy
```

**部署过程：**

1. 编译和打包代码
2. 上传到 Cloudflare Workers
3. 绑定 D1 数据库
4. 配置 Cron 触发器

**部署成功后会显示：**

```
✨ Deployment complete!
🌐 Your worker is available at:
   https://domain-manage.your-subdomain.workers.dev
```

### 步骤 8: 访问应用并完成初始设置

1. **访问你的 Workers 域名**

   打开浏览器访问部署后显示的链接（如 `https://domain-manage.xxx.workers.dev`）

2. **输入访问密钥**

   首次访问会看到验证页面，输入你在 `wrangler.toml` 中设置的 `ACCESS_KEY`

3. **配置 Telegram 通知（可选）**

   点击右上角"设置"按钮，填写以下信息：

   - **站点名称**：自定义名称（如"我的域名管理"）
   - **Telegram Bot Token**：从 [@BotFather](https://t.me/BotFather) 创建 Bot 后获取
   - **Telegram Chat ID**：发送消息给 [@userinfobot](https://t.me/userinfobot) 获取你的 ID
   - **提醒天数**：如 `30,7`（逗号分隔，表示 30 天和 7 天前提醒）

4. **开始添加域名**

   点击右上角"添加域名"按钮，填写域名信息即可

---

## 🔄 更新到最新版本

### 📖 更新机制说明

通过 **Deploy to Cloudflare Workers** 按钮部署的项目，会在您的 GitHub 账户下创建一个**独立的仓库副本**（不是传统的 fork）。

**这意味着：**

- ✅ 您拥有完整的仓库控制权
- ✅ 可以自由修改代码而不影响原仓库
- ❌ **不会自动同步**原仓库的更新
- ❌ 重新点击 Deploy 按钮会创建**新的仓库**，而非更新现有仓库

### 🔧 更新方式

当原仓库有新功能或 Bug 修复时，您可以通过以下两种方式更新：

---

#### **方式一：使用 Git 命令行（推荐）**

**适用场景：** 熟悉 Git 操作的用户

**步骤：**

1. **克隆您的仓库到本地**（如果还未克隆）

   ```bash
   git clone https://github.com/YOUR_USERNAME/domain-manage.git
   cd domain-manage
   ```

2. **添加原仓库为上游源**

   ```bash
   git remote add upstream https://github.com/tohka0x01/domain-manage.git
   ```

3. **获取上游更新**

   ```bash
   git fetch upstream
   ```

4. **合并更新到您的主分支**

   ```bash
   git checkout master
   git merge upstream/master
   ```

5. **处理可能的冲突**（如果有）

   - 如果您修改过代码，可能会出现冲突
   - 手动编辑冲突文件，保留所需的更改
   - 完成后执行：
     ```bash
     git add .
     git commit -m "Merge upstream updates"
     ```

6. **推送更新到您的 GitHub 仓库**

   ```bash
   git push origin master
   ```

7. **触发 Cloudflare 自动部署**

   - 推送到 GitHub 后，Cloudflare 会**自动检测变更**并重新部署
   - 等待 1-2 分钟即可看到更新生效

---

#### **方式二：使用 GitHub Web 界面**

**适用场景：** 不熟悉命令行的用户

**步骤：**

1. **访问您的 GitHub 仓库**

   打开 `https://github.com/YOUR_USERNAME/domain-manage`

2. **创建 Pull Request 同步更新**

   - 点击仓库页面上方的 **"Sync fork"** 下拉菜单（如果可见）
   - 或者点击 **"Fetch upstream"** → **"Fetch and merge"**

   > ⚠️ **注意**：由于 Deploy Button 创建的不是标准 fork，这个按钮可能不显示

3. **手动比较和合并（如果上述按钮不可用）**

   - 访问原仓库：`https://github.com/tohka0x01/domain-manage`
   - 点击 **"Code"** → **"Download ZIP"** 下载最新代码
   - 解压后，将需要更新的文件复制到您的仓库
   - 通过 GitHub Web 界面上传文件并提交

4. **等待自动部署**

   - GitHub 推送后，Cloudflare Workers 会自动重新部署
   - 查看部署状态：访问 [Cloudflare Dashboard](https://dash.cloudflare.com/) → Workers & Pages

---

### ⚙️ 验证更新是否成功

**检查步骤：**

1. **查看 GitHub 仓库的最新提交**

   - 确认您的仓库已包含原仓库的最新提交记录

2. **访问您的 Workers 域名**

   - 刷新页面（Ctrl/Cmd + Shift + R 强制刷新）
   - 检查新功能是否出现

3. **查看 Cloudflare 部署日志**
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 进入 **Workers & Pages** → 选择您的项目
   - 查看 **Deployments** 标签确认最新部署时间

---

### ❓ 常见问题

**Q1: 我修改过代码，更新会覆盖我的改动吗？**

A: 使用 Git 合并时，您的自定义改动会被保留。如果出现冲突，Git 会提示您手动解决。

**Q2: 更新后访问密钥需要重新设置吗？**

A: 不需要。`wrangler.toml` 中的配置（包括 `ACCESS_KEY`）会保留，除非您主动修改。

**Q3: 更新后数据库数据会丢失吗？**

A: 不会。更新只影响代码，Cloudflare D1 数据库中的数据完全独立存储。

**Q4: 我可以跳过某些更新吗？**

A: 可以。使用 Git 命令行方式，您可以选择性地合并特定提交或文件。

**Q5: 如何知道原仓库有新更新？**

A: 建议：

- ⭐ **Star** 原仓库：`https://github.com/tohka0x01/domain-manage`
- 🔔 **Watch** → **Custom** → 勾选 **Releases**（仅关注版本发布）
- 📰 定期查看原仓库的 **Commits** 或 **Releases** 页面

---

### 🔗 快速命令参考

```bash
# 一次性更新完整流程（已配置 upstream 的情况）
git fetch upstream
git merge upstream/master
git push origin master

# 查看当前配置的远程仓库
git remote -v

# 如果需要删除 upstream 重新添加
git remote remove upstream
git remote add upstream https://github.com/tohka0x01/domain-manage.git
```

---

## 💻 本地开发

### 📌 重要说明 - 首次本地开发配置

由于项目使用了占位符 `database_id`（用于一键部署），本地开发时需要使用 **migrations** 方式初始化数据库：

**推荐方式（使用 D1 Migrations）：**

```bash
# 1. 应用数据库迁移（自动创建表结构和初始数据）
npm run db:migrations:apply:local

# 2. 启动开发服务器
npm run dev
```

**传统方式（使用 schema.sql）：**

如果 migrations 命令失败，可以使用传统方式：

```bash
# 1. 创建本地数据库并初始化
npx wrangler d1 execute DB --local --file=./schema.sql

# 2. 启动开发服务器
npm run dev
```

**访问地址：** http://localhost:8787

---

### 本地开发说明

**数据库存储位置：**

- 本地数据存储在 `.wrangler/state/v3/d1/miniflare-D1DatabaseObject/` 目录
- 文件格式为 SQLite 数据库文件（`.sqlite`）

**开发特性：**

- ✅ 使用本地 D1 数据库（独立于生产环境）
- ✅ 支持热重载，修改代码自动刷新
- ✅ 所有配置从 `wrangler.toml` 读取
- ✅ 支持完整的 D1 SQL 功能

**常用命令：**

```bash
# 查看本地数据库列表
npx wrangler d1 list

# 执行 SQL 查询（查看域名数据）
npx wrangler d1 execute DB --local --command="SELECT * FROM domains"

# 执行 SQL 查询（查看设置）
npx wrangler d1 execute DB --local --command="SELECT * FROM settings"

# 创建新的迁移文件
npm run db:migrations:create "add_new_field"
```

---

### 清除本地数据库

如果需要重置本地数据库（清除所有数据并重新开始）：

**方法一：删除数据库文件**

```bash
# Windows
rmdir /s /q .wrangler\state

# Linux/Mac
rm -rf .wrangler/state

# 重新初始化
npm run db:migrations:apply:local
```

**方法二：删除所有表（保留数据库文件）**

```bash
# 删除 domains 表
npx wrangler d1 execute DB --local --command="DROP TABLE IF EXISTS domains"

# 删除 settings 表
npx wrangler d1 execute DB --local --command="DROP TABLE IF EXISTS settings"

# 重新运行迁移
npm run db:migrations:apply:local
```

---

## 📁 项目结构

```
domain-manage/
├── migrations/                # 数据库迁移文件目录
│   └── 0001_initial_setup.sql # 初始数据库架构
├── public/                    # 静态资源目录
│   ├── index.html             # 主页面（包含访问验证界面）
│   ├── css/
│   │   └── style.css          # 样式文件（Glass Morphism 风格）
│   └── js/
│       └── app.js             # 前端逻辑（域名管理 + 验证功能）
├── src/
│   └── worker.js              # Cloudflare Worker API 处理器
├── schema.sql                 # D1 数据库表结构定义（本地开发用）
├── wrangler.toml              # Cloudflare 配置文件（环境变量、数据库绑定）
├── package.json               # NPM 依赖和脚本定义
└── README.md                  # 项目文档
```

---

## 🔧 配置说明

### 环境变量配置（wrangler.toml）

```toml
# 访问密钥配置（必须）
[vars]
ACCESS_KEY = "your-secure-password-here"  # 页面访问密钥

# Cron 触发器配置（可选）
[triggers]
crons = ["0 1 * * *"]  # 每天 UTC 01:00 执行（北京时间 09:00）

# D1 数据库绑定（必须）
[[d1_databases]]
binding = "DB"
database_name = "domain-manage-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### Telegram Bot 配置（应用内设置）

1. **创建 Telegram Bot**

   - 打开 Telegram，搜索 [@BotFather](https://t.me/BotFather)
   - 发送 `/newbot` 创建新机器人
   - 按提示设置机器人名称和用户名
   - 复制获得的 **Bot Token**（格式：`123456789:ABCdefGHIjklMNOpqrsTUVwxyz`）

2. **获取 Chat ID**

   - 搜索 [@userinfobot](https://t.me/userinfobot)
   - 点击 "START" 发送消息
   - 机器人会返回你的用户信息，复制 **Id** 字段

3. **在应用中配置**

   - 访问你的域名管理系统
   - 点击右上角"设置"图标
   - 填写 Bot Token 和 Chat ID
   - 设置提醒天数（如 `30,7`）
   - 可选：自定义通知消息模板

### 通知消息模板变量

支持以下变量（用花括号包裹）：

- `{domain}` - 域名
- `{days_left}` - 剩余天数
- `{expire_date}` - 到期日期
- `{registrar}` - 注册商
- `{hosting}` - 托管商
- `{purchase_price}` - 购买价格
- `{renewal_price}` - 续费价格

**示例模板：**

```
⚠️ 域名到期提醒

域名：{domain}
剩余天数：{days_left} 天
到期日期：{expire_date}
注册商：{registrar}
续费价格：{renewal_price}

请及时续费以避免域名过期失效。
```

---

## 🔌 API 接口文档

### 域名管理接口

| 方法   | 路径             | 说明         |
| ------ | ---------------- | ------------ |
| GET    | /api/domains     | 获取域名列表 |
| POST   | /api/domains     | 添加域名     |
| GET    | /api/domains/:id | 获取单个域名 |
| PUT    | /api/domains/:id | 更新域名     |
| DELETE | /api/domains/:id | 删除域名     |

### 设置管理接口

| 方法 | 路径          | 说明     |
| ---- | ------------- | -------- |
| GET  | /api/settings | 获取设置 |
| PUT  | /api/settings | 更新设置 |

### 其他接口

| 方法 | 路径               | 说明               |
| ---- | ------------------ | ------------------ |
| GET  | /api/stats         | 获取统计数据       |
| POST | /api/verify        | 验证访问密钥       |
| POST | /api/test-telegram | 测试 Telegram 配置 |

---

## 📝 数据库字段说明

### domains 表（域名信息）

| 字段             | 类型    | 说明                                |
| ---------------- | ------- | ----------------------------------- |
| id               | INTEGER | 主键，自增                          |
| domain_name      | TEXT    | 域名（必填）                        |
| registrar        | TEXT    | 注册商（如 Namecheap、GoDaddy）     |
| hosting_provider | TEXT    | 托管商（如 Cloudflare、阿里云）     |
| purchase_price   | REAL    | 购买价格                            |
| purchase_period  | TEXT    | 购买周期（如"一年"、"三年"）        |
| renewal_price    | REAL    | 续费价格                            |
| renewal_period   | TEXT    | 续费周期                            |
| expire_date      | TEXT    | 到期日期（ISO 格式，NULL 为无限期） |
| notes            | TEXT    | 备注信息                            |
| created_at       | TEXT    | 创建时间                            |
| updated_at       | TEXT    | 更新时间                            |

### settings 表（站点配置）

| 字段                  | 类型    | 说明                           |
| --------------------- | ------- | ------------------------------ |
| id                    | INTEGER | 主键，自增                     |
| site_name             | TEXT    | 站点名称                       |
| telegram_bot_token    | TEXT    | Telegram Bot Token             |
| telegram_chat_id      | TEXT    | Telegram Chat ID               |
| notify_days           | TEXT    | 提醒天数（逗号分隔，如"30,7"） |
| notification_template | TEXT    | 通知消息模板                   |

---

## 🎯 高级功能

### 自定义域名绑定

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages**
3. 选择你的项目（domain-manage）
4. 点击 **Custom Domains** 标签
5. 点击 **Add Custom Domain**
6. 输入你的域名（如 `domains.example.com`）
7. 按提示完成 DNS 配置

### 修改访问密钥

如需更换访问密钥：

```bash
# 1. 生成新密钥
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"

# 2. 更新 wrangler.toml 中的 ACCESS_KEY

# 3. 重新部署
npm run deploy

# 4. 清除浏览器 localStorage
# 在浏览器控制台执行：localStorage.removeItem('access_verified')
```

### 备份与恢复数据

**导出数据：**

```bash
# 导出域名数据到 domains.json
wrangler d1 execute domain-manage-db --command="SELECT * FROM domains" --json > domains.json

# 导出设置数据到 settings.json
wrangler d1 execute domain-manage-db --command="SELECT * FROM settings" --json > settings.json
```

**导入数据：**

使用 SQL 语句手动导入，或通过应用界面逐条添加。

---

## ❓ 常见问题

### 1. 忘记访问密钥怎么办？

查看 `wrangler.toml` 文件中的 `ACCESS_KEY` 值，或重新生成并部署。

### 2. Telegram 通知不工作？

检查以下配置：

- ✅ Bot Token 格式正确
- ✅ Chat ID 是纯数字
- ✅ 已向 Bot 发送过至少一条消息
- ✅ Cron 触发器已启用（查看 wrangler.toml）
- ✅ 点击"测试 Telegram 配置"按钮验证

### 3. 如何修改通知时间？

编辑 `wrangler.toml` 中的 crons 配置，然后重新部署：

```toml
[triggers]
crons = ["0 2 * * *"]  # 修改为 UTC 02:00（北京时间 10:00）
```

### 4. 本地开发时数据丢失？

本地数据存储在 `.wrangler/state` 目录，确保该目录未被删除。如需持久化，将该目录添加到版本控制或定期备份。

### 5. 部署后无法访问？

- 检查 Cloudflare Workers 是否部署成功
- 确认数据库 ID 配置正确
- 查看浏览器控制台是否有错误信息
- 尝试清除浏览器缓存

### 6. D1 数据库有哪些限制？

#### **📦 存储限制**

| 计划类型         | 单库大小            | 账户总存储 | 数据库数量 |
| ---------------- | ------------------- | ---------- | ---------- |
| **Free Plan**    | 500 MB              | 5 GB       | 10 个      |
| **Workers Paid** | **10 GB（硬限制）** | 1 TB       | 50,000 个  |

> ⚠️ **重要**：10 GB 是单个数据库的**硬性限制**，即使付费也无法突破。需要更大容量时，官方推荐拆分为多个数据库。

#### **📊 读写配额（Free Plan）**

| 指标             | 每日限制        | 重置时间       |
| ---------------- | --------------- | -------------- |
| **Rows Read**    | 5,000,000 行/天 | 每天 00:00 UTC |
| **Rows Written** | 100,000 行/天   | 每天 00:00 UTC |

**Workers Paid Plan**：前 250 亿行读取 + 前 5000 万行写入/月免费，超出部分按 $0.001/百万行读取、$1/百万行写入计费。

#### **🔍 实际使用场景（域名管理系统）**

假设管理 **500 个域名**，每月操作：

| 操作          | 频率      | Rows Read   | Rows Written |
| ------------- | --------- | ----------- | ------------ |
| 查看域名列表  | 100 次/月 | 50,000      | 0            |
| 添加/编辑域名 | 70 次/月  | 70          | 70           |
| 定时检查到期  | 30 次/月  | 15,000      | 0            |
| **月度总计**  | -         | **~65,000** | **~70**      |

**结论**：

- ✅ **Free Plan** 完全足够（每日 500 万行读取配额）
- ✅ 存储占用 < 1 MB（远低于 500 MB 限制）
- ✅ 即使扩展到 **10,000 域名**，月读取量仍在 Paid Plan 免费额度内（$0/月）

#### **💡 优化建议**

```sql
-- ❌ 低效：全表扫描
SELECT * FROM domains WHERE expiry_date < '2024-12-31';

-- ✅ 高效：创建索引
CREATE INDEX idx_expiry_date ON domains(expiry_date);
```

**参考资料**：

- [D1 定价详情](https://developers.cloudflare.com/d1/platform/pricing/)
- [D1 平台限制](https://developers.cloudflare.com/d1/platform/limits/)

---

## 🔒 安全建议

1. **访问密钥**：使用强密码，定期更换
2. **敏感数据**：不要将 `wrangler.toml` 提交到公开仓库（建议添加到 `.gitignore`）
3. **Telegram Token**：妥善保管 Bot Token，避免泄露
4. **自定义域名**：建议启用 HTTPS（Cloudflare 自动提供）
5. **定期备份**：导出域名数据，防止数据丢失

---

## 📄 开源许可

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 🙏 致谢

- [Cloudflare Workers](https://workers.cloudflare.com/) - 边缘计算平台
- [Cloudflare D1](https://developers.cloudflare.com/d1/) - 无服务器 SQL 数据库
- [Telegram Bot API](https://core.telegram.org/bots/api) - 消息推送服务
- [Flatpickr](https://flatpickr.js.org/) - 日期选择器组件

---

## 📞 支持与反馈

如有问题或建议，欢迎：

- 提交 [Issue](https://github.com/your-username/domain-manage/issues)
- 发起 [Pull Request](https://github.com/your-username/domain-manage/pulls)
- 关注项目获取最新更新

---

**⭐ 如果这个项目对你有帮助，请给个 Star！**
