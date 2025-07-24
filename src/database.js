// 数据库模块 - 封装SQLite操作
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// 数据库文件路径
const DB_PATH = path.join(process.env.APPDATA || process.env.HOME, 'DevLauncher', 'data.db');

// 确保数据库目录存在
function ensureDbDirExists() {
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
}

// 数据库连接实例
let db = null;

// 初始化数据库
function initDatabase() {
  ensureDbDirExists();
  
  // 创建或连接到数据库
  db = new Database(DB_PATH);
  
  // 启用外键约束
  db.pragma('foreign_keys = ON');
  
  // 创建工具表
  db.exec(`
    CREATE TABLE IF NOT EXISTS tools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      path TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // 创建配置表
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  return db;
}

// 获取数据库连接
function getDb() {
  if (!db) {
    initDatabase();
  }
  return db;
}

// 关闭数据库连接
function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

// 工具相关操作
const toolsRepository = {
  // 获取所有工具
  getAllTools() {
    const db = getDb();
    return db.prepare('SELECT * FROM tools ORDER BY name').all();
  },
  
  // 获取单个工具
  getToolByName(name) {
    const db = getDb();
    return db.prepare('SELECT * FROM tools WHERE name = ?').get(name);
  },
  
  // 添加工具
  addTool(name, path) {
    const db = getDb();
    const stmt = db.prepare('INSERT INTO tools (name, path) VALUES (?, ?)');
    return stmt.run(name, path);
  },
  
  // 更新工具
  updateTool(name, path) {
    const db = getDb();
    const stmt = db.prepare(`
      UPDATE tools 
      SET path = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE name = ?
    `);
    return stmt.run(path, name);
  },
  
  // 删除工具
  deleteTool(name) {
    const db = getDb();
    const stmt = db.prepare('DELETE FROM tools WHERE name = ?');
    return stmt.run(name);
  },
  
  // 保存或更新工具（如果存在则更新，不存在则添加）
  saveTool(name, path) {
    const existing = this.getToolByName(name);
    if (existing) {
      return this.updateTool(name, path);
    } else {
      return this.addTool(name, path);
    }
  }
};

// 设置相关操作
const settingsRepository = {
  // 获取设置值
  getSetting(key, defaultValue = null) {
    const db = getDb();
    const result = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
    return result ? result.value : defaultValue;
  },
  
  // 保存设置值
  saveSetting(key, value) {
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET 
        value = excluded.value,
        updated_at = CURRENT_TIMESTAMP
    `);
    return stmt.run(key, value);
  },
  
  // 删除设置
  deleteSetting(key) {
    const db = getDb();
    const stmt = db.prepare('DELETE FROM settings WHERE key = ?');
    return stmt.run(key);
  }
};

// 导入默认工具数据
function importDefaultTools(defaultTools) {
  const db = getDb();
  
  // 开始事务
  const importTransaction = db.transaction((tools) => {
    const insertStmt = db.prepare('INSERT OR IGNORE INTO tools (name, path) VALUES (?, ?)');
    
    for (const tool of tools) {
      insertStmt.run(tool.name, tool.path);
    }
  });
  
  // 执行事务
  importTransaction(defaultTools);
}

module.exports = {
  initDatabase,
  getDb,
  closeDb,
  toolsRepository,
  settingsRepository,
  importDefaultTools
};