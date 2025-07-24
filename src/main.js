// 导入模块（CommonJS语法）
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const yaml = require('js-yaml');

// 配置文件路径
const CONFIG_PATH = path.join(__dirname, 'tools.json');
const DEFAULT_PATHS = {
    elasticsearch: path.join('D:', 'ATools', 'elasticsearch-7.17.22-windows-x86_64', 'elasticsearch-7.17.22', 'bin', 'elasticsearch.bat'),
    kibana: path.join('D:', 'ATools', 'elasticsearch-7.17.22-windows-x86_64', 'kibana-7.17.22-windows-x86_64', 'bin', 'kibana.bat')
};

let mainWindow;
let logProcess = null;
let currentLogType = null;

// 初始化工具配置文件
function initConfig() {
    if (!fs.existsSync(CONFIG_PATH)) {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify({
            tools: [
                {
                    name: 'Elasticsearch',
                    path: DEFAULT_PATHS.elasticsearch
                },
                {
                    name: 'Kibana',
                    path: DEFAULT_PATHS.kibana
                }
            ]
        }, null, 2));
    }
}

// 获取工具列表
function getTools() {
    const data = JSON.parse(fs.readFileSync(CONFIG_PATH));
    // 确保默认路径存在
    if (!data.tools.some(t => t.name === 'Elasticsearch')) {
        data.tools.push({
            name: 'Elasticsearch',
            path: DEFAULT_PATHS.elasticsearch
        });
    }
    if (!data.tools.some(t => t.name === 'Kibana')) {
        data.tools.push({
            name: 'Kibana',
            path: DEFAULT_PATHS.kibana
        });
    }
    return data.tools;
}

// 保存工具列表
function saveTools(tools) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify({ tools }, null, 2));
}

// 检查端口是否在使用
function checkPort(port) {
    return new Promise((resolve) => {
        const socket = require('net').createConnection(port, '127.0.0.1');
        socket.on('connect', () => {
            socket.end();
            resolve(true);
        });
        socket.on('error', () => resolve(false));
    });
}

