document.addEventListener('DOMContentLoaded', () => {
  const countInput = document.getElementById('uuid-count');
  const formatSelect = document.getElementById('uuid-format');
  const output = document.getElementById('uuid-output');
  const status = document.getElementById('uuid-status');
  const btnGenerate = document.getElementById('btn-generate');
  const btnCopy = document.getElementById('btn-copy');
  const btnDownload = document.getElementById('btn-download');

  function fallbackUuid() {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  function createUuid() {
    return crypto.randomUUID ? crypto.randomUUID() : fallbackUuid();
  }

  function formatUuid(uuid) {
    if (formatSelect.value === 'uppercase') return uuid.toUpperCase();
    if (formatSelect.value === 'no-hyphen') return uuid.replaceAll('-', '');
    return uuid;
  }

  function setStatus(message, type = 'success') {
    status.textContent = message;
    status.className = `tool-status ${type}`;
  }

  function generate() {
    const count = Math.min(Math.max(Number(countInput.value) || 1, 1), 100);
    countInput.value = count;
    const uuids = Array.from({ length: count }, () => formatUuid(createUuid()));
    output.value = uuids.join('\n');
    setStatus(`已生成 ${count} 个`);
  }

  async function copyOutput() {
    if (!output.value) generate();
    await navigator.clipboard.writeText(output.value);
    setStatus('已复制');
  }

  function downloadOutput() {
    if (!output.value) generate();
    const blob = new Blob([output.value], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'uuids.txt';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  btnGenerate.addEventListener('click', generate);
  btnCopy.addEventListener('click', copyOutput);
  btnDownload.addEventListener('click', downloadOutput);
  formatSelect.addEventListener('change', generate);
  countInput.addEventListener('change', generate);

  generate();
});
