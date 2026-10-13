// Surge Panel: IP 纯净度 (ip.cx) — iOS / macOS 通用
const args = Object.fromEntries((typeof $argument === 'string' ? $argument : '')
  .split('&').filter(Boolean).map(kv => kv.split('=').map(decodeURIComponent)));
const req = {
  url: 'https://ip.cx/',
  timeout: 12,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    'Accept-Language': 'zh-CN,zh;q=0.9'
  }
};
if (args.policy && args.policy !== '{{{POLICY}}}') req.policy = args.policy;

const strip = s => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

$httpClient.get(req, (err, resp, body) => {
  if (err || !body) return $done({ title: 'IP 纯净度', content: '请求失败：' + (err || '空响应'), icon: 'exclamationmark.triangle', 'icon-color': '#FF3B30' });
  const ip = (body.match(/<title>\s*([0-9a-fA-F:.]+)\s/) || [])[1] || '未知';
  const f = {};
  const re = /class="row__label"[^>]*>([\s\S]*?)<\/\w+>[\s\S]*?class="row__value"[^>]*>([\s\S]*?)<\/div>/g;
  let m;
  while ((m = re.exec(body))) f[strip(m[1])] = strip(m[2]);
  const score = parseInt((body.match(/IP 评分 (\d+) 分/) || [])[1] || (f['IP 评分'] || '').match(/\d+/), 10);
  const color = isNaN(score) ? '#8E8E93' : score >= 80 ? '#34C759' : score >= 50 ? '#FF9500' : '#FF3B30';
  const grade = isNaN(score) ? '' : score >= 80 ? '纯净' : score >= 50 ? '一般' : '较差';
  const lines = [
    `IP：${ip}`,
    `位置：${[f['国家/地区'], f['城市']].filter(Boolean).join(' ')}`,
    `ISP：${f['ISP'] || '-'}`,
    `ASN：${(f['ASN'] || '-').replace(/\s*\[.*\]/, '')}`,
    `类型：${f['IP 类型'] || '-'}`,
    `评分：${isNaN(score) ? '-' : score + '/100 ' + grade}`,
    `威胁：${f['威胁状态'] || '-'}　代理：${f['代理状态'] || '-'}`
  ];
  $done({
    title: 'IP 纯净度' + (args.policy && args.policy !== '{{{POLICY}}}' ? ` · ${args.policy}` : ''),
    content: lines.join('\n'),
    icon: (args.icon && args.icon !== '{{{ICON}}}') ? args.icon : 'checkmark.shield',
    'icon-color': color
  });
});
