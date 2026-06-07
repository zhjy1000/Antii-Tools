/**
 * Antii Tools - 共享身份认证与会员逻辑 (Auth & Database Helpers)
 */

(function () {
  // 全局共享状态
  window.currentUserState = {
    user: null,
    isPremium: false,
    loaded: false
  };

  // 认证变化监听器
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof firebase === 'undefined' || !window.firebaseAuth) {
      console.warn("Firebase Auth 未初始化，启用本地降级模式（仅使用 localStorage）");
      // 降级本地存储兼容模式
      window.currentUserState.loaded = true;
      window.currentUserState.isPremium = localStorage.getItem('geek_tools_premium') === 'true';
      updateNavbarUI(null);
      return;
    }

    const auth = window.firebaseAuth;
    const db = window.firebaseDb;

    // 监听用户登录状态
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        window.currentUserState.user = user;
        
        try {
          const userDocRef = db.collection('users').doc(user.uid);
          const doc = await userDocRef.get();
          
          if (!doc.exists) {
            // 新用户：在数据库初始化文档
            const initialData = {
              email: user.email || '',
              displayName: user.displayName || '',
              photoURL: user.photoURL || '',
              is_premium: false,
              createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            await userDocRef.set(initialData);
            window.currentUserState.isPremium = false;
          } else {
            // 老用户：读取付费标记
            const data = doc.data();
            window.currentUserState.isPremium = !!data.is_premium;
          }
        } catch (err) {
          console.error("从 Firestore 获取用户资料失败，启用本地存储降级：", err);
          // 数据库权限错误或网络错误时，降级读取本地存储以保证基本可用性
          window.currentUserState.isPremium = localStorage.getItem('geek_tools_premium') === 'true';
        }
      } else {
        window.currentUserState.user = null;
        window.currentUserState.isPremium = false;
      }
      
      window.currentUserState.loaded = true;
      
      // 更新导航栏 UI
      updateNavbarUI(window.currentUserState.user);
      
      // 向整个文档分发状态更新事件，通知子页面修改功能限制
      document.dispatchEvent(new CustomEvent('antii-auth-ready', { 
        detail: { 
          user: window.currentUserState.user, 
          isPremium: window.currentUserState.isPremium 
        } 
      }));
    });
  });

  // Google 登录方法
  window.loginWithGoogle = async function () {
    if (typeof firebase === 'undefined' || !window.firebaseAuth) {
      alert("Firebase 尚未配置正确，无法进行云端登录。");
      return;
    }
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      await window.firebaseAuth.signInWithPopup(provider);
      window.hideLoginModal();
    } catch (error) {
      console.error("谷歌登录失败：", error);
      alert("登录失败：" + error.message);
    }
  };

  // Email/Password 登录方法
  window.loginWithEmail = async function () {
    if (typeof firebase === 'undefined' || !window.firebaseAuth) {
      alert("Firebase 尚未配置正确，无法进行云端登录。");
      return;
    }
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    if (!emailInput || !passwordInput) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      alert("请填写邮箱和密码！");
      return;
    }

    try {
      await window.firebaseAuth.signInWithEmailAndPassword(email, password);
      window.hideLoginModal();
    } catch (error) {
      console.error("邮箱登录失败：", error);
      alert("登录失败：" + error.message);
    }
  };

  // Email/Password 注册方法
  window.registerWithEmail = async function () {
    if (typeof firebase === 'undefined' || !window.firebaseAuth) {
      alert("Firebase 尚未配置正确，无法进行云端注册。");
      return;
    }
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    if (!emailInput || !passwordInput) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      alert("请填写邮箱和密码！");
      return;
    }

    try {
      await window.firebaseAuth.createUserWithEmailAndPassword(email, password);
      alert("注册成功并已自动登录！");
      window.hideLoginModal();
    } catch (error) {
      console.error("注册失败：", error);
      alert("注册失败：" + error.message);
    }
  };

  // 登出方法
  window.logoutUser = async function () {
    if (typeof firebase === 'undefined' || !window.firebaseAuth) {
      // 降级模式清空本地
      localStorage.removeItem('geek_tools_premium');
      window.currentUserState.user = null;
      window.currentUserState.isPremium = false;
      location.reload();
      return;
    }
    try {
      await window.firebaseAuth.signOut();
      location.reload();
    } catch (error) {
      console.error("登出失败：", error);
    }
  };

  // 检查是否为专业版用户 (支持 Promise 异步获取)
  window.checkPremiumStatus = function () {
    return new Promise((resolve) => {
      if (window.currentUserState.loaded) {
        resolve(window.currentUserState.isPremium);
      } else {
        const handler = (e) => {
          document.removeEventListener('antii-auth-ready', handler);
          resolve(e.detail.isPremium);
        };
        document.addEventListener('antii-auth-ready', handler);
        // 设置 3秒超时防止卡死
        setTimeout(() => {
          document.removeEventListener('antii-auth-ready', handler);
          resolve(window.currentUserState.isPremium);
        }, 3000);
      }
    });
  };

  // 激活 Pro 状态 (模拟支付成功后调用)
  window.setUserPremiumStatus = async function (status) {
    window.currentUserState.isPremium = status;
    // 兼容本地存储，即使断网也能继续使用
    localStorage.setItem('geek_tools_premium', status ? 'true' : 'false');

    const user = window.currentUserState.user;
    if (user && window.firebaseDb) {
      try {
        await window.firebaseDb.collection('users').doc(user.uid).update({
          is_premium: status,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (err) {
        console.error("同步至 Firestore 会员状态失败：", err);
      }
    }
  };

  // 渲染/更新导航栏用户区域的公共方法
  function updateNavbarUI(user) {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    // 清除可能存在的旧用户面板
    const oldPanel = document.getElementById('user-nav-panel');
    if (oldPanel) oldPanel.remove();

    let userHtml = '';
    if (user) {
      const avatar = user.photoURL || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
      const name = user.displayName || user.email.split('@')[0] || '用户';
      const isPro = window.currentUserState.isPremium;
      
      userHtml = `
        <div class="user-nav-panel" id="user-nav-panel">
          ${isPro ? `
            <span class="badge-premium" style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #1e293b; padding: 5px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 4px 10px rgba(245, 158, 11, 0.3);">
              <i class="fa-solid fa-crown"></i> Pro
            </span>
          ` : `
            <span class="badge-free" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); color: #9ca3af; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 500; display: inline-flex; align-items: center; gap: 4px;">
              免费版
            </span>
          `}
          <div class="user-menu-trigger" onclick="toggleUserDropdown(event)" style="display: flex; align-items: center; gap: 8px; cursor: pointer; position: relative;">
            <img src="${avatar}" referrerpolicy="no-referrer" alt="avatar" style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid ${isPro ? '#f59e0b' : 'rgba(255,255,255,0.2)'}; object-fit: cover;">
            <span class="user-name-text" style="font-size: 0.9rem; font-weight: 500; color: #f3f4f6; max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${name}</span>
            <i class="fa-solid fa-chevron-down" style="font-size: 0.7rem; color: #9ca3af;"></i>
            
            <!-- 下拉选单 -->
            <div class="user-dropdown hidden" id="user-nav-dropdown" style="position: absolute; top: 45px; right: 0; background: #1f2937; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3); padding: 8px 0; width: 140px; z-index: 100;">
              <a href="#" onclick="logoutUser(); return false;" style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; color: #f43f5e; text-decoration: none; font-size: 0.85rem; font-weight: 600;">
                <i class="fa-solid fa-right-from-bracket"></i> 退出登录
              </a>
            </div>
          </div>
        </div>
      `;
      navLinks.insertAdjacentHTML('beforeend', userHtml);
    } else {
      // 未登录
      userHtml = `
        <div class="user-nav-panel" id="user-nav-panel">
          <button onclick="showLoginModal()" class="btn-login-trigger" style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; border: none; padding: 6px 16px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; cursor: pointer; box-shadow: 0 4px 10px rgba(99, 102, 241, 0.25); display: inline-flex; align-items: center; gap: 6px; transition: transform 0.2s;">
            <i class="fa-solid fa-right-to-bracket"></i> 登录 / 注册
          </button>
        </div>
      `;
      navLinks.insertAdjacentHTML('beforeend', userHtml);
    }
  }

  // 全局控制下拉菜单显示/隐藏的方法
  window.toggleUserDropdown = function (event) {
    event.stopPropagation();
    const dropdown = document.getElementById('user-nav-dropdown');
    if (dropdown) {
      dropdown.classList.toggle('hidden');
    }
  };

  // 显示登录弹窗
  window.showLoginModal = function () {
    const modal = document.getElementById('login-modal');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  };

  // 隐藏登录弹窗
  window.hideLoginModal = function () {
    const modal = document.getElementById('login-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  };

  // 点击页面其它区域关闭菜单和弹窗
  document.addEventListener('click', () => {
    const dropdown = document.getElementById('user-nav-dropdown');
    if (dropdown && !dropdown.classList.contains('hidden')) {
      dropdown.classList.add('hidden');
    }
  });

  // Esc 键关闭弹窗
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.hideLoginModal();
    }
  });
})();


