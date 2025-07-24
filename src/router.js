/**
 * 简单的原生JavaScript路由系统
 * 用于在Electron应用中实现页面切换功能
 */

class Router {
  constructor(options = {}) {
    // 路由配置
    this.routes = {};
    // 当前路由
    this.currentRoute = null;
    // 默认路由
    this.defaultRoute = options.defaultRoute || '/';
    // 路由变化时的回调函数
    this.onChange = options.onChange || (() => {});
    // 路由容器元素
    this.container = options.container || document.getElementById('app-container');
    // 路由历史
    this.history = [];
    // 历史位置指针
    this.historyIndex = -1;
    
    // 初始化
    this.init();
  }
  
  /**
   * 初始化路由系统
   */
  init() {
    // 监听哈希变化
    window.addEventListener('hashchange', this.handleHashChange.bind(this));
    
    // 初始导航到当前哈希或默认路由
    this.navigate(window.location.hash.slice(1) || this.defaultRoute);
  }
  
  /**
   * 处理哈希变化事件
   */
  handleHashChange() {
    const hash = window.location.hash.slice(1);
    this.loadRoute(hash);
  }
  
  /**
   * 注册路由
   * @param {string} path - 路由路径
   * @param {Object} config - 路由配置
   */
  register(path, config) {
    this.routes[path] = {
      ...config,
      path
    };
    return this;
  }
  
  /**
   * 导航到指定路由
   * @param {string} path - 路由路径
   * @param {Object} params - 路由参数
   */
  navigate(path, params = {}) {
    // 更新URL哈希，但不触发hashchange事件
    window.location.hash = path;
    
    // 手动加载路由
    this.loadRoute(path, params);
    
    // 添加到历史记录
    if (this.currentRoute) {
      // 如果在历史中间导航，清除后面的历史
      if (this.historyIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIndex + 1);
      }
      
      this.history.push({
        path,
        params
      });
      this.historyIndex = this.history.length - 1;
    }
  }
  
  /**
   * 加载路由
   * @param {string} path - 路由路径
   * @param {Object} params - 路由参数
   */
  loadRoute(path, params = {}) {
    // 查找路由配置
    const route = this.routes[path];
    
    // 如果路由不存在，导航到默认路由
    if (!route) {
      console.warn(`Route not found: ${path}`);
      if (path !== this.defaultRoute) {
        this.navigate(this.defaultRoute);
      }
      return;
    }
    
    // 更新当前路由
    this.currentRoute = {
      ...route,
      params
    };
    
    // 渲染路由内容
    this.renderRoute();
    
    // 调用onChange回调
    this.onChange(this.currentRoute);
  }
  
  /**
   * 渲染当前路由内容
   */
  renderRoute() {
    if (!this.currentRoute) return;
    
    const { template, render } = this.currentRoute;
    
    // 如果提供了渲染函数，使用渲染函数
    if (typeof render === 'function') {
      const content = render(this.currentRoute);
      if (typeof content === 'string') {
        this.container.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        this.container.innerHTML = '';
        this.container.appendChild(content);
      }
    }
    // 如果提供了模板，使用模板
    else if (template) {
      this.container.innerHTML = template;
    }
    
    // 初始化路由内的事件
    if (typeof this.currentRoute.init === 'function') {
      this.currentRoute.init(this.container, this);
    }
  }
  
  /**
   * 后退
   */
  back() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      const { path, params } = this.history[this.historyIndex];
      window.location.hash = path;
      this.loadRoute(path, params);
    }
  }
  
  /**
   * 前进
   */
  forward() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      const { path, params } = this.history[this.historyIndex];
      window.location.hash = path;
      this.loadRoute(path, params);
    }
  }
}

module.exports = Router;