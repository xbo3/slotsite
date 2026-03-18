/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
export async function collectFingerprint(): Promise<Record<string, unknown>> {
  const data: Record<string, unknown> = {};

  // 화면
  data.screen_width = screen.width;
  data.screen_height = screen.height;
  data.viewport_width = window.innerWidth;
  data.viewport_height = window.innerHeight;
  data.pixel_ratio = window.devicePixelRatio;
  data.color_depth = screen.colorDepth;

  // 시스템
  data.language = navigator.language;
  data.languages = JSON.stringify(Array.from(navigator.languages));
  data.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  data.timezone_offset = new Date().getTimezoneOffset();
  data.platform = navigator.platform;

  // 하드웨어
  data.cpu_cores = navigator.hardwareConcurrency || null;
  data.memory_gb = (navigator as any).deviceMemory || null;
  data.touch_support = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  data.max_touch = navigator.maxTouchPoints;

  // 네트워크
  const conn = (navigator as any).connection;
  if (conn) {
    data.connection_type = conn.effectiveType || null;
    data.downlink = conn.downlink || null;
  }

  // 브라우저 기능
  data.cookies_enabled = navigator.cookieEnabled;
  data.do_not_track = navigator.doNotTrack === '1';

  // Canvas 핑거프린트
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      canvas.width = 200;
      canvas.height = 50;
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('fingerprint', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('fingerprint', 4, 17);
      data.canvas_hash = await hashString(canvas.toDataURL());
    }
  } catch (_) { /* canvas not supported */ }

  // WebGL 핑거프린트
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl && gl instanceof WebGLRenderingContext) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        data.webgl_vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        data.webgl_renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
      data.webgl_hash = await hashString(
        String(gl.getParameter(gl.RENDERER)) + String(gl.getParameter(gl.VENDOR))
      );
    }
  } catch (_) { /* webgl not supported */ }

  // AudioContext 핑거프린트
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      const audioCtx = new AudioCtx();
      const oscillator = audioCtx.createOscillator();
      const analyser = audioCtx.createAnalyser();
      const gain = audioCtx.createGain();
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(10000, audioCtx.currentTime);
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      oscillator.connect(analyser);
      analyser.connect(processor);
      processor.connect(gain);
      gain.connect(audioCtx.destination);
      const audioData = new Float32Array(analyser.frequencyBinCount);
      analyser.getFloatFrequencyData(audioData);
      data.audio_hash = await hashString(audioData.toString());
      processor.disconnect();
      gain.disconnect();
      analyser.disconnect();
      oscillator.disconnect();
      audioCtx.close();
    }
  } catch (_) { /* audio not supported */ }

  // 폰트 탐지
  try {
    const fonts = [
      'Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia',
      'Palatino', 'Garamond', 'Comic Sans MS', 'Impact', 'Lucida Console',
      'Tahoma', 'Trebuchet MS', 'Malgun Gothic', 'Gulim', 'Batang',
      'Dotum', 'NanumGothic', 'AppleGothic', 'Helvetica Neue', 'Segoe UI',
    ];
    const detected: string[] = [];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const testStr = 'mmmmmmmmmmlli';
      for (const font of fonts) {
        ctx.font = '72px monospace';
        const w1 = ctx.measureText(testStr).width;
        ctx.font = `72px '${font}', monospace`;
        const w2 = ctx.measureText(testStr).width;
        if (w1 !== w2) detected.push(font);
      }
    }
    data.font_hash = await hashString(detected.join(','));
  } catch (_) { /* font detection failed */ }

  // 배터리
  try {
    if ('getBattery' in navigator) {
      const battery = await (navigator as any).getBattery();
      data.battery_level = battery.level;
      data.battery_charging = battery.charging;
    }
  } catch (_) { /* battery API not available */ }

  // 광고 차단 탐지
  try {
    const ad = document.createElement('div');
    ad.innerHTML = '&nbsp;';
    ad.className = 'adsbox ad-banner';
    ad.style.position = 'absolute';
    ad.style.top = '-9999px';
    ad.style.left = '-9999px';
    document.body.appendChild(ad);
    await new Promise((r) => setTimeout(r, 100));
    data.adblock = ad.offsetHeight === 0;
    document.body.removeChild(ad);
  } catch (_) {
    data.adblock = false;
  }

  // 방문 정보
  data.referrer = document.referrer || null;
  data.landing_page = window.location.pathname;

  // UTM 파라미터
  const params = new URLSearchParams(window.location.search);
  data.utm_source = params.get('utm_source');
  data.utm_medium = params.get('utm_medium');
  data.utm_campaign = params.get('utm_campaign');

  return data;
}

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const buf = encoder.encode(str);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .substring(0, 32);
}