// 启动服务
function startService(serviceName) {
    return new Promise((resolve, reject) => {
        const tools = getTools();
        let servicePath;
        
        if (serviceName === 'elasticsearch' || serviceName === 'kibana') {
            servicePath = DEFAULT_PATHS[serviceName];
        } else {
            const tool = tools.find(t => t.name === serviceName);
            if (!tool) {
                reject(new Error(`未找到 ${serviceName} 的路径配置`));
                return;
            }
            servicePath = tool.path;
        }

        exec(`start "" "${servicePath}"`, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

// 停止服务
function stopService(serviceName) {
    return new Promise((resolve) => {
        let processName;
        if (serviceName === 'elasticsearch') {
            processName = 'java.exe';
        } else if (serviceName === 'kibana') {
            processName = 'node.exe';
        } else {
            // 对于其他工具，尝试从路径获取进程名
            const tools = getTools();
            const tool = tools.find(t => t.name === serviceName);
            if (tool) {
                processName = path.basename(tool.path);
            } else {
                processName = '';
            }
        }

        if (processName) {
            exec(`taskkill /IM "${processName}" /F`, () => {
                resolve();
            });
        } else {
            resolve();
        }
    });
}

// 获取配置文件路径
function getConfigPath(serviceName) {
    const tools = getTools();
    const basePath = path.dirname(path.dirname(
        serviceName === 'elasticsearch' 
            ? DEFAULT_PATHS.elasticsearch 
            : DEFAULT_PATHS.kibana
    ));
    
    return path.join(basePath, 'config', 
        serviceName === 'elasticsearch' ? 'elasticsearch.yml' : 'kibana.yml');
}

// 读取配置文件
function readConfig(serviceName) {
    try {
        const configPath = getConfigPath(serviceName);
        return fs.readFileSync(configPath, 'utf8');
    } catch (error) {
        console.error(`读取 ${serviceName} 配置失败:`, error);
        return '';
    }
}

// 保存配置文件
function saveConfig(serviceName, content) {
    try {
        const configPath = getConfigPath(serviceName);
        fs.writeFileSync(configPath, content);
        return true;
    } catch (error) {
        console.error(`保存 ${serviceName} 配置失败:`, error);
        return false;
    }
}

// 监听日志
function startLogListener(logType, window) {
    stopLogListener();
    
    const tools = getTools();
    let logPath;
    
    if (logType === 'elasticsearch') {
        const basePath = path.dirname(path.dirname(DEFAULT_PATHS.elasticsearch));
        logPath = path.join(basePath, 'logs', 'elasticsearch.log');
    } else if (logType === 'kibana') {
        const basePath = path.dirname(path.dirname(DEFAULT_PATHS.kibana));
        logPath = path.join(basePath, 'logs', 'kibana.log');
    }
    
    if (!fs.existsSync(logPath)) {
        window.webContents.send('notification', {
            message: `日志文件不存在: ${logPath}`,
            isError: true
        });
        return;
    }

    currentLogType = logType;
    logProcess = spawn('powershell', [
        '-Command',
        `Get-Content -Path "${logPath}" -Wait -Tail 100`
    ]);

    logProcess.stdout.on('data', (data) => {
        window.webContents.send('log-output', data.toString());
    });

    logProcess.stderr.on('data', (data) => {
        console.error(`日志错误: ${data}`);
    });

    logProcess.on('close', () => {
        logProcess = null;
    });
}

// 停止日志监听
function stopLogListener() {
    if (logProcess) {
        logProcess.kill();
        logProcess = null;
    }
}

// 创建主窗口
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            //preload: path.join(__dirname, 'preload.js'),
        },
        icon: path.join(__dirname, 'assets', 'icon.png')
    });

    mainWindow.loadFile('index.html');

    // 开发工具
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// 检查所有服务状态
async function checkAllServices() {
    if (!mainWindow) return;
    
    const isESRunning = await checkPort(9200);
    const isKibanaRunning = await checkPort(5601);
    
    mainWindow.webContents.send('service-status', { 
        service: 'es', 
        isRunning: isESRunning 
    });
    
    mainWindow.webContents.send('service-status', { 
        service: 'kibana', 
        isRunning: isKibanaRunning 
    });
}

// 应用准备就绪
app.whenReady().then(() => {
    initConfig();
    createWindow();

    // 定期检查服务状态
    setInterval(checkAllServices, 5000);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    app.on('window-all-closed', () => {
        if(process.platform !== 'darwin') {
            app.quit()
        }
    })
});

// 应用关闭
app.on('window-all-closed', () => {
    stopLogListener();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC通信处理
// 获取工具列表
ipcMain.handle('get-tools', () => {
    return getTools();
});

// 加载配置
ipcMain.handle('load-config', async (event, configName) => {
    try {
        const configPath = getConfigPath(configName);
        const content = readConfig(configName);
        return {
            success: true,
            path: configPath,
            content
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
});

// 检查端口状态
ipcMain.handle('check-port', async (event, port) => {
    return await checkPort(port);
});

// 启动服务
ipcMain.handle('start-service', async (event, serviceName) => {
    try {
        await startService(serviceName);
        // 启动后等待一段时间再检查状态
        setTimeout(() => {
            checkAllServices();
        }, 3000);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// 停止服务
ipcMain.handle('stop-service', async (event, serviceName) => {
    try {
        await stopService(serviceName);
        // 停止后立即检查状态
        setTimeout(() => {
            checkAllServices();
        }, 1000);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// 启动日志监控
ipcMain.handle('start-log', async (event, serviceName) => {
    try {
        if (mainWindow) {
            startLogListener(serviceName, mainWindow);
        }
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.on('start-all-services', async () => {
    try {
        await startService('elasticsearch');
        await new Promise(resolve => setTimeout(resolve, 10000)); // 等待10秒
        await startService('kibana');
        checkAllServices();
        mainWindow.webContents.send('notification', {
            message: '所有服务启动成功',
            isError: false
        });
    } catch (error) {
        mainWindow.webContents.send('notification', {
            message: `启动失败: ${error.message}`,
            isError: true
        });
    }
});

ipcMain.on('stop-all-services', async () => {
    try {
        await stopService('elasticsearch');
        await stopService('kibana');
        checkAllServices();
        mainWindow.webContents.send('notification', {
            message: '所有服务已停止',
            isError: false
        });
    } catch (error) {
        mainWindow.webContents.send('notification', {
            message: `停止失败: ${error.message}`,
            isError: true
        });
    }
});

ipcMain.on('start-service', async (event, serviceName) => {
    try {
        await startService(serviceName);
        if (serviceName === 'elasticsearch') {
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
        checkAllServices();
        mainWindow.webContents.send('notification', {
            message: `${serviceName} 启动成功`,
            isError: false
        });
    } catch (error) {
        mainWindow.webContents.send('notification', {
            message: `${serviceName} 启动失败: ${error.message}`,
            isError: true
        });
    }
});

ipcMain.on('refresh-status', () => {
    checkAllServices();
});

ipcMain.on('load-tools', (event) => {
    event.sender.send('tool-list', getTools());
});

ipcMain.on('add-tool', (event, tool) => {
    try {
        const tools = getTools();
        const existingIndex = tools.findIndex(t => t.name === tool.name);
        
        if (existingIndex >= 0) {
            // 更新现有工具
            tools[existingIndex] = tool;
        } else {
            // 添加新工具
            tools.push(tool);
        }
        
        saveTools(tools);
        event.sender.send('tool-list', tools);
        mainWindow.webContents.send('notification', {
            message: `工具 ${tool.name} 已保存`,
            isError: false
        });
    } catch (error) {
        mainWindow.webContents.send('notification', {
            message: `保存工具失败: ${error.message}`,
            isError: true
        });
    }
});

ipcMain.on('edit-tool', (event, toolName) => {
    const tools = getTools();
    const tool = tools.find(t => t.name === toolName);
    if (tool) {
        event.sender.send('edit-tool-data', tool);
    }
});

ipcMain.on('delete-tool', (event, toolName) => {
    try {
        const tools = getTools();
        const filteredTools = tools.filter(t => t.name !== toolName);
        
        // 不允许删除默认工具
        if (toolName === 'Elasticsearch' || toolName === 'Kibana') {
            mainWindow.webContents.send('notification', {
                message: '不能删除默认工具',
                isError: true
            });
            return;
        }
        
        saveTools(filteredTools);
        event.sender.send('tool-list', filteredTools);
        mainWindow.webContents.send('notification', {
            message: `工具 ${toolName} 已删除`,
            isError: false
        });
    } catch (error) {
        mainWindow.webContents.send('notification', {
            message: `删除工具失败: ${error.message}`,
            isError: true
        });
    }
});

ipcMain.on('start-tool', (event, toolName) => {
    startService(toolName).catch(error => {
        mainWindow.webContents.send('notification', {
            message: `启动 ${toolName} 失败: ${error.message}`,
            isError: true
        });
    });
});

ipcMain.on('load-config', (event, configType) => {
    try {
        const content = readConfig(configType);
        event.sender.send('config-content', content);
    } catch (error) {
        mainWindow.webContents.send('notification', {
            message: `加载配置失败: ${error.message}`,
            isError: true
        });
    }
});

ipcMain.on('save-config', (event, { configType, content }) => {
    try {
        const success = saveConfig(configType, content);
        if (success) {
            mainWindow.webContents.send('notification', {
                message: `${configType} 配置保存成功`,
                isError: false
            });
        } else {
            mainWindow.webContents.send('notification', {
                message: `${configType} 配置保存失败`,
                isError: true
            });
        }
    } catch (error) {
        mainWindow.webContents.send('notification', {
            message: `保存配置失败: ${error.message}`,
            isError: true
        });
    }
});

ipcMain.on('start-logs', (event, logType) => {
    if (mainWindow) {
        startLogListener(logType, mainWindow);
    }
});

ipcMain.on('stop-logs', () => {
    stopLogListener();
});

ipcMain.on('open-file-dialog', async (event) => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
            { name: '可执行文件', extensions: ['exe', 'bat', 'cmd'] },
            { name: '所有文件', extensions: ['*'] }
        ]
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
        event.sender.send('selected-file', result.filePaths[0]);
    }
});