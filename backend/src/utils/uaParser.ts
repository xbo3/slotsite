export interface ParsedUA {
  browser: string;
  browser_version: string;
  os: string;
  os_version: string;
  device_type: string;
  device_model: string;
}

export function parseUserAgent(ua: string): ParsedUA {
  const result: ParsedUA = {
    browser: 'Unknown',
    browser_version: '',
    os: 'Unknown',
    os_version: '',
    device_type: 'desktop',
    device_model: '',
  };

  if (!ua) return result;

  // 브라우저
  if (/Edg\/([\d.]+)/.test(ua)) {
    result.browser = 'Edge';
    result.browser_version = RegExp.$1;
  } else if (/OPR\/([\d.]+)/.test(ua)) {
    result.browser = 'Opera';
    result.browser_version = RegExp.$1;
  } else if (/Chrome\/([\d.]+)/.test(ua)) {
    result.browser = 'Chrome';
    result.browser_version = RegExp.$1;
  } else if (/Firefox\/([\d.]+)/.test(ua)) {
    result.browser = 'Firefox';
    result.browser_version = RegExp.$1;
  } else if (/Version\/([\d.]+).*Safari/.test(ua)) {
    result.browser = 'Safari';
    result.browser_version = RegExp.$1;
  } else if (/MSIE ([\d.]+)/.test(ua) || /Trident.*rv:([\d.]+)/.test(ua)) {
    result.browser = 'IE';
    result.browser_version = RegExp.$1;
  }

  // OS
  if (/Windows NT ([\d.]+)/.test(ua)) {
    result.os = 'Windows';
    const ntVersion = RegExp.$1;
    if (ntVersion === '10.0') result.os_version = '10/11';
    else if (ntVersion === '6.3') result.os_version = '8.1';
    else if (ntVersion === '6.2') result.os_version = '8';
    else if (ntVersion === '6.1') result.os_version = '7';
    else result.os_version = ntVersion;
  } else if (/Mac OS X ([\d_]+)/.test(ua)) {
    result.os = 'macOS';
    result.os_version = RegExp.$1.replace(/_/g, '.');
  } else if (/Android ([\d.]+)/.test(ua)) {
    result.os = 'Android';
    result.os_version = RegExp.$1;
  } else if (/iPhone OS ([\d_]+)/.test(ua)) {
    result.os = 'iOS';
    result.os_version = RegExp.$1.replace(/_/g, '.');
  } else if (/iPad.*OS ([\d_]+)/.test(ua)) {
    result.os = 'iPadOS';
    result.os_version = RegExp.$1.replace(/_/g, '.');
  } else if (/CrOS/.test(ua)) {
    result.os = 'ChromeOS';
  } else if (/Linux/.test(ua)) {
    result.os = 'Linux';
  }

  // 디바이스 타입
  if (/Mobile|Android.*Mobile|iPhone/.test(ua)) {
    result.device_type = 'mobile';
  } else if (/iPad|Android(?!.*Mobile)|Tablet/.test(ua)) {
    result.device_type = 'tablet';
  }

  // 디바이스 모델
  const modelMatch = ua.match(/\((iPhone[^;)]*|iPad[^;)]*|SM-[A-Z]\d+[^;)]*|Pixel \d+[^;)]*|Galaxy [^;)]*)/);
  if (modelMatch) {
    result.device_model = modelMatch[1].trim();
  }

  return result;
}
