document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const qrContentInput = document.getElementById('qr-content');
  const colorForegroundInput = document.getElementById('color-foreground');
  const colorForegroundHex = document.getElementById('color-foreground-hex');
  const colorBackgroundInput = document.getElementById('color-background');
  const colorBackgroundHex = document.getElementById('color-background-hex');
  
  const qrMarginInput = document.getElementById('qr-margin');
  const qrMarginVal = document.getElementById('qr-margin-val');
  const qrErrorLevelSelect = document.getElementById('qr-error-level');
  
  const logoDropzone = document.getElementById('logo-dropzone');
  const logoFileInput = document.getElementById('logo-file');
  const logoPreviewWrapper = document.getElementById('logo-preview-wrapper');
  const logoPreviewImg = document.getElementById('logo-preview-img');
  const logoFilename = document.getElementById('logo-filename');
  const removeLogoBtn = document.getElementById('remove-logo-btn');
  const logoSizeInput = document.getElementById('logo-size');
  const logoSizeVal = document.getElementById('logo-size-val');
  
  const qrCanvas = document.getElementById('qr-canvas');
  const btnDownloadPng = document.getElementById('btn-download-png');
  const btnDownloadSvg = document.getElementById('btn-download-svg');
  
  // App State
  let logoImage = null;
  let logoName = '';

  // Helper to check premium status dynamically (Cloud-synced or Local fallback)
  function isPremium() {
    return window.currentUserState ? window.currentUserState.isPremium : (localStorage.getItem('geek_tools_premium') === 'true');
  }
  
  // Accordion Logic
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isActive = item.classList.contains('active');
      
      // Close all accordion items
      document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));
      
      // Toggle current
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // Color Pickers Sync
  function setupColorSync(colorPicker, hexInput) {
    colorPicker.addEventListener('input', (e) => {
      hexInput.value = e.target.value.toUpperCase();
      generateQRCode();
    });
    
    hexInput.addEventListener('input', (e) => {
      let val = e.target.value;
      if (!val.startsWith('#')) {
        val = '#' + val;
      }
      // Simple validation
      if (/^#[0-9A-F]{6}$/i.test(val)) {
        colorPicker.value = val;
        generateQRCode();
      }
    });
  }
  
  setupColorSync(colorForegroundInput, colorForegroundHex);
  setupColorSync(colorBackgroundInput, colorBackgroundHex);

  // Margins Sync
  qrMarginInput.addEventListener('input', (e) => {
    qrMarginVal.textContent = e.target.value;
    generateQRCode();
  });

  // Error Correction Sync
  let lastErrorLevel = qrErrorLevelSelect.value;
  qrErrorLevelSelect.addEventListener('change', () => {
    if (!isPremium() && qrErrorLevelSelect.value === 'H') {
      showPaywall();
      qrErrorLevelSelect.value = lastErrorLevel;
      return;
    }
    lastErrorLevel = qrErrorLevelSelect.value;
    const errorLevelNameMap = {
      'L': 'Low (7%)',
      'M': 'Medium (15%)',
      'Q': 'Quartile (25%)',
      'H': 'High (30%)'
    };
    document.getElementById('qr-error-val').textContent = errorLevelNameMap[qrErrorLevelSelect.value];
    generateQRCode();
  });

  // Logo Size Sync
  logoSizeInput.addEventListener('input', (e) => {
    logoSizeVal.textContent = e.target.value + '%';
    generateQRCode();
  });

  // Drag & Drop / File Select for Logo
  logoDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    logoDropzone.classList.add('dragover');
  });

  logoDropzone.addEventListener('dragleave', () => {
    logoDropzone.classList.remove('dragover');
  });

  logoDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    logoDropzone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleLogoFile(files[0]);
    }
  });

  logoFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleLogoFile(e.target.files[0]);
    }
  });

  function handleLogoFile(file) {
    if (!isPremium()) {
      showPaywall();
      logoFileInput.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('请选择有效的图片文件。');
      return;
    }
    
    logoName = file.name;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        logoImage = img;
        logoPreviewImg.src = event.target.result;
        logoFilename.textContent = logoName;
        logoDropzone.classList.add('hidden');
        logoPreviewWrapper.classList.remove('hidden');
        generateQRCode();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Remove Logo
  removeLogoBtn.addEventListener('click', () => {
    logoImage = null;
    logoName = '';
    logoFileInput.value = '';
    logoPreviewImg.src = '';
    logoPreviewWrapper.classList.add('hidden');
    logoDropzone.classList.remove('hidden');
    generateQRCode();
  });

  // Live Generator Input
  qrContentInput.addEventListener('input', () => {
    generateQRCode();
  });

  // Generate QR Code Core Logic
  function generateQRCode() {
    const text = qrContentInput.value.trim() || 'https://google.com';
    const fgColor = colorForegroundInput.value;
    const bgColor = colorBackgroundInput.value;
    const margin = parseInt(qrMarginInput.value, 10);
    const errorLevel = qrErrorLevelSelect.value;
    
    // Set rendering options (Width 400 makes it high quality)
    const options = {
      errorCorrectionLevel: errorLevel,
      margin: margin,
      width: 400,
      color: {
        dark: fgColor,
        light: bgColor
      }
    };

    QRCode.toCanvas(qrCanvas, text, options, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      
      // Draw custom logo if present
      if (logoImage) {
        const ctx = qrCanvas.getContext('2d');
        const canvasWidth = qrCanvas.width;
        const canvasHeight = qrCanvas.height;
        
        // Calculate Logo Dimensions
        const scale = parseInt(logoSizeInput.value, 10) / 100;
        const logoWidth = canvasWidth * scale;
        const logoHeight = canvasHeight * scale;
        const x = (canvasWidth - logoWidth) / 2;
        const y = (canvasHeight - logoHeight) / 2;
        
        // Draw white border container for logo (making it stand out)
        const pad = logoWidth * 0.15; // padding factor
        ctx.fillStyle = bgColor;
        
        // Draw round rectangle background for logo
        ctx.beginPath();
        const rx = x - pad;
        const ry = y - pad;
        const rw = logoWidth + pad * 2;
        const rh = logoHeight + pad * 2;
        const r = pad * 0.8; // border radius
        
        ctx.moveTo(rx + r, ry);
        ctx.arcTo(rx + rw, ry, rx + rw, ry + rh, r);
        ctx.arcTo(rx + rw, ry + rh, rx, ry + rh, r);
        ctx.arcTo(rx, ry + rh, rx, ry, r);
        ctx.arcTo(rx, ry, rx + rw, ry, r);
        ctx.closePath();
        ctx.fill();
        
        // Draw image
        ctx.drawImage(logoImage, x, y, logoWidth, logoHeight);
      }
    });
  }

  // Action: Download PNG
  btnDownloadPng.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'qrcode-forge.png';
    link.href = qrCanvas.toDataURL('image/png');
    link.click();
  });

  // Action: Copy SVG
  btnDownloadSvg.addEventListener('click', () => {
    const text = qrContentInput.value.trim() || 'https://google.com';
    const fgColor = colorForegroundInput.value;
    const bgColor = colorBackgroundInput.value;
    const margin = parseInt(qrMarginInput.value, 10);
    const errorLevel = qrErrorLevelSelect.value;
    
    const options = {
      errorCorrectionLevel: errorLevel,
      margin: margin,
      width: 400,
      color: {
        dark: fgColor,
        light: bgColor
      },
      type: 'svg'
    };

      QRCode.toString(text, options, (err, svgString) => {
      if (err) {
        console.error(err);
        alert('生成 SVG 代码失败，请稍后重试。');
        return;
      }
      
      // If there is a logo image, we can optionally inject an SVG image tag.
      // But a clean text-copy is best. Let's copy the SVG code to clipboard
      navigator.clipboard.writeText(svgString).then(() => {
        // Change button state temporarily to show success
        const originalHtml = btnDownloadSvg.innerHTML;
        btnDownloadSvg.innerHTML = '<i class="fa-solid fa-check"></i> 已复制！';
        btnDownloadSvg.classList.add('success');
        setTimeout(() => {
          btnDownloadSvg.innerHTML = originalHtml;
          btnDownloadSvg.classList.remove('success');
        }, 2000);
      }).catch(err => {
        console.error('Could not copy text: ', err);
      });
    });
  });

  // Initial Run
  generateQRCode();

  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!paywallModal.classList.contains('hidden')) closePaywall();
    }
  });

  // Paywall UI Event Listeners
  const paywallModal = document.getElementById('paywall-modal');
  const btnClosePaywall = document.getElementById('btn-close-paywall');
  const paywallBackdrop = document.getElementById('paywall-backdrop');
  const btnSimulateSuccess = document.getElementById('btn-simulate-success');
  const priceCards = document.querySelectorAll('.price-card');
  const payMethodBtns = document.querySelectorAll('.pay-method-btn');

  function showPaywall() {
    paywallModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closePaywall() {
    paywallModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  if (btnClosePaywall) btnClosePaywall.addEventListener('click', closePaywall);
  if (paywallBackdrop) paywallBackdrop.addEventListener('click', closePaywall);

  priceCards.forEach(card => {
    card.addEventListener('click', () => {
      priceCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    });
  });

  payMethodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      payMethodBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  if (btnSimulateSuccess) {
    btnSimulateSuccess.addEventListener('click', async () => {
      if (window.setUserPremiumStatus) {
        await window.setUserPremiumStatus(true);
      } else {
        localStorage.setItem('geek_tools_premium', 'true');
      }
      alert('恭喜！您已成功模拟支付解锁 Antii Tools 专业版 Pro！页面即将刷新以生效特权。');
      closePaywall();
      location.reload();
    });
  }
});
