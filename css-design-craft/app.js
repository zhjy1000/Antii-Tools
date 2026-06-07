document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const controlCards = document.querySelectorAll('.control-card');
  
  // DOM Elements - Preview & Code
  const visualCanvas = document.getElementById('visual-canvas');
  const previewTarget = document.getElementById('preview-target');
  const targetLabel = document.getElementById('target-label');
  const codeContent = document.getElementById('code-content');
  const btnCopyCss = document.getElementById('btn-copy-css');

  // DOM Elements - Glassmorphism Controls
  const glassBlur = document.getElementById('glass-blur');
  const glassBlurVal = document.getElementById('glass-blur-val');
  const glassOpacity = document.getElementById('glass-opacity');
  const glassOpacityVal = document.getElementById('glass-opacity-val');
  const glassColor = document.getElementById('glass-color');
  const glassColorHex = document.getElementById('glass-color-hex');
  const glassBorderOpacity = document.getElementById('glass-border-opacity');
  const glassBorderOpacityVal = document.getElementById('glass-border-opacity-val');
  const glassRadius = document.getElementById('glass-radius');
  const glassRadiusVal = document.getElementById('glass-radius-val');
  const glassBgPresets = document.getElementById('glass-bg-presets');

  // DOM Elements - Box Shadow Controls
  const shadowX = document.getElementById('shadow-x');
  const shadowXVal = document.getElementById('shadow-x-val');
  const shadowY = document.getElementById('shadow-y');
  const shadowYVal = document.getElementById('shadow-y-val');
  const shadowBlur = document.getElementById('shadow-blur');
  const shadowBlurVal = document.getElementById('shadow-blur-val');
  const shadowSpread = document.getElementById('shadow-spread');
  const shadowSpreadVal = document.getElementById('shadow-spread-val');
  const shadowColor = document.getElementById('shadow-color');
  const shadowColorHex = document.getElementById('shadow-color-hex');
  const shadowOpacity = document.getElementById('shadow-opacity');
  const shadowOpacityVal = document.getElementById('shadow-opacity-val');
  const shadowInset = document.getElementById('shadow-inset');

  // DOM Elements - Gradient Controls
  const gradType = document.getElementById('grad-type');
  const gradAngle = document.getElementById('grad-angle');
  const gradAngleVal = document.getElementById('grad-angle-val');
  const gradAngleGroup = document.getElementById('grad-angle-group');
  const gradColor1 = document.getElementById('grad-color-1');
  const gradColor1Hex = document.getElementById('grad-color-1-hex');
  const gradStop1 = document.getElementById('grad-stop-1');
  const gradStop1Val = document.getElementById('grad-stop-1-val');
  const gradColor2 = document.getElementById('grad-color-2');
  const gradColor2Hex = document.getElementById('grad-color-2-hex');
  const gradStop2 = document.getElementById('grad-stop-2');
  const gradStop2Val = document.getElementById('grad-stop-2-val');

  // App State
  let activeTab = 'glass'; // 'glass', 'shadow', 'gradient'
  let activePreset = 'gradient'; // 'gradient', 'image1', 'image2', 'dark'

  // Hex to RGB helper
  function hexToRgb(hex) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
  }

  // Setup tab switches
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Tab active toggles
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const tabId = btn.getAttribute('data-tab');
      activeTab = tabId;
      
      // Control panel active toggles
      controlCards.forEach(card => card.classList.remove('active'));
      document.getElementById(`controls-${tabId}`).classList.add('active');
      
      // Configure canvas environment according to tab
      applyTabEnvironment();
      updateStyles();
    });
  });

  // Adjust canvas wrapper background and state based on tab
  function applyTabEnvironment() {
    // Reset preview target layout & wrapper
    visualCanvas.className = 'visual-canvas';
    previewTarget.style = ''; 
    
    if (activeTab === 'glass') {
      targetLabel.textContent = '毛玻璃卡片';
      visualCanvas.classList.add(`bg-preset-${activePreset}`);
    } else if (activeTab === 'shadow') {
      targetLabel.textContent = '阴影卡片';
      visualCanvas.style.background = '#0e1420'; // Slate dark background to see shadows clearly
    } else if (activeTab === 'gradient') {
      targetLabel.textContent = '渐变卡片';
      visualCanvas.style.background = '#090d16'; // Neutral dark
    }
  }

  // Setup Hex Colors and Pickers sync
  function setupColorSync(colorInput, hexInput) {
    colorInput.addEventListener('input', (e) => {
      hexInput.value = e.target.value.toUpperCase();
      updateStyles();
    });
    hexInput.addEventListener('input', (e) => {
      let val = e.target.value;
      if (!val.startsWith('#')) val = '#' + val;
      if (/^#[0-9A-F]{6}$/i.test(val)) {
        colorInput.value = val;
        updateStyles();
      }
    });
  }

  setupColorSync(glassColor, glassColorHex);
  setupColorSync(shadowColor, shadowColorHex);
  setupColorSync(gradColor1, gradColor1Hex);
  setupColorSync(gradColor2, gradColor2Hex);

  // Setup slider display value updates
  function setupSlider(slider, displayEl, suffix = '') {
    slider.addEventListener('input', (e) => {
      displayEl.textContent = e.target.value + suffix;
      updateStyles();
    });
  }

  setupSlider(glassBlur, glassBlurVal, 'px');
  setupSlider(glassOpacity, glassOpacityVal, '%');
  setupSlider(glassBorderOpacity, glassBorderOpacityVal, '%');
  setupSlider(glassRadius, glassRadiusVal, 'px');

  setupSlider(shadowX, shadowXVal, 'px');
  setupSlider(shadowY, shadowYVal, 'px');
  setupSlider(shadowBlur, shadowBlurVal, 'px');
  setupSlider(shadowSpread, shadowSpreadVal, 'px');
  setupSlider(shadowOpacity, shadowOpacityVal, '%');
  shadowInset.addEventListener('change', updateStyles);

  setupSlider(gradAngle, gradAngleVal, '°');
  setupSlider(gradStop1, gradStop1Val, '%');
  setupSlider(gradStop2, gradStop2Val, '%');
  gradType.addEventListener('change', () => {
    if (gradType.value === 'radial') {
      gradAngleGroup.style.display = 'none';
    } else {
      gradAngleGroup.style.display = 'block';
    }
    updateStyles();
  });

  // Background presets for glassmorphism
  glassBgPresets.addEventListener('click', (e) => {
    const btn = e.target.closest('.preset-btn');
    if (!btn) return;
    
    // Toggle active preset
    const preset = btn.getAttribute('data-bg');
    activePreset = preset;
    
    document.querySelectorAll('#glass-bg-presets .preset-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Apply background
    visualCanvas.className = 'visual-canvas';
    visualCanvas.classList.add(`bg-preset-${preset}`);
  });

  // Main UI Styling Engine
  function updateStyles() {
    let cssText = '';

    if (activeTab === 'glass') {
      const blurVal = glassBlur.value;
      const opVal = glassOpacity.value / 100;
      const borderOpVal = glassBorderOpacity.value / 100;
      const radVal = glassRadius.value;
      const colorRgb = hexToRgb(glassColor.value);

      const bgStyle = `rgba(${colorRgb.r}, ${colorRgb.g}, ${colorRgb.b}, ${opVal})`;
      const borderStyle = `1px solid rgba(${colorRgb.r}, ${colorRgb.g}, ${colorRgb.b}, ${borderOpVal})`;
      const backdropFilterStyle = `blur(${blurVal}px)`;

      // Apply Inline
      previewTarget.style.background = bgStyle;
      previewTarget.style.backdropFilter = backdropFilterStyle;
      previewTarget.style.webkitBackdropFilter = backdropFilterStyle;
      previewTarget.style.border = borderStyle;
      previewTarget.style.borderRadius = `${radVal}px`;
      previewTarget.style.boxShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.3)';

      // Formulate CSS code block
      cssText = `background: ${bgStyle};
backdrop-filter: blur(${blurVal}px);
-webkit-backdrop-filter: blur(${blurVal}px);
border: ${borderStyle};
border-radius: ${radVal}px;
box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);`;

    } else if (activeTab === 'shadow') {
      const x = shadowX.value;
      const y = shadowY.value;
      const blur = shadowBlur.value;
      const spread = shadowSpread.value;
      const op = shadowOpacity.value / 100;
      const inset = shadowInset.value === 'true';
      const colorRgb = hexToRgb(shadowColor.value);

      const shadowVal = `${inset ? 'inset ' : ''}${x}px ${y}px ${blur}px ${spread}px rgba(${colorRgb.r}, ${colorRgb.g}, ${colorRgb.b}, ${op})`;
      const bgStyle = 'rgba(255, 255, 255, 0.1)';
      const borderStyle = '1px solid rgba(255, 255, 255, 0.05)';
      const radiusVal = '16px';

      // Apply Inline
      previewTarget.style.background = bgStyle;
      previewTarget.style.border = borderStyle;
      previewTarget.style.borderRadius = radiusVal;
      previewTarget.style.boxShadow = shadowVal;

      // Formulate CSS code block
      cssText = `background: rgba(255, 255, 255, 0.1);
border: 1px solid rgba(255, 255, 255, 0.05);
border-radius: ${radiusVal};
box-shadow: ${shadowVal};`;

    } else if (activeTab === 'gradient') {
      const type = gradType.value;
      const angle = gradAngle.value;
      const c1 = gradColor1.value;
      const s1 = gradStop1.value;
      const c2 = gradColor2.value;
      const s2 = gradStop2.value;
      const radiusVal = '16px';

      let bgStyle = '';
      if (type === 'linear') {
        bgStyle = `linear-gradient(${angle}deg, ${c1} ${s1}%, ${c2} ${s2}%)`;
      } else {
        bgStyle = `radial-gradient(circle, ${c1} ${s1}%, ${c2} ${s2}%)`;
      }

      // Apply Inline
      previewTarget.style.background = bgStyle;
      previewTarget.style.borderRadius = radiusVal;
      previewTarget.style.border = 'none';
      previewTarget.style.boxShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.2)';

      // Formulate CSS code block
      cssText = `background: ${bgStyle};
border-radius: ${radiusVal};
box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);`;
    }

    codeContent.textContent = cssText;
  }

  // Copy CSS Action
  btnCopyCss.addEventListener('click', () => {
    const cssCode = codeContent.textContent;
    navigator.clipboard.writeText(cssCode).then(() => {
      // Toggle button visual success
      const originalText = btnCopyCss.innerHTML;
      btnCopyCss.innerHTML = '<i class="fa-solid fa-check"></i> 已复制！';
      btnCopyCss.classList.add('success');
      
      setTimeout(() => {
        btnCopyCss.innerHTML = originalText;
        btnCopyCss.classList.remove('success');
      }, 2000);
    }).catch(err => {
      console.error('Could not copy CSS: ', err);
    });
  });

  // Initial Load
  applyTabEnvironment();
  updateStyles();
});
