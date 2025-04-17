// ================ 1. DOM操作辅助函数 ================
class DOMHelper {
    // 创建元素（工厂方法）
    static createElement(tag, options = {}) {
      const element = document.createElement(tag);
      Object.entries(options).forEach(([key, value]) => {
        if (key === 'class') {
          element.classList.add(...value.split(' '));
        } else if (key === 'text') {
          element.textContent = value;
        } else {
          element.setAttribute(key, value);
        }
      });
      return element;
    }
  
    // 安全插入HTML（防止XSS）
    static safeHTML(parent, position, html) {
      const template = document.createElement('template');
      template.innerHTML = html;
      parent.insertAdjacentElement(position, template.content.cloneNode(true));
    }
  }
  
  // ================ 2. 工具管理类 ================
  class ToolManager {
    constructor() {
      this.tools = [];
      this.initEventListeners();
      this.loadTools();
    }
  
    // 初始化事件监听（事件委托）
    initEventListeners() {
      document.getElementById('tool-list').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
  
        const toolName = btn.dataset.tool;
        const tool = this.tools.find(t => t.name === toolName);
        if (!tool) return;
  
        switch (btn.dataset.action) {
          case 'start':
            this.startTool(tool);
            break;
          case 'edit':
            this.showEditDialog(tool);
            break;
          case 'delete':
            this.deleteTool(tool);
            break;
        }
      });
    }
  
    // 加载工具列表（异步请求）
    async loadTools() {
      try {
        const { ipcRenderer } = require('electron');
        const tools = await ipcRenderer.invoke('get-tools');
        
        // 使用数组map方法转换数据
        this.tools = tools.map(tool => ({
          ...tool,
          isRunning: false
        }));
        
        this.renderToolList();
      } catch (err) {
        this.showError(err.message);
      }
    }
  
    // 渲染工具列表（DOM操作优化）
    renderToolList() {
      const container = document.getElementById('tool-list');
      container.innerHTML = ''; // 清空现有内容
      
      // 使用文档片段减少重绘
      const fragment = document.createDocumentFragment();
      
      this.tools.forEach(tool => {
        const item = DOMHelper.createElement('div', {
          class: 'tool-item',
          'data-tool': tool.name
        });
        
        item.innerHTML = `
          <div class="tool-info">
            <h3>${tool.name}</h3>
            <p>${tool.path}</p>
            <span class="status ${tool.isRunning ? 'running' : 'stopped'}">
              ${tool.isRunning ? '运行中' : '已停止'}
            </span>
          </div>
          <div class="tool-actions">
            <button data-action="start">启动</button>
            <button data-action="edit">编辑</button>
            <button data-action="delete" class="danger">删除</button>
          </div>
        `;
        
        fragment.appendChild(item);
      });
      
      container.appendChild(fragment);
    }
  
    // 启动工具（Promise链）
    async startTool(tool) {
      try {
        const { ipcRenderer } = require('electron');
        const result = await ipcRenderer.invoke('start-service', tool.name);
        
        if (result.success) {
          tool.isRunning = result.isRunning;
          this.renderToolList();
          this.showNotification(`${tool.name} 启动成功`);
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        this.showError(err.message);
      }
    }
  
    // 显示编辑对话框（模态框管理）
    showEditDialog(tool) {
      const dialog = document.getElementById('edit-dialog');
      dialog.querySelector('#edit-name').value = tool.name;
      dialog.querySelector('#edit-path').value = tool.path;
      dialog.dataset.tool = tool.name;
      dialog.style.display = 'block';
    }
  
    // 删除工具（确认对话框）
    async deleteTool(tool) {
      if (!confirm(`确定要删除 ${tool.name} 吗？`)) return;
      
      try {
        const { ipcRenderer } = require('electron');
        await ipcRenderer.invoke('delete-tool', tool.name);
        this.tools = this.tools.filter(t => t.name !== tool.name);
        this.renderToolList();
        this.showNotification(`${tool.name} 已删除`);
      } catch (err) {
        this.showError(err.message);
      }
    }
  
    // 显示通知（DOM操作）
    showNotification(message, isError = false) {
      const notification = DOMHelper.createElement('div', {
        class: `notification ${isError ? 'error' : 'success'}`
      });
      notification.textContent = message;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.add('fade-out');
        notification.addEventListener('transitionend', () => {
          notification.remove();
        });
      }, 3000);
    }
  
    showError(message) {
      this.showNotification(message, true);
    }
  }
  
  // ================ 3. 服务状态监控 ================
  class ServiceMonitor {
    constructor() {
      this.status = {
        elasticsearch: false,
        kibana: false
      };
      this.init();
    }
  
    // 初始化状态监听
    init() {
      const { ipcRenderer } = require('electron');
      
      // IPC事件监听
      ipcRenderer.on('service-status', (event, status) => {
        this.status = status;
        this.updateUI();
      });
      
      // 手动刷新按钮
      document.getElementById('refresh-status').addEventListener('click', () => {
        ipcRenderer.send('refresh-status');
      });
      
      // 初始状态获取
      this.checkAllStatus();
    }
  
    // 检查所有服务状态
    async checkAllStatus() {
      try {
        const { ipcRenderer } = require('electron');
        const [esResult, kibanaResult] = await Promise.all([
          ipcRenderer.invoke('check-status', 'Elasticsearch'),
          ipcRenderer.invoke('check-status', 'Kibana')
        ]);
        
        this.status = {
          elasticsearch: esResult.isRunning,
          kibana: kibanaResult.isRunning
        };
        this.updateUI();
      } catch (err) {
        console.error('状态检查失败:', err);
      }
    }
  
    // 更新UI显示
    updateUI() {
      Object.entries(this.status).forEach(([service, isRunning]) => {
        const element = document.getElementById(`${service}-status`);
        if (element) {
          element.textContent = isRunning ? '运行中' : '已停止';
          element.className = `status ${isRunning ? 'running' : 'stopped'}`;
        }
      });
    }
  }
  
  // ================ 4. 日志查看器 ================
  class LogViewer {
    constructor() {
      this.currentLog = null;
      this.isWatching = false;
      this.init();
    }
  
    init() {
      const { ipcRenderer } = require('electron');
      
      // 日志数据接收
      ipcRenderer.on('log-data', (event, { name, data }) => {
        if (name === this.currentLog) {
          this.appendLog(data);
        }
      });
      
      // 控制按钮事件
      document.getElementById('start-log-btn').addEventListener('click', () => {
        const logType = document.getElementById('log-selector').value;
        this.startWatching(logType);
      });
      
      document.getElementById('stop-log-btn').addEventListener('click', () => {
        this.stopWatching();
      });
      
      document.getElementById('clear-log-btn').addEventListener('click', () => {
        this.clearLogs();
      });
    }
  
    // 开始监听日志
    async startWatching(logType) {
      if (this.isWatching) {
        this.stopWatching();
      }
      
      try {
        const { ipcRenderer } = require('electron');
        const result = await ipcRenderer.invoke('start-logs', logType);
        
        if (result.success) {
          this.currentLog = logType;
          this.isWatching = true;
          document.getElementById('log-status').textContent = '监听中...';
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        console.error('日志监听失败:', err);
        document.getElementById('log-status').textContent = '监听失败';
      }
    }
  
    // 停止监听
    async stopWatching() {
      const { ipcRenderer } = require('electron');
      await ipcRenderer.invoke('stop-logs');
      this.isWatching = false;
      document.getElementById('log-status').textContent = '已停止';
    }
  
    // 追加日志内容
    appendLog(data) {
      const logContainer = document.getElementById('log-container');
      logContainer.textContent += data;
      
      // 自动滚动到底部
      logContainer.scrollTop = logContainer.scrollHeight;
    }
  
    // 清空日志
    clearLogs() {
      document.getElementById('log-container').textContent = '';
    }
  }
  
  // ================ 5. 初始化应用 ================
  document.addEventListener('DOMContentLoaded', () => {
    // 初始化所有模块
    new ToolManager();
    new ServiceMonitor();
    new LogViewer();
  
    // 配置编辑对话框事件
    const editDialog = document.getElementById('edit-dialog');
    editDialog.querySelector('.save-btn').addEventListener('click', async () => {
      const name = editDialog.querySelector('#edit-name').value;
      const path = editDialog.querySelector('#edit-path').value;
      
      try {
        const { ipcRenderer } = require('electron');
        await ipcRenderer.invoke('update-tool', {
          name: editDialog.dataset.tool,
          newPath: path
        });
        
        editDialog.style.display = 'none';
        location.reload(); // 简单刷新页面更新列表
      } catch (err) {
        alert(`更新失败: ${err.message}`);
      }
    });
  
    editDialog.querySelector('.cancel-btn').addEventListener('click', () => {
      editDialog.style.display = 'none';
    });
  
    // 浏览文件按钮
    document.getElementById('browse-path-btn').addEventListener('click', async () => {
      const { ipcRenderer } = require('electron');
      const path = await ipcRenderer.invoke('open-file-dialog');
      if (path) {
        document.getElementById('new-tool-path').value = path;
      }
    });
  });