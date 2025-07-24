/**
 * 工具管理页面组件
 */

function createToolsPage() {
  const container = document.createElement('div');
  container.className = 'page tools-page';
  
  container.innerHTML = `
    <div class="section">
      <div class="page-header">
        <h2>工具管理</h2>
        <button class="back-btn">返回首页</button>
      </div>
      
      <div class="tool-form">
        <div class="form-group">
          <label class="form-label" for="tool-name">工具名称</label>
          <input id="tool-name" placeholder="例如: Redis" />
        </div>
        <div class="form-group">
          <label class="form-label" for="tool-path">可执行文件路径</label>
          <div class="input-group">
            <input id="tool-path" placeholder="例如: D:\\Redis\\redis-server.exe" />
            <button id="browse-btn">浏览...</button>
          </div>
        </div>
        <div class="form-actions">
          <button id="add-tool-btn" class="primary">添加工具</button>
        </div>
      </div>
      
      <div id="tool-list" class="tool-list">
        <!-- 工具列表将通过JavaScript动态生成 -->
        <div class="loading">加载中...</div>
      </div>
    </div>
  `;
  
  return container;
}

module.exports = {
  template: null,
  render: () => createToolsPage(),
  init: (container, router) => {
    // 返回首页按钮
    container.querySelector('.back-btn').addEventListener('click', () => {
      router.navigate('/');
    });
    
    // 获取工具列表
    const { ipcRenderer } = require('electron');
    const toolList = container.querySelector('#tool-list');
    
    // 加载工具列表
    ipcRenderer.invoke('get-tools').then(tools => {
      toolList.innerHTML = '';
      
      if (tools.length === 0) {
        toolList.innerHTML = '<div class="empty-state">暂无工具，请添加</div>';
        return;
      }
      
      tools.forEach(tool => {
        const toolItem = document.createElement('div');
        toolItem.className = 'tool-item';
        toolItem.innerHTML = `
          <div class="tool-info">
            <div class="tool-name">${tool.name}</div>
            <div class="tool-path">${tool.path}</div>
          </div>
          <div class="tool-actions">
            <button class="edit-tool" data-id="${tool.name}">编辑</button>
            <button class="start-tool" data-id="${tool.name}">启动</button>
            <button class="delete-tool danger" data-id="${tool.name}">删除</button>
          </div>
        `;
        toolList.appendChild(toolItem);
      });
      
      // 添加工具操作事件
      container.querySelectorAll('.edit-tool').forEach(button => {
        button.addEventListener('click', (e) => {
          const toolName = e.target.getAttribute('data-id');
          // 打开编辑对话框或导航到编辑页面
          router.navigate('/tools/edit', { toolName });
        });
      });
      
      container.querySelectorAll('.start-tool').forEach(button => {
        button.addEventListener('click', (e) => {
          const toolName = e.target.getAttribute('data-id');
          ipcRenderer.invoke('start-service', toolName).then(result => {
            if (result.success) {
              showNotification(`${toolName} 启动成功`);
            } else {
              showNotification(`${toolName} 启动失败: ${result.error}`, true);
            }
          });
        });
      });
      
      container.querySelectorAll('.delete-tool').forEach(button => {
        button.addEventListener('click', (e) => {
          const toolName = e.target.getAttribute('data-id');
          if (confirm(`确定要删除 ${toolName} 吗？`)) {
            ipcRenderer.invoke('delete-tool', toolName).then(result => {
              if (result.success) {
                showNotification(`${toolName} 已删除`);
                // 重新加载工具列表
                router.navigate('/tools');
              } else {
                showNotification(`删除 ${toolName} 失败`, true);
              }
            });
          }
        });
      });
    }).catch(err => {
      toolList.innerHTML = `<div class="error-state">加载失败: ${err.message}</div>`;
    });
    
    // 添加工具按钮
    container.querySelector('#add-tool-btn').addEventListener('click', () => {
      const name = container.querySelector('#tool-name').value.trim();
      const path = container.querySelector('#tool-path').value.trim();
      
      if (!name || !path) {
        showNotification('请填写工具名称和路径', true);
        return;
      }
      
      ipcRenderer.invoke('add-tool', { name, path }).then(result => {
        if (result.success) {
          showNotification(`${name} 添加成功`);
          // 清空表单
          container.querySelector('#tool-name').value = '';
          container.querySelector('#tool-path').value = '';
          // 重新加载工具列表
          router.navigate('/tools');
        } else {
          showNotification(`添加 ${name} 失败`, true);
        }
      });
    });
    
    // 浏览按钮
    container.querySelector('#browse-btn').addEventListener('click', () => {
      ipcRenderer.invoke('open-file-dialog').then(result => {
        if (result.filePath) {
          container.querySelector('#tool-path').value = result.filePath;
        }
      });
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