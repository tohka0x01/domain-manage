/**
 * 域名管理系统 - Cloudflare Worker API
 * 处理域名CRUD操作和站点设置
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS 预检请求处理
    if (method === "OPTIONS") {
      return handleCORS();
    }

    try {
      // API 路由
      if (path.startsWith("/api/")) {
        const response = await handleAPI(request, env, path, method);
        return addCORSHeaders(response);
      }

      // 静态资源处理
      // 新版 wrangler [assets] 配置会自动处理静态资源
      // 如果 ASSETS 绑定存在则使用它，否则返回 404（静态资源由 assets 配置自动路由）
      if (env.ASSETS) {
        return env.ASSETS.fetch(request);
      }

      // 如果没有 ASSETS 绑定，说明静态资源由 wrangler 自动处理
      // 这里返回 404，wrangler 会在此之前拦截静态资源请求
      return new Response("Not Found", { status: 404 });
    } catch (error) {
      console.error("Worker Error:", error);
      return addCORSHeaders(
        new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        })
      );
    }
  },

  /**
   * Cron Trigger 处理器 - 每天 UTC 01:00 执行（北京时间 09:00）
   * 检查即将到期的域名并发送 Telegram 通知
   */
  async scheduled(event, env, ctx) {
    console.log("🔔 [CRON] 定时任务开始执行...", new Date().toISOString());

    try {
      // 检查并发送通知
      await checkAndSendNotifications(env);
      console.log("✅ [CRON] 定时任务执行完成");
    } catch (error) {
      console.error("❌ [CRON] 定时任务执行失败:", error);
      // 不抛出错误，避免影响后续定时任务
    }
  },
};

/**
 * 处理 CORS 预检请求
 */
function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}

/**
 * 为响应添加 CORS 头
 */
function addCORSHeaders(response) {
  const newResponse = new Response(response.body, response);
  newResponse.headers.set("Access-Control-Allow-Origin", "*");
  newResponse.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  newResponse.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return newResponse;
}

/**
 * API 路由处理
 */
