/**
 * 配置管理页面组件
 */

function createConfigPage() {
  const container = document.createElement('div');
  container.className = 'page config-page';
  
  container.innerHTML = `
    <div class="section">
      <div class="page-header">
        <h2>配置管理</h2>
        <button class="back-btn">返回首页</button>
      </div>
      
      <div class="config-tabs">
        <button class="config-tab active" data-config="elasticsearch">Elasticsearch</button>
        <button class="config-tab" data-config="kibana">Kibana</button>
      </div>
      
      <div class="config-editor">
        <div class="form-group">
          <label class="form-label" for="config-path">配置文件路径</label>
          <div class="input-group">
            <input id="config-path" readonly />
            <button id="open-config-btn">打开文件</button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="config-content">配置内容</label>
          <textarea id="config-content" spellcheck="false"></textarea>
        </div>
        <div class="form-actions">
          <button id="save-config-btn" class="primary">保存配置</button>
          <button id="reset-config-btn" class="secondary">重置</button>
        </div>
      </div>
    </div>
  `;
  
  return container;
}

module.exports = {
  template: null,
  render: () => createConfigPage(),
  init: (container, router) => {
    // 返回首页按钮
    container.querySelector('.back-btn').addEventListener('click', () => {
      router.navigate('/');
    });
    
    const { ipcRenderer } = require('electron');
    let currentConfig = 'elasticsearch';
    let originalContent = '';
    
    // 加载配置内容
    function loadConfig(configName) {
      currentConfig = configName;
      
      // 更新标签页状态
      container.querySelectorAll('.config-tab').forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('data-config') === configName);
      });
      
      // 加载配置
      ipcRenderer.invoke('load-config', configName).then(result => {
        const pathInput = container.querySelector('#config-path');
        const contentTextarea = container.querySelector('#config-content');
        
        if (result.success) {
          pathInput.value = result.path;
          contentTextarea.value = result.content;
          originalContent = result.content;
        } else {
          pathInput.value = '未找到配置文件';
          contentTextarea.value = '';
          originalContent = '';
          showNotification(`加载 ${configName} 配置失败: ${result.error}`, true);
        }
      });
    }
    
    // 初始加载Elasticsearch配置
    loadConfig('elasticsearch');
    
    // 配置标签页切换
    container.querySelectorAll('.config-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const configName = tab.getAttribute('data-config');
        loadConfig(configName);
      });
    });
    
    // 保存配置按钮
    container.querySelector('#save-config-btn').addEventListener('click', () => {
      const content = container.querySelector('#config-content').value;
      
      if (content === originalContent) {
        showNotification('配置未修改');
        return;
      }
      
      ipcRenderer.invoke('save-config', {
        name: currentConfig,
        content
      }).then(result => {
        if (result.success) {
          showNotification(`${currentConfig} 配置保存成功`);
          originalContent = content;
        } else {
          showNotification(`保存 ${currentConfig} 配置失败: ${result.error}`, true);
        }
      });
    });
    
    // 重置配置按钮
    container.querySelector('#reset-config-btn').addEventListener('click', () => {
      if (confirm('确定要重置配置吗？所有未保存的修改将丢失。')) {
        container.querySelector('#config-content').value = originalContent;
      }
    });
    
    // 打开配置文件按钮
    container.querySelector('#open-config-btn').addEventListener('click', () => {
      const path = container.querySelector('#config-path').value;
      if (path && path !== '未找到配置文件') {
        ipcRenderer.invoke('open-file', path);
      } else {
        showNotification('无法打开配置文件', true);
      }
    });
    
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
  }
};