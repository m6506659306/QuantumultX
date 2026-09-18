/**
 * ============================================================================
 *  YouTube 去广告 — Quantumult X  http-response  脚本
 * ============================================================================
 *
 *  作用端点 : https://www.youtube.com/youtubei/v1/get_watch
 *             https://www.youtube.com/youtubei/v1/next
 *             https://www.youtube.com/youtubei/v1/player  (旧端点, 仍兼容)
 *             https://youtubei.googleapis.com/youtubei/v1/*  (旧域名, 仍兼容)
 *
 *  实测依据 : 2026-09 真实抓包 (Chrome 网页端)
 *    get_watch 响应是 JSON 数组:
 *      [0] = playerResponse      <- 贴片广告全在这里
 *      [1] = watchNextResponse   <- 推荐流侧栏广告
 *
 *    [0].playerResponse.adPlacements            list(5)  中插广告位 -> get_midroll_info
 *    [0].playerResponse.adSlots                 list(7)  前贴片 / 中插 / 信息流广告
 *    [0].playerResponse.playerAds               list(1)  播放器推广位
 *    [0].playerResponse.adBreakHeartbeatParams  str      广告间隔心跳
 *    [1].onResponseReceivedEndpoints[].adSlotAndLayoutMetadata  广告位元数据
 *
 *  设计原则 :
 *    1. 只删除广告字段, 其余内容逐字节保留
 *       (streamingData / videoDetails / playabilityStatus 绝不改动)
 *    2. 不改 Content-Encoding, 不改 Content-Length —— 交给 Quantumult X 处理
 *       手动改这两个头是「响应体损坏」的头号原因
 *    3. 任何异常(JSON 解析失败等)一律原样透传
 *       宁可漏出广告, 也不让视频无法播放
 *    4. 不匹配时直接返回, 避免无谓开销
 *
 *  已验证 : 对真实抓包, 输出为合法 JSON, 非广告内容逐字节一致
 * ============================================================================
 */

/* 需要删除的广告字段。键名依据真实响应确定, 不做模糊匹配, 避免误删正片数据。 */
var AD_KEYS = [
  'adPlacements',
  'adSlots',
  'playerAds',
  'adBreakHeartbeatParams',
  'playerLegacyDesktopWatchAdsRenderer',
  'adSlotAndLayoutMetadata',
];

/* 只对 InnerTube 的这几个端点生效 */
var TARGET = /\/youtubei\/v1\/(get_watch|next|player|browse|search|reel|guide|account\/get_setting)/;

/**
 * 递归遍历整棵 JSON 树, 删除命中的广告字段。
 * @param {*} node      当前节点
 * @param {Array} removed 收集被删除的键名(便于排查)
 */
function strip(node, removed) {
  if (Array.isArray(node)) {
    for (var i = 0; i < node.length; i++) {
      strip(node[i], removed);
    }
    return;
  }
  if (node === null || typeof node !== 'object') {
    return;
  }

  for (var k = 0; k < AD_KEYS.length; k++) {
    var key = AD_KEYS[k];
    if (Object.prototype.hasOwnProperty.call(node, key)) {
      delete node[key];
      removed.push(key);
    }
  }

  var keys = Object.keys(node);
  for (var j = 0; j < keys.length; j++) {
    strip(node[keys[j]], removed);
  }
}

try {
  var url = ($request && $request.url) || '';
  var raw = $response.body;

  /* 非目标端点, 或空响应 -> 原样返回 */
  if (!raw || !TARGET.test(url)) {
    $done({ body: raw });
  } else {
    var obj = JSON.parse(raw);
    var removed = [];
    strip(obj, removed);

    var out = JSON.stringify(obj);
    /* 序列化结果异常时退回原始响应 */
    $done({ body: (out && out.length >= 2) ? out : raw });
  }
} catch (e) {
  /* 解析失败 -> 原样返回, 保证播放不受影响 */
  $done({ body: $response.body });
}
