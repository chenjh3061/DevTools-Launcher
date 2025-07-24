/**
 * 首页组件
 */

function createHomePage() {
  const container = document.createElement('div');
  container.className = 'page home-page';
  
  container.innerHTML = `
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h1 class="welcome-title">DevTools Launcher Pro</h1>
        <p class="welcome-subtitle">专业的开发工具管理平台，让您的开发环境管理更加高效</p>
      </div>
      <div class="welcome-stats">
        <div class="stat-card">
          <div class="stat-number" id="total-tools">0</div>
          <div class="stat-label">已配置工具</div>
        </div>
        <div class="stat-card">
          <div class="stat-number" id="running-services">0</div>
          <div class="stat-label">运行中服务</div>
        </div>
      </div>
    </div>

    <!-- 服务状态面板 -->
    <div class="services-panel">
      <div class="panel-header">
        <h3>服务状态</h3>
        <button class="refresh-btn" id="refresh-services">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          刷新
        </button>
      </div>
      <div class="services-grid">
        <div class="service-card" data-service="elasticsearch">
          <div class="service-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M8 12h8" stroke="currentColor" stroke-width="2"/>
              <path d="M12 8v8" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="service-info">
            <h4>Elasticsearch</h4>
            <p>搜索引擎服务</p>
            <div class="service-status">
              <span class="status-indicator" id="es-indicator"></span>
              <span class="status-text" id="es-status-text">检查中...</span>
            </div>
          </div>
          <div class="service-actions">
            <button class="action-btn start-btn" data-service="elasticsearch">启动</button>
            <button class="action-btn stop-btn" data-service="elasticsearch">停止</button>
          </div>
        </div>
        
        <div class="service-card" data-service="kibana">
          <div class="service-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="service-info">
            <h4>Kibana</h4>
            <p>数据可视化平台</p>
            <div class="service-status">
              <span class="status-indicator" id="kibana-indicator"></span>
              <span class="status-text" id="kibana-status-text">检查中...</span>
            </div>
          </div>
          <div class="service-actions">
            <button class="action-btn start-btn" data-service="kibana">启动</button>
            <button class="action-btn stop-btn" data-service="kibana">停止</button>
          </div>
        </div>
      </div>
      
      <div class="bulk-actions">
        <button class="bulk-btn start-all" id="start-all-services">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          启动所有服务
        </button>
        <button class="bulk-btn stop-all" id="stop-all-services">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="6" y="6" width="12" height="12"></rect>
          </svg>
          停止所有服务
        </button>
      </div>
    </div>

    <!-- 功能导航 -->
    <div class="features-section">
      <h3>功能模块</h3>
      <div class="features-grid">
        <div class="feature-card" data-route="/tools">
          <div class="feature-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
          </div>
          <h4>工具管理</h4>
          <p>添加、编辑和删除开发工具，统一管理您的开发环境</p>
          <div class="feature-arrow">→</div>
        </div>
        
        <div class="feature-card" data-route="/config">
          <div class="feature-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </div>
          <h4>配置管理</h4>
          <p>管理工具配置文件，快速调整服务参数和设置</p>
          <div class="feature-arrow">→</div>
        </div>
        
        <div class="feature-card" data-route="/logs">
          <div class="feature-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10,9 9,9 8,9"></polyline>
            </svg>
          </div>
          <h4>日志查看</h4>
          <p>实时查看工具运行日志，快速定位问题和监控状态</p>
          <div class="feature-arrow">→</div>
        </div>
      </div>
    </div>
  `;
  
  return container;
}

