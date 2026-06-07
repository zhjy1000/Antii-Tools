document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('json-input');
  const output = document.getElementById('json-output');
  const status = document.getElementById('json-status');
  const btnFormat = document.getElementById('btn-format');
  const btnMinify = document.getElementById('btn-minify');
  const btnCopy = document.getElementById('btn-copy');
  const btnDownload = document.getElementById('btn-download');
  const btnClear = document.getElementById('btn-clear');
  const btnLoadSample = document.getElementById('btn-load-sample');

  const sample = {
    name: 'Antii Tools',
    tools: ['Image Optimizer', 'QR Code Forge', 'CSS Design Craft'],
    privacy: { fileUpload: false, processing: 'browser' },
    updatedAt: new Date().toISOString()
  };

  function setStatus(message, type = '') {
    status.textContent = message;
    status.className = `tool-status ${type}`.trim();
  }

  function parseInput() {
    const raw = input.value.trim();
    if (!raw) {
      throw new Error('请先粘贴 JSON 内容。');
    }
    return JSON.parse(raw);
  }

  function transform(mode) {
    try {
      const parsed = parseInput();
      output.value = mode === 'minify'
        ? JSON.stringify(parsed)
        : JSON.stringify(parsed, null, 2);
      setStatus('JSON 有效', 'success');
    } catch (err) {
      output.value = '';
      setStatus(err.message, 'error');
    }
  }

  async function copyOutput() {
    if (!output.value) {
      setStatus('没有可复制的结果', 'error');
      return;
    }
    await navigator.clipboard.writeText(output.value);
    setStatus('已复制到剪贴板', 'success');
  }

  function downloadOutput() {
    if (!output.value) {
      setStatus('没有可下载的结果', 'error');
      return;
    }
    const blob = new Blob([output.value], { type: 'application/json;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'formatted.json';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  btnFormat.addEventListener('click', () => transform('format'));
  btnMinify.addEventListener('click', () => transform('minify'));
  btnCopy.addEventListener('click', copyOutput);
  btnDownload.addEventListener('click', downloadOutput);
  btnClear.addEventListener('click', () => {
    input.value = '';
    output.value = '';
    setStatus('等待输入');
  });
  btnLoadSample.addEventListener('click', () => {
    input.value = JSON.stringify(sample);
    transform('format');
  });

  input.addEventListener('input', () => {
    if (!input.value.trim()) setStatus('等待输入');
  });
});
