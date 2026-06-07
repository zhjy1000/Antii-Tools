document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const imageDropzone = document.getElementById('image-dropzone');
  const imageFileInput = document.getElementById('image-file-input');
  const workspaceLayout = document.getElementById('workspace-layout');
  const imageListContainer = document.getElementById('image-list-container');
  
  const globalQuality = document.getElementById('global-quality');
  const globalQualityVal = document.getElementById('global-quality-val');
  const globalFormat = document.getElementById('global-format');
  
  const statCount = document.getElementById('stat-count');
  const statSavings = document.getElementById('stat-savings');
  const statSavedBytes = document.getElementById('stat-saved-bytes');
  
  const btnDownloadAll = document.getElementById('btn-download-all');
  const btnClearAll = document.getElementById('btn-clear-all');
  
  // Modal Elements
  const comparisonModal = document.getElementById('comparison-modal');
  const modalFilename = document.getElementById('modal-filename');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const compareOrigImg = document.getElementById('compare-orig-img');
  const compareCompImg = document.getElementById('compare-comp-img');
  const compareOrigSize = document.getElementById('compare-orig-size');
  const compareCompSize = document.getElementById('compare-comp-size');
  const compareSavings = document.getElementById('compare-savings');

  // App State
  let filesList = [];
  let nextId = 1;

  // Drag & Drop
  imageDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    imageDropzone.classList.add('dragover');
  });

  imageDropzone.addEventListener('dragleave', () => {
    imageDropzone.classList.remove('dragover');
  });

  imageDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    imageDropzone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  });

  imageDropzone.addEventListener('click', () => {
    imageFileInput.click();
  });

  imageFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  });

  // Handle uploaded files
  function handleFiles(files) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    let addedAny = false;

    // Cloud-synced/Local Freemium checks
    const isPremium = window.currentUserState ? window.currentUserState.isPremium : false;
    if (!isPremium) {
      // 1. File count limit: max 5 files total
      if (filesList.length + files.length > 5) {
        showPaywall();
        return;
      }
      // 2. File size limit: max 5MB per file
      const hasLargeFile = Array.from(files).some(file => file.size > 5 * 1024 * 1024);
      if (hasLargeFile) {
        showPaywall();
        return;
      }
    }

    Array.from(files).forEach(file => {
      if (!validTypes.includes(file.type)) {
        alert(`文件 "${file.name}" 格式不支持，仅支持 JPG, PNG, WebP 图片。`);
        return;
      }

      const fileItem = {
        id: nextId++,
        file: file,
        name: file.name,
        originalSize: file.size,
        originalUrl: null,
        compressedBlob: null,
        compressedUrl: null,
        compressedSize: 0,
        savingsPercent: 0,
        quality: parseInt(globalQuality.value, 10),
        format: globalFormat.value,
        status: 'processing'
      };

      filesList.push(fileItem);
      addedAny = true;

      // Create object URL for preview/comparison
      fileItem.originalUrl = URL.createObjectURL(file);

      // Render placeholder in the list
      renderImageItem(fileItem);

      // Run compression
      compressSingleImage(fileItem);
    });

    if (addedAny) {
      workspaceLayout.classList.remove('hidden');
      updateStats();
    }
  }

  // Generate MimeType
  function getMimeType(format, originalType) {
    if (format === 'original') return originalType;
    if (format === 'jpeg') return 'image/jpeg';
    if (format === 'png') return 'image/png';
    if (format === 'webp') return 'image/webp';
    return originalType;
  }

  // Generate File Extension based on format
  function getNewFileName(name, format, originalType) {
    const extIndex = name.lastIndexOf('.');
    const baseName = extIndex !== -1 ? name.substring(0, extIndex) : name;
    
    if (format === 'original') return name;
    if (format === 'jpeg') return baseName + '.jpg';
    if (format === 'png') return baseName + '.png';
    if (format === 'webp') return baseName + '.webp';
    return name;
  }

  // Compress single image using Canvas
  function compressSingleImage(item) {
    const img = new Image();
    img.src = item.originalUrl;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Set canvas size matching image dimensions
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Determine compression options
      const targetMime = getMimeType(item.format, item.file.type);
      const qualityFactor = item.quality / 100;

      // Perform local canvas blob conversion
      canvas.toBlob((blob) => {
        if (!blob) {
          item.status = 'error';
          updateItemUI(item);
          return;
        }

        // If target size is larger than original and format is same, we fallback to original size for saving.
        // But normally browser compressors do a good job.
        item.compressedBlob = blob;
        
        // Clean previous URL if existed
        if (item.compressedUrl) {
          URL.revokeObjectURL(item.compressedUrl);
        }
        
        item.compressedUrl = URL.createObjectURL(blob);
        item.compressedSize = blob.size;
        item.savingsPercent = Math.round(((item.originalSize - item.compressedSize) / item.originalSize) * 100);
        
        item.status = 'done';
        
        // Update UI
        updateItemUI(item);
        updateStats();
      }, targetMime, targetMime === 'image/png' ? undefined : qualityFactor);
    };

    img.onerror = () => {
      item.status = 'error';
      updateItemUI(item);
    };
  }

  // Format File Size
  function formatSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }

  // Render Image Item Placeholder
  function renderImageItem(item) {
    const safeName = escapeHtml(item.name);
    const itemHtml = `
      <div class="image-item" id="item-${item.id}">
        <div class="img-preview-col">
          <img src="${item.originalUrl}" alt="Preview">
        </div>
        <div class="img-info-col">
          <div class="img-filename" title="${safeName}">${safeName}</div>
          <div class="img-sizes">
            <span class="size-original">${formatSize(item.originalSize)}</span>
            <i class="fa-solid fa-arrow-right size-arrow"></i>
            <span class="size-optimized" id="size-comp-${item.id}">正在压缩...</span>
          </div>
        </div>
        <div class="img-status-col">
          <span class="saving-badge hidden" id="saving-${item.id}">-0%</span>
          <div class="spinner" id="spinner-${item.id}"></div>
          <div class="img-actions">
            <button class="btn-icon action-compare hidden" id="btn-comp-${item.id}" title="对比预览"><i class="fa-solid fa-eye"></i></button>
            <button class="btn-icon action-download hidden" id="btn-dl-${item.id}" title="下载此图"><i class="fa-solid fa-download"></i></button>
            <button class="btn-icon action-delete" id="btn-del-${item.id}" title="移除文件"><i class="fa-solid fa-trash-can"></i></button>
          </div>
        </div>
      </div>
    `;
    imageListContainer.insertAdjacentHTML('beforeend', itemHtml);

    // Bind item events
    document.getElementById(`btn-del-${item.id}`).addEventListener('click', () => {
      deleteItem(item.id);
    });

    document.getElementById(`btn-comp-${item.id}`).addEventListener('click', () => {
      openComparison(item);
    });

    document.getElementById(`btn-dl-${item.id}`).addEventListener('click', () => {
      downloadSingleItem(item);
    });
  }

  // Update item UI elements when processing finishes
  function updateItemUI(item) {
    const itemEl = document.getElementById(`item-${item.id}`);
    if (!itemEl) return;

    const spinner = document.getElementById(`spinner-${item.id}`);
    const sizeComp = document.getElementById(`size-comp-${item.id}`);
    const savingBadge = document.getElementById(`saving-${item.id}`);
    const btnComp = document.getElementById(`btn-comp-${item.id}`);
    const btnDl = document.getElementById(`btn-dl-${item.id}`);

    if (spinner) spinner.classList.add('hidden');

    if (item.status === 'done') {
      sizeComp.textContent = formatSize(item.compressedSize);
      
      // Update badge
      if (item.savingsPercent > 0) {
        savingBadge.textContent = `-${item.savingsPercent}%`;
        savingBadge.className = 'saving-badge';
      } else {
        savingBadge.textContent = `+${Math.abs(item.savingsPercent)}%`;
        savingBadge.className = 'saving-badge badge-gray'; // show gray if it increased slightly (rare)
      }
      savingBadge.classList.remove('hidden');
      
      // Show actions
      btnComp.classList.remove('hidden');
      btnDl.classList.remove('hidden');
    } else if (item.status === 'error') {
      sizeComp.textContent = '压缩失败';
      sizeComp.style.color = 'var(--accent)';
    }
  }

  // Delete individual item
  function deleteItem(id) {
    const index = filesList.findIndex(item => item.id === id);
    if (index !== -1) {
      const item = filesList[index];
      
      // Clean up object URLs to free memory
      if (item.originalUrl) URL.revokeObjectURL(item.originalUrl);
      if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
      
      filesList.splice(index, 1);
      
      // Remove element
      const element = document.getElementById(`item-${id}`);
      if (element) element.remove();
      
      // If list empty, hide workspace
      if (filesList.length === 0) {
        workspaceLayout.classList.add('hidden');
        imageFileInput.value = '';
      }
      
      updateStats();
    }
  }

  // Download Single Item
  function downloadSingleItem(item) {
    if (!item.compressedBlob) return;
    const link = document.createElement('a');
    link.download = getNewFileName(item.name, item.format, item.file.type);
    link.href = item.compressedUrl;
    link.click();
  }

  // Update Global Stats Box
  function updateStats() {
    statCount.textContent = filesList.length;

    const completed = filesList.filter(item => item.status === 'done');
    if (completed.length === 0) {
      statSavings.textContent = '0%';
      statSavedBytes.textContent = '0 KB';
      return;
    }

    const totalOrig = completed.reduce((sum, item) => sum + item.originalSize, 0);
    const totalComp = completed.reduce((sum, item) => sum + item.compressedSize, 0);
    
    if (totalOrig > 0) {
      const savedBytes = totalOrig - totalComp;
      const percent = Math.round((savedBytes / totalOrig) * 100);
      
      statSavings.textContent = `${percent > 0 ? percent : 0}%`;
      statSavedBytes.textContent = formatSize(savedBytes > 0 ? savedBytes : 0);
    } else {
      statSavings.textContent = '0%';
      statSavedBytes.textContent = '0 KB';
    }
  }

  // Global Quality Slider Input
  globalQuality.addEventListener('input', (e) => {
    globalQualityVal.textContent = e.target.value + '%';
  });

  // Global Quality Slider Finish Change
  globalQuality.addEventListener('change', () => {
    const q = parseInt(globalQuality.value, 10);
    filesList.forEach(item => {
      item.quality = q;
      recompressItem(item);
    });
  });

  // Global Format Change
  globalFormat.addEventListener('change', () => {
    const f = globalFormat.value;
    filesList.forEach(item => {
      item.format = f;
      recompressItem(item);
    });
  });

  // Trigger re-compression
  function recompressItem(item) {
    item.status = 'processing';
    
    // Show spinner & hide old buttons
    const spinner = document.getElementById(`spinner-${item.id}`);
    const sizeComp = document.getElementById(`size-comp-${item.id}`);
    const savingBadge = document.getElementById(`saving-${item.id}`);
    const btnComp = document.getElementById(`btn-comp-${item.id}`);
    const btnDl = document.getElementById(`btn-dl-${item.id}`);

    if (spinner) spinner.classList.remove('hidden');
    if (sizeComp) sizeComp.textContent = '正在压缩...';
    if (savingBadge) savingBadge.classList.add('hidden');
    if (btnComp) btnComp.classList.add('hidden');
    if (btnDl) btnDl.classList.add('hidden');

    compressSingleImage(item);
  }

  // Clear All
  btnClearAll.addEventListener('click', () => {
    filesList.forEach(item => {
      if (item.originalUrl) URL.revokeObjectURL(item.originalUrl);
      if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
    });
    
    filesList = [];
    imageListContainer.innerHTML = '';
    workspaceLayout.classList.add('hidden');
    imageFileInput.value = '';
    updateStats();
  });

  // Download All as ZIP
  btnDownloadAll.addEventListener('click', () => {
    const completedItems = filesList.filter(item => item.status === 'done');
    if (completedItems.length === 0) {
      alert('队列中尚无成功压缩的文件！');
      return;
    }

    const originalBtnHtml = btnDownloadAll.innerHTML;
    btnDownloadAll.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 正在打包...';
    btnDownloadAll.disabled = true;

    const zip = new JSZip();
    
    // Add each compressed file into zip
    completedItems.forEach(item => {
      const destName = getNewFileName(item.name, item.format, item.file.type);
      zip.file(destName, item.compressedBlob);
    });

    zip.generateAsync({ type: 'blob' }).then(content => {
      const link = document.createElement('a');
      link.download = '图片极客本地批量压缩包.zip';
      link.href = URL.createObjectURL(content);
      link.click();
      
      // Reset button
      btnDownloadAll.innerHTML = originalBtnHtml;
      btnDownloadAll.disabled = false;
    }).catch(err => {
      console.error(err);
      alert('打包压缩包出错！');
      btnDownloadAll.innerHTML = originalBtnHtml;
      btnDownloadAll.disabled = false;
    });
  });

  // Modal Comparison Logic
  function openComparison(item) {
    modalFilename.textContent = `图片对比: ${item.name}`;
    compareOrigImg.src = item.originalUrl;
    compareCompImg.src = item.compressedUrl;
    compareOrigSize.textContent = formatSize(item.originalSize);
    compareCompSize.textContent = formatSize(item.compressedSize);
    compareSavings.textContent = `${item.savingsPercent > 0 ? item.savingsPercent : 0}%`;
    
    comparisonModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Lock background scroll
  }

  function closeModal() {
    comparisonModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  btnCloseModal.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', closeModal);
  
  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!comparisonModal.classList.contains('hidden')) closeModal();
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
    btnSimulateSuccess.addEventListener('click', () => {
      alert('支付功能尚未接入。请先配置真实支付回调，并在服务端或 Firestore 管理端更新会员状态。');
    });
  }
});