module.exports = {
  template: null,
  render: () => createHomePage(),
  init: (container, router) => {
    const { ipcRenderer } = require('electron');
    
    // 功能卡片导航事件
    container.querySelectorAll('.feature-card').forEach(card => {
      card.addEventListener('click', () => {
        const route = card.getAttribute('data-route');
        router.navigate(route);
      });
    });
    
    // 服务控制按钮事件
    container.querySelectorAll('.start-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const service = btn.getAttribute('data-service');
        btn.disabled = true;
        btn.textContent = '启动中...';
        
        try {
          const result = await ipcRenderer.invoke('start-service', service);
          if (result.success) {
            showNotification(`${service} 启动成功`);
          } else {
            showNotification(`${service} 启动失败: ${result.error}`, true);
          }
        } catch (error) {
          showNotification(`启动失败: ${error.message}`, true);
        } finally {
          btn.disabled = false;
          btn.textContent = '启动';
        }
      });
    });
    
    container.querySelectorAll('.stop-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const service = btn.getAttribute('data-service');
        btn.disabled = true;
        btn.textContent = '停止中...';
        
        try {
          const result = await ipcRenderer.invoke('stop-service', service);
          if (result.success) {
            showNotification(`${service} 停止成功`);
          } else {
            showNotification(`${service} 停止失败: ${result.error}`, true);
          }
        } catch (error) {
          showNotification(`停止失败: ${error.message}`, true);
        } finally {
          btn.disabled = false;
          btn.textContent = '停止';
        }
      });
    });
    
    // 批量操作按钮
    container.querySelector('#start-all-services').addEventListener('click', () => {
      ipcRenderer.send('start-all-services');
      showNotification('正在启动所有服务...');
    });
    
    container.querySelector('#stop-all-services').addEventListener('click', () => {
      ipcRenderer.send('stop-all-services');
      showNotification('正在停止所有服务...');
    });
    
    container.querySelector('#refresh-services').addEventListener('click', () => {
      ipcRenderer.send('refresh-status');
      showNotification('正在刷新服务状态...');
    });
    
    // 监听服务状态更新
    ipcRenderer.on('service-status', (event, { service, isRunning }) => {
      updateServiceStatus(service, isRunning);
    });
    
    // 监听通知消息
    ipcRenderer.on('notification', (event, { message, isError }) => {
      showNotification(message, isError);
    });
    
    // 初始化数据
    loadInitialData();
    
    // 定期刷新状态
    const statusInterval = setInterval(() => {
      ipcRenderer.send('refresh-status');
    }, 5000);
    
    // 清理定时器
    container.addEventListener('beforeunload', () => {
      clearInterval(statusInterval);
    });
    
    // 工具函数
    function updateServiceStatus(service, isRunning) {
      const serviceMap = {
        'es': 'elasticsearch',
        'elasticsearch': 'elasticsearch',
        'kibana': 'kibana'
      };
      
      const serviceName = serviceMap[service] || service;
      const indicator = container.querySelector(`#${serviceName === 'elasticsearch' ? 'es' : serviceName}-indicator`);
      const statusText = container.querySelector(`#${serviceName === 'elasticsearch' ? 'es' : serviceName}-status-text`);
      
      if (indicator && statusText) {
        indicator.className = `status-indicator ${isRunning ? 'running' : 'stopped'}`;
        statusText.textContent = isRunning ? '运行中' : '已停止';
      }
      
      // 更新运行中服务数量
      updateRunningServicesCount();
    }
    
    function updateRunningServicesCount() {
      const runningCount = container.querySelectorAll('.status-indicator.running').length;
      const runningElement = container.querySelector('#running-services');
      if (runningElement) {
        runningElement.textContent = runningCount;
      }
    }
    
    async function loadInitialData() {
      try {
        // 加载工具数量
        const tools = await ipcRenderer.invoke('get-tools');
        const totalToolsElement = container.querySelector('#total-tools');
        if (totalToolsElement) {
          totalToolsElement.textContent = tools.length;
        }
        
        // 刷新服务状态
        ipcRenderer.send('refresh-status');
      } catch (error) {
        console.error('加载初始数据失败:', error);
      }
    }
    
    function showNotification(message, isError = false) {
      // 创建通知元素
      const notification = document.createElement('div');
      notification.className = `notification ${isError ? 'error' : 'success'}`;
      notification.textContent = message;
      
      // 添加到页面
      document.body.appendChild(notification);
      
      // 显示动画
      setTimeout(() => {
        notification.classList.add('show');
      }, 100);
      
      // 自动隐藏
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }, 3000);
    }
  }
};