async function handleAPI(request, env, path, method) {
  // 域名相关 API
  if (path === "/api/domains" && method === "GET") {
    return getDomains(env);
  }
  if (path === "/api/domains" && method === "POST") {
    return createDomain(request, env);
  }
  if (path.match(/^\/api\/domains\/\d+$/) && method === "GET") {
    const id = path.split("/").pop();
    return getDomain(env, id);
  }
  if (path.match(/^\/api\/domains\/\d+$/) && method === "PUT") {
    const id = path.split("/").pop();
    return updateDomain(request, env, id);
  }
  if (path.match(/^\/api\/domains\/\d+$/) && method === "DELETE") {
    const id = path.split("/").pop();
    return deleteDomain(env, id);
  }

  // 设置相关 API
  if (path === "/api/settings" && method === "GET") {
    return getSettings(env);
  }
  if (path === "/api/settings" && method === "PUT") {
    return updateSettings(request, env);
  }

  // 统计 API
  if (path === "/api/stats" && method === "GET") {
    return getStats(env);
  }

  // Telegram 测试 API
  if (path === "/api/test-telegram" && method === "POST") {
    return testTelegram(request);
  }

  // 访问密钥验证 API
  if (path === "/api/verify" && method === "POST") {
    return verifyAccessKey(request, env);
  }

  // 备份 API
  if (path === "/api/backup" && method === "GET") {
    return backupData(env);
  }

  // 导入 API
  if (path === "/api/import" && method === "POST") {
    return importData(request, env);
  }

  return new Response(JSON.stringify({ error: "Not Found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * 获取所有域名列表
 */
async function getDomains(env) {
  const { results } = await env.DB.prepare(
    "SELECT * FROM domains ORDER BY expire_date ASC NULLS LAST, domain_name ASC"
  ).all();

  return new Response(JSON.stringify({ data: results }), {
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * 获取单个域名
 */
async function getDomain(env, id) {
  const result = await env.DB.prepare("SELECT * FROM domains WHERE id = ?")
    .bind(id)
    .first();

  if (!result) {
    return new Response(JSON.stringify({ error: "域名不存在" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ data: result }), {
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * 创建新域名
 */
async function createDomain(request, env) {
  const body = await request.json();
  const {
    domain_name,
    registrar,
    registrar_url,
    hosting_provider,
    hosting_url,
    purchase_price,
    renewal_price,
    purchase_period,
    renewal_period,
    currency_symbol,
    expire_date,
    notes,
  } = body;

  console.log("🔍 [BACKEND DEBUG] 收到创建域名请求:", {
    domain_name,
    registrar,
    registrar_url,
    hosting_provider,
    hosting_url,
    purchase_price,
    renewal_price,
    currency_symbol,
    expire_date,
    notes,
  });

  if (!domain_name) {
    console.error("❌ [BACKEND DEBUG] 域名为空");
    return new Response(JSON.stringify({ error: "域名不能为空" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    console.log("🔍 [BACKEND DEBUG] 准备插入数据库...");
    const result = await env.DB.prepare(
      `INSERT INTO domains (domain_name, registrar, registrar_url, hosting_provider, hosting_url, purchase_price, renewal_price, purchase_period, renewal_period, currency_symbol, expire_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        domain_name,
        registrar || null,
        registrar_url || null,
        hosting_provider || null,
        hosting_url || null,
        purchase_price || null,
        renewal_price || null,
        purchase_period || null,
        renewal_period || null,
        currency_symbol || "¥",
        expire_date || null,
        notes || null
      )
      .run();

    console.log("✅ [BACKEND DEBUG] 插入成功, ID:", result.meta.last_row_id);
    console.log("🔍 [BACKEND DEBUG] 插入结果:", result);

    return new Response(
      JSON.stringify({
        message: "创建成功",
        data: { id: result.meta.last_row_id },
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ [BACKEND DEBUG] 数据库操作失败:", error);
    console.error("❌ [BACKEND DEBUG] 错误详情:", error.message);

    if (error.message.includes("UNIQUE constraint failed")) {
      return new Response(JSON.stringify({ error: "该域名已存在" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    throw error;
  }
}

/**
 * 更新域名信息
 */
async function updateDomain(request, env, id) {
  const body = await request.json();
  const {
    domain_name,
    registrar,
    registrar_url,
    hosting_provider,
    hosting_url,
    purchase_price,
    renewal_price,
    purchase_period,
    renewal_period,
    currency_symbol,
    expire_date,
    notes,
  } = body;

  if (!domain_name) {
    return new Response(JSON.stringify({ error: "域名不能为空" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const result = await env.DB.prepare(
      `UPDATE domains SET 
        domain_name = ?,
        registrar = ?,
        registrar_url = ?,
        hosting_provider = ?,
        hosting_url = ?,
        purchase_price = ?,
        renewal_price = ?,
        purchase_period = ?,
        renewal_period = ?,
        currency_symbol = ?,
        expire_date = ?,
        notes = ?,
        updated_at = datetime('now')
       WHERE id = ?`
    )
      .bind(
        domain_name,
        registrar || null,
        registrar_url || null,
        hosting_provider || null,
        hosting_url || null,
        purchase_price || null,
        renewal_price || null,
        purchase_period || null,
        renewal_period || null,
        currency_symbol || "¥",
        expire_date || null,
        notes || null,
        id
      )
      .run();

    if (result.meta.changes === 0) {
      return new Response(JSON.stringify({ error: "域名不存在" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ message: "更新成功" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error.message.includes("UNIQUE constraint failed")) {
      return new Response(JSON.stringify({ error: "该域名已存在" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    throw error;
  }
}

/**
 * 删除域名
 */
async function deleteDomain(env, id) {
  const result = await env.DB.prepare("DELETE FROM domains WHERE id = ?")
    .bind(id)
    .run();

  if (result.meta.changes === 0) {
    return new Response(JSON.stringify({ error: "域名不存在" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ message: "删除成功" }), {
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * 获取站点设置
 */
async function getSettings(env) {
  const { results } = await env.DB.prepare(
    "SELECT key, value FROM settings"
  ).all();

  const settings = {};
  results.forEach((row) => {
    settings[row.key] = row.value;
  });

  return new Response(JSON.stringify({ data: settings }), {
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * 更新站点设置
 */
async function updateSettings(request, env) {
  const body = await request.json();

  for (const [key, value] of Object.entries(body)) {
    await env.DB.prepare(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime('now')`
    )
      .bind(key, value, value)
      .run();
  }

  return new Response(JSON.stringify({ message: "设置已保存" }), {
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * 获取统计信息
 */
async function getStats(env) {
  const today = new Date().toISOString().split("T")[0];
  const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  // 总域名数
  const totalResult = await env.DB.prepare(
    "SELECT COUNT(*) as count FROM domains"
  ).first();

  // 已过期
  const expiredResult = await env.DB.prepare(
    "SELECT COUNT(*) as count FROM domains WHERE expire_date < ? AND expire_date IS NOT NULL"
  )
    .bind(today)
    .first();

  // 7天内到期
  const expiring7Result = await env.DB.prepare(
    "SELECT COUNT(*) as count FROM domains WHERE expire_date >= ? AND expire_date <= ? AND expire_date IS NOT NULL"
  )
    .bind(today, in7Days)
    .first();

  // 30天内到期
  const expiring30Result = await env.DB.prepare(
    "SELECT COUNT(*) as count FROM domains WHERE expire_date >= ? AND expire_date <= ? AND expire_date IS NOT NULL"
  )
    .bind(today, in30Days)
    .first();

  return new Response(
    JSON.stringify({
      data: {
        total: totalResult.count,
        expired: expiredResult.count,
        expiring_7_days: expiring7Result.count,
        expiring_30_days: expiring30Result.count,
      },
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}

/**
 * 测试 Telegram Bot 连接
 */
async function testTelegram(request) {
  try {
    const { token, chatId } = await request.json();

    if (!token) {
      return new Response(JSON.stringify({ error: "缺少 Bot Token" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 获取 Bot 信息验证 Token 有效性
    const botInfoUrl = `https://api.telegram.org/bot${token}/getMe`;
    const botInfoResponse = await fetch(botInfoUrl);
    const botInfo = await botInfoResponse.json();

    if (!botInfo.ok) {
      return new Response(JSON.stringify({ error: "无效的 Bot Token" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 如果提供了 chatId，发送测试消息
    if (chatId && chatId.trim()) {
      const testMessage = `✅ 测试消息\n\nBot 连接成功！\n\n📱 Bot 名称: @${
        botInfo.result.username
      }\n⏰ 测试时间: ${new Date().toLocaleString("zh-CN", {
        timeZone: "Asia/Shanghai",
      })}`;

      const sendMessageUrl = `https://api.telegram.org/bot${token}/sendMessage`;
      const sendResponse = await fetch(sendMessageUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: testMessage,
          parse_mode: "HTML",
        }),
      });

      const sendResult = await sendResponse.json();

      if (!sendResult.ok) {
        return new Response(
          JSON.stringify({
            error: `发送测试消息失败: ${sendResult.description || "未知错误"}`,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `✅ 测试消息已发送！Bot 名称：@${botInfo.result.username}`,
          botInfo: botInfo.result,
          messageSent: true,
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 没有 chatId，只验证 Token
    return new Response(
      JSON.stringify({
        success: true,
        message: `Bot 连接成功！Bot 名称：@${botInfo.result.username}\n\n💡 提示：填写 Chat ID 后可发送测试消息`,
        botInfo: botInfo.result,
        messageSent: false,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Telegram 测试失败:", error);
    return new Response(
      JSON.stringify({ error: "测试失败: " + error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * 检查即将到期的域名并发送通知
 */
async function checkAndSendNotifications(env) {
  console.log("📋 [NOTIFY] 开始检查即将到期的域名...");

  // 1. 获取设置
  const settingsResult = await env.DB.prepare(
    "SELECT key, value FROM settings"
  ).all();

  const settings = {};
  settingsResult.results.forEach((row) => {
    settings[row.key] = row.value;
  });

  // 检查必要配置
  const telegramToken = settings.telegram_bot_token;
  const telegramChatId = settings.telegram_chat_id;
  const notifyDaysStr = settings.notify_days || "30,7";

  if (!telegramToken || !telegramChatId) {
    console.log("⚠️  [NOTIFY] Telegram 未配置，跳过通知");
    return;
  }

  // 解析通知天数
  const notifyDays = notifyDaysStr.split(",").map((d) => parseInt(d.trim()));
  console.log(`📅 [NOTIFY] 通知周期: ${notifyDays.join(", ")} 天`);

  // 2. 获取即将到期的域名
  const expiringDomains = await getExpiringDomains(env.DB, notifyDays);

  if (expiringDomains.length === 0) {
    console.log("✅ [NOTIFY] 没有需要通知的域名");
    return;
  }

  console.log(`🔔 [NOTIFY] 找到 ${expiringDomains.length} 个需要通知的域名`);

  // 3. 发送通知
  let successCount = 0;
  let failCount = 0;

  for (const domain of expiringDomains) {
    try {
      await sendTelegramNotification(
        telegramToken,
        telegramChatId,
        domain,
        settings.telegram_notify_template
      );
      successCount++;
      console.log(`✅ [NOTIFY] 已发送通知: ${domain.domain_name}`);
    } catch (error) {
      failCount++;
      console.error(
        `❌ [NOTIFY] 发送失败: ${domain.domain_name}`,
        error.message
      );
    }

    // 短暂延迟，避免触发 Telegram API 限流
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log(
    `📊 [NOTIFY] 通知发送完成 - 成功: ${successCount}, 失败: ${failCount}`
  );
}

/**
 * 获取即将到期的域名
 * @param {D1Database} db - 数据库连接
 * @param {number[]} notifyDays - 通知天数数组，如 [30, 7]
 * @returns {Promise<Array>} 需要通知的域名列表
 */
async function getExpiringDomains(db, notifyDays) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const domains = [];

  for (const days of notifyDays) {
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + days);
    const targetDateStr = targetDate.toISOString().split("T")[0];

    // 查询在目标日期到期的域名
    const result = await db
      .prepare(
        `SELECT * FROM domains 
         WHERE expire_date = ? 
         AND expire_date IS NOT NULL
         ORDER BY domain_name ASC`
      )
      .bind(targetDateStr)
      .all();

    if (result.results.length > 0) {
      // 添加剩余天数信息
      result.results.forEach((domain) => {
        domains.push({
          ...domain,
          days_left: days,
        });
      });
    }
  }

  return domains;
}

/**
 * 发送 Telegram 通知
 * @param {string} token - Telegram Bot Token
 * @param {string} chatId - 接收消息的 Chat ID
 * @param {object} domain - 域名信息
 * @param {string} template - 消息模板
 */
async function sendTelegramNotification(token, chatId, domain, template) {
  // 格式化消息
  const message = formatNotificationMessage(domain, template);

  // 发送到 Telegram
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Telegram API 错误: ${error}`);
  }

  return await response.json();
}

/**
 * 格式化通知消息
 * @param {object} domain - 域名信息
 * @param {string} template - 消息模板
 * @returns {string} 格式化后的消息
 */
function formatNotificationMessage(domain, template) {
  // 默认模板
  const defaultTemplate = `⚠️ 域名到期提醒

域名：{domain}
注册商：{registrar}
到期时间：{expire_date}
剩余天数：{days_left}天`;

  const messageTemplate = template || defaultTemplate;

  // 替换模板变量
  return messageTemplate
    .replace("{domain}", domain.domain_name || "未知")
    .replace("{registrar}", domain.registrar || "未知")
    .replace("{hosting}", domain.hosting_provider || "未知")
    .replace("{expire_date}", domain.expire_date || "未知")
    .replace("{days_left}", domain.days_left || "未知")
    .replace("{purchase_price}", domain.purchase_price || "未知")
    .replace("{renewal_price}", domain.renewal_price || "未知");
}

/**
 * 验证访问密钥
 * 验证用户提供的密钥是否与环境变量中配置的密钥一致
 */
async function verifyAccessKey(request, env) {
  try {
    const { accessKey } = await request.json();

    // 检查环境变量中是否配置了访问密钥
    if (!env.ACCESS_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "服务器未配置访问密钥",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 验证密钥是否匹配
    if (accessKey === env.ACCESS_KEY) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "验证成功",
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: "访问密钥错误",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "请求格式错误",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * 备份所有数据（设置 + 域名列表）
 */
async function backupData(env) {
  try {
    // 获取所有域名
    const { results: domains } = await env.DB.prepare(
      "SELECT * FROM domains ORDER BY domain_name ASC"
    ).all();

    // 获取所有设置
    const { results: settingsRows } = await env.DB.prepare(
      "SELECT key, value FROM settings"
    ).all();

    // 转换设置为对象格式
    const settings = {};
    settingsRows.forEach((row) => {
      settings[row.key] = row.value;
    });

    // 构建备份数据
    const backupData = {
      version: "1.0",
      exportTime: new Date().toISOString(),
      data: {
        settings,
        domains,
      },
    };

    return new Response(JSON.stringify(backupData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="domain-backup-${
          new Date().toISOString().split("T")[0]
        }.json"`,
      },
    });
  } catch (error) {
    console.error("导入失败:", error);
    return new Response(
      JSON.stringify({ error: "导入失败: " + error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * 导入数据（恢复设置 + 域名列表）
 */
async function importData(request, env) {
  try {
    const body = await request.json();

    // 验证数据格式
    if (!body.data || !body.data.settings || !body.data.domains) {
      return new Response(JSON.stringify({ error: "无效的备份文件格式" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { settings, domains } = body.data;

    // 开始事务性操作
    // 1. 清空现有数据
    await env.DB.prepare("DELETE FROM domains").run();
    await env.DB.prepare("DELETE FROM settings").run();

    // 2. 导入设置
    for (const [key, value] of Object.entries(settings)) {
      await env.DB.prepare("INSERT INTO settings (key, value) VALUES (?, ?)")
        .bind(key, value)
        .run();
    }

    // 3. 导入域名
    for (const domain of domains) {
      await env.DB.prepare(
        `INSERT INTO domains (
          domain_name, registrar, registrar_url, hosting_provider, hosting_url,
          purchase_price, renewal_price, purchase_period, renewal_period,
          currency_symbol, expire_date, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          domain.domain_name,
          domain.registrar || null,
          domain.registrar_url || null,
          domain.hosting_provider || null,
          domain.hosting_url || null,
          domain.purchase_price || null,
          domain.renewal_price || null,
          domain.purchase_period || null,
          domain.renewal_period || null,
          domain.currency_symbol || "¥",
          domain.expire_date || null,
          domain.notes || null,
          domain.created_at || null,
          domain.updated_at || null
        )
        .run();
    }

    return new Response(
      JSON.stringify({
        message: "导入成功",
        imported: {
          settings: Object.keys(settings).length,
          domains: domains.length,
        },
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("导入失败:", error);
    return new Response(
      JSON.stringify({ error: "导入失败: " + error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
