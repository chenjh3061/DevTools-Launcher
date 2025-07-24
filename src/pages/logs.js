/**
 * 日志查看页面组件
 */

function createLogsPage() {
  const container = document.createElement('div');
  container.className = 'page logs-page';
  
  container.innerHTML = `
    <div class="section">
      <div class="page-header">
        <h2>日志查看</h2>
        <button class="back-btn">返回首页</button>
      </div>
      
      <div class="log-controls">
        <div class="form-group">
          <label class="form-label">选择服务</label>
          <div class="button-group">
            <button class="log-service-btn active" data-service="elasticsearch">Elasticsearch</button>
            <button class="log-service-btn" data-service="kibana">Kibana</button>
          </div>
        </div>
        <div class="form-actions">
          <button id="start-log-btn" class="primary">开始监控</button>
          <button id="stop-log-btn" class="danger">停止监控</button>
          <button id="clear-log-btn" class="secondary">清空日志</button>
        </div>
      </div>
      
      <div id="log-container" class="log-container">
        <div class="log-placeholder">选择服务并点击"开始监控"按钮查看日志</div>
      </div>
    </div>
  `;
  
  return container;
}

module.exports = {
  template: null,
  render: () => createLogsPage(),
  init: (container, router) => {
    // 返回首页按钮
    container.querySelector('.back-btn').addEventListener('click', () => {
      router.navigate('/');
    });
    
    const { ipcRenderer } = require('electron');
    let currentService = 'elasticsearch';
    let isMonitoring = false;
    
    // 服务选择按钮
    container.querySelectorAll('.log-service-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (isMonitoring) {
          showNotification('请先停止当前监控', true);
          return;
        }
        
        currentService = btn.getAttribute('data-service');
        
        // 更新按钮状态
        container.querySelectorAll('.log-service-btn').forEach(b => {
          b.classList.toggle('active', b === btn);
        });
        
        // 清空日志
        clearLog();
      });
    });
    
    // 开始监控按钮
    container.querySelector('#start-log-btn').addEventListener('click', () => {
      if (isMonitoring) {
        showNotification('已经在监控中');
        return;
      }
      
      // 清空日志容器
      const logContainer = container.querySelector('#log-container');
      logContainer.innerHTML = '';
      
      // 开始监控
      ipcRenderer.invoke('start-log', currentService).then(result => {
        if (result.success) {
          isMonitoring = true;
          showNotification(`开始监控 ${currentService} 日志`);
          
          // 更新按钮状态
          updateButtonState();
        } else {
          showNotification(`监控 ${currentService} 日志失败: ${result.error}`, true);
        }
      });
    });
    
    // 停止监控按钮
    container.querySelector('#stop-log-btn').addEventListener('click', () => {
      if (!isMonitoring) {
        showNotification('当前没有监控');
        return;
      }
      
      // 停止监控
      ipcRenderer.invoke('stop-log').then(result => {
        if (result.success) {
          isMonitoring = false;
          showNotification(`停止监控 ${currentService} 日志`);
          
          // 更新按钮状态
          updateButtonState();
        } else {
          showNotification(`停止监控失败: ${result.error}`, true);
        }
      });
    });
    
    // 清空日志按钮
    container.querySelector('#clear-log-btn').addEventListener('click', () => {
      clearLog();
    });
    
    // 接收日志数据
    ipcRenderer.on('log-data', (event, data) => {
      if (!isMonitoring) return;
      
      const logContainer = container.querySelector('#log-container');
      const logLine = document.createElement('div');
      logLine.className = 'log-line';
      
      // 根据日志级别设置样式
      if (data.includes('ERROR') || data.includes('FATAL')) {
        logLine.classList.add('error');
      } else if (data.includes('WARN')) {
        logLine.classList.add('warning');
      } else if (data.includes('INFO')) {
        logLine.classList.add('info');
      } else if (data.includes('DEBUG')) {
        logLine.classList.add('debug');
      }
      
      logLine.textContent = data;
      logContainer.appendChild(logLine);
      
      // 自动滚动到底部
      logContainer.scrollTop = logContainer.scrollHeight;
    });
    
    // 更新按钮状态
    function updateButtonState() {
      container.querySelector('#start-log-btn').disabled = isMonitoring;
      container.querySelector('#stop-log-btn').disabled = !isMonitoring;
      
      // 禁用服务选择按钮
      container.querySelectorAll('.log-service-btn').forEach(btn => {
        btn.disabled = isMonitoring;
      });
    }
    
    // 清空日志
    function clearLog() {
      const logContainer = container.querySelector('#log-container');
      logContainer.innerHTML = '<div class="log-placeholder">选择服务并点击"开始监控"按钮查看日志</div>';
    }
    
    // 显示通知函数
    function showNotification(message, isError = false) {
      const notification = document.createElement('div');
      notification.className = `notification ${isError ? 'error' : 'success'}`;
      notification.textContent = message;
      document.body.appendChild(notification);
      
      // 显示通知
      setTimeout(() => notification.classList.add('show'), 10);
      
      // 3秒后隐藏通知
      setTimeout(() => {
        notification.classList.remove('show');
        notification.addEventListener('transitionend', () => {
          notification.remove();
        });
      }, 3000);
    }
    
    // 初始化按钮状态
    updateButtonState();
  }
};