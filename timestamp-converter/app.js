document.addEventListener('DOMContentLoaded', () => {
  const unixSeconds = document.getElementById('unix-seconds');
  const unixMs = document.getElementById('unix-ms');
  const isoTime = document.getElementById('iso-time');
  const localTime = document.getElementById('local-time');
  const status = document.getElementById('time-status');
  const localReadable = document.getElementById('local-readable');
  const utcReadable = document.getElementById('utc-readable');
  const timezoneReadable = document.getElementById('timezone-readable');
  const btnNow = document.getElementById('btn-now');

  let updating = false;

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function toLocalInputValue(date) {
    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate())
    ].join('-') + 'T' + [
      pad(date.getHours()),
      pad(date.getMinutes())
    ].join(':');
  }

  function setStatus(message, type = '') {
    status.textContent = message;
    status.className = `tool-status ${type}`.trim();
  }

  function render(date) {
    if (Number.isNaN(date.getTime())) {
      setStatus('无法识别这个时间', 'error');
      return;
    }

    updating = true;
    unixSeconds.value = Math.floor(date.getTime() / 1000);
    unixMs.value = date.getTime();
    isoTime.value = date.toISOString();
    localTime.value = toLocalInputValue(date);
    localReadable.textContent = date.toLocaleString();
    utcReadable.textContent = date.toUTCString();
    timezoneReadable.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local timezone';
    updating = false;
    setStatus('转换成功', 'success');
  }

  function parseFrom(source) {
    if (updating) return;
    if (!source.value.trim()) {
      setStatus('请输入一个时间值', 'error');
      return;
    }
    let date;
    if (source === unixSeconds) {
      date = new Date(Number(source.value.trim()) * 1000);
    } else if (source === unixMs) {
      date = new Date(Number(source.value.trim()));
    } else if (source === isoTime) {
      date = new Date(source.value.trim());
    } else {
      date = new Date(source.value);
    }
    render(date);
  }

  [unixSeconds, unixMs, isoTime, localTime].forEach((field) => {
    field.addEventListener('input', () => parseFrom(field));
  });

  btnNow.addEventListener('click', () => render(new Date()));
  render(new Date());
});
