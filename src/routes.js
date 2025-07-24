/**
 * 路由配置文件
 * 自动扫描pages文件夹注册路由
 */

const fs = require('fs');
const path = require('path');
const Router = require('./router');

// 自动扫描pages目录
const PAGES_DIR = path.join(__dirname, 'pages');
const route = [];

/**
 * 自动扫描pages文件夹并注册路由
 */
function autoRegisterRoutes() {
  try {
    const files = fs.readdirSync(PAGES_DIR);
    
    files.forEach(file => {
      // 只处理.js文件
      if (!file.endsWith('.js')) return;
      
      const routePath = `/${file.replace('.js', '').toLowerCase()}`;
      const component = require(path.join(PAGES_DIR, file));
      
      // 首页特殊处理
      if (file.toLowerCase() === 'home.js') {
        route.unshift({
          path: '/',
          component
        });
      } else {
        route.push({
          path: routePath,
          component
        });
      }
      
      console.log(`已注册路由: ${routePath} -> ${file}`);
    });
  } catch (err) {
    console.error('自动注册路由失败:', err);
    // 如果自动扫描失败，使用默认路由作为后备
    registerDefaultRoutes();
  }
}

/**
 * 默认路由注册（后备方案）
 */
function registerDefaultRoutes() {
  const defaultRoutes = [
    { path: '/', component: require('./pages/home') },
    { path: '/tools', component: require('./pages/tools') },
    { path: '/config', component: require('./pages/config') },
    { path: '/logs', component: require('./pages/logs') },
    { path: '/others', component: require('./pages/other') }
  ];
  
  defaultRoutes.forEach(r => route.push(r));
  console.warn('使用默认路由配置');
}

/**
 * 初始化路由系统
 * @param {HTMLElement} container - 路由内容容器
 * @returns {Router} 路由实例
 */
function initRouter(container) {
  // 自动注册路由
  autoRegisterRoutes();
  
  // 创建路由实例
  const router = new Router({
    defaultRoute: '/',
    container,
    onChange: (route) => {
      updateNavigation(route.path);
      trackPageView(route.path); // 添加页面浏览跟踪
    }
  });
  
  // 注册所有路由
  route.forEach(r => router.register(r.path, r.component));
  
  return router;
}

/**
 * 更新导航状态
 * @param {string} currentPath - 当前路由路径
 */
function updateNavigation(currentPath) {
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const path = link.getAttribute('href').replace('#', '');
    link.classList.toggle('active', path === currentPath);
  });
}

/**
 * 跟踪页面浏览
 * @param {string} path - 当前路径
 */
function trackPageView(path) {
  if (window.sunshineTracker) {
    window.sunshineTracker.track('page_view', { path });
  }
  console.log('路由变化:', path);
}

module.exports = {
  initRouter,
  getRoutes: () => route // 导出路由配置供其他模块使用
};