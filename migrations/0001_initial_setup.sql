-- 域名管理数据库初始化
-- Migration: 创建基础表结构和默认设置

-- 域名信息表
CREATE TABLE IF NOT EXISTS domains (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    domain_name TEXT NOT NULL UNIQUE,          -- 域名
    registrar TEXT,                            -- 注册商
    registrar_url TEXT,                        -- 注册商 URL
    hosting_provider TEXT,                     -- 托管商
    hosting_url TEXT,                          -- 托管商 URL
    purchase_price REAL,                       -- 购买价格
    renewal_price REAL,                        -- 续费价格
    purchase_period TEXT,                      -- 购买周期（如"一年"、"三年"）
    renewal_period TEXT,                       -- 续费周期（如"一年"、"两年"）
    currency_symbol TEXT DEFAULT '¥',          -- 货币符号
    expire_date TEXT,                          -- 到期日期 (YYYY-MM-DD 格式，NULL表示无限期)
    notes TEXT,                                -- 备注
    created_at TEXT DEFAULT (datetime('now')), -- 创建时间
    updated_at TEXT DEFAULT (datetime('now'))  -- 更新时间
);

-- 站点设置表
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 初始化默认设置
INSERT OR IGNORE INTO settings (key, value) VALUES 
    ('site_name', '域名管理'),
    ('notify_days', '30,7'),                                      -- 提前通知天数，逗号分隔
    ('telegram_bot_token', ''),                                   -- Telegram Bot Token
    ('telegram_chat_id', ''),                                     -- Telegram Chat ID（接收通知的聊天 ID）
    ('telegram_notify_template', '⚠️ 域名到期提醒\n\n域名：{domain}\n注册商：{registrar}\n到期时间：{expire_date}\n剩余天数：{days_left}天'); -- 通知消息模板

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_domains_expire_date ON domains(expire_date);
CREATE INDEX IF NOT EXISTS idx_domains_domain_name ON domains(domain_name);
