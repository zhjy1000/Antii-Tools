/**
 * Antii Tools - Firebase 配置文件
 * 
 * 请在此处将下面的 firebaseConfig 占位信息替换为你在 Firebase Console 取得的项目配置。
 * 详情请参考 Firebase 部署指引。
 */

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID_HERE.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID_HERE",
  storageBucket: "YOUR_PROJECT_ID_HERE.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
  appId: "YOUR_APP_ID_HERE"
};

function hasFirebaseConfig(config) {
  return Object.values(config).every((value) => {
    return typeof value === 'string' && value && !value.includes('YOUR_');
  });
}

// 初始化 Firebase (使用 compat 兼容模式，适合 Vanilla JS 静态网站)
if (typeof firebase !== 'undefined' && hasFirebaseConfig(firebaseConfig)) {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  // 将实例挂载到 window 全局变量，方便各个页面或独立脚本访问
  window.firebaseAuth = firebase.auth();
  window.firebaseDb = firebase.firestore();
  console.log("Firebase 实例初始化成功");
} else if (typeof firebase !== 'undefined') {
  console.warn("Firebase 配置仍为占位符，已跳过云端登录与会员同步初始化");
} else {
  console.warn("未检测到 Firebase SDK，请确保在 HTML 中正确加载了 CDN 脚本");
}
