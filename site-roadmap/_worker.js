// 访问密码门（Pages Advanced Mode）：所有请求先过密码校验，未通过不返回任何静态内容。
// 密码：默认 8888。正式密码在 Cloudflare 面板 → 项目 Settings → Variables 配置 GATE_PASSWORD（优先于默认值），改完自动生效，无需改代码。

const DEFAULT_PASSWORD = '8888';

async function gateToken(env) {
  const pass = String((env && env.GATE_PASSWORD) || DEFAULT_PASSWORD);
  const data = new TextEncoder().encode('gate::' + pass + '::v1');
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function loginPage(msg) {
  const note = msg
    ? '<p class="err">' + msg + '</p>'
    : '<p class="tip">请输入访问密码</p>';
  const html = '<!DOCTYPE html>\n' +
'<html lang="zh-CN">\n' +
'<head>\n' +
'<meta charset="utf-8">\n' +
'<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
'<meta name="robots" content="noindex, nofollow">\n' +
'<title>访问验证</title>\n' +
'<style>\n' +
'*{box-sizing:border-box}\n' +
'body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f4f6f9;font-family:"Microsoft YaHei","PingFang SC",system-ui,sans-serif;color:#1f2937}\n' +
'.card{background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:34px 38px;width:340px;box-shadow:0 2px 10px rgba(15,23,42,.06)}\n' +
'h1{margin:0 0 6px;font-size:19px;color:#0f2d5c}\n' +
'p{font-size:13.5px;color:#64748b;margin:0 0 16px}\n' +
'.err{color:#b91c1c;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:7px 11px;margin-bottom:14px}\n' +
'input[type=password]{width:100%;font-size:16px;padding:10px 12px;border:1px solid #cbd5e1;border-radius:9px;outline:none;letter-spacing:2px}\n' +
'input[type=password]:focus{border-color:#1d4ed8;box-shadow:0 0 0 3px rgba(29,78,216,.12)}\n' +
'button{width:100%;margin-top:14px;padding:10px;font-size:15px;font-weight:700;color:#fff;background:#1d4ed8;border:0;border-radius:9px;cursor:pointer}\n' +
'button:hover{background:#1e40af}\n' +
'</style>\n' +
'</head>\n' +
'<body>\n' +
'<div class="card">\n' +
'  <h1>🔒 访问验证</h1>\n' +
'  ' + note + '\n' +
'  <form method="POST">\n' +
'    <input type="password" name="password" placeholder="访问密码" autofocus required>\n' +
'    <button type="submit">进入</button>\n' +
'  </form>\n' +
'</div>\n' +
'</body>\n' +
'</html>';
  return new Response(html, {
    status: 401,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const expected = 'gate=' + (await gateToken(env));
    const cookies = request.headers.get('Cookie') || '';

    // 报价单已迁移至独立站点（chongshi-quotation.pages.dev），旧路径一律撤除；
    // 同时阻断旧部署可能遗留的边缘缓存条目（Worker 先于缓存执行，命中此分支即不再触达缓存）。
    if (url.pathname === '/quotation' || url.pathname === '/quotation.html') {
      return new Response('404 Not Found: 该页面已迁移至独立站点。', {
        status: 404,
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }
      });
    }

    // 已通过验证：正常返回静态资源
    if (cookies.includes(expected)) {
      let resp = await env.ASSETS.fetch(request);
      if (resp.status === 404 && !url.pathname.includes('.')) {
        resp = await env.ASSETS.fetch(new URL(url.pathname + '.html', url));
      }
      return resp;
    }

    // 提交密码
    if (request.method === 'POST') {
      const form = await request.formData();
      const pass = String((env && env.GATE_PASSWORD) || DEFAULT_PASSWORD);
      if (String(form.get('password') || '').trim() === pass) {
        const resp = new Response(null, { status: 302, headers: { 'Location': url.pathname } });
        resp.headers.append('Set-Cookie',
          expected + '; HttpOnly; Path=/; Max-Age=604800; Secure; SameSite=Lax');
        return resp;
      }
      return loginPage('密码错误，请重试');
    }

    // 未登录：只给登录页，不泄露任何内容
    return loginPage(null);
  }
};
