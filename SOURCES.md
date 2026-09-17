# 自持文件说明

本仓 `Filter/` 与 `Rewrite/` 的部分文件是从上游自持的副本（上游删库 / 转私有后仍可用）。此文件登记它们的来源、本地改动与校验值；**搬新文件进来之前先看这里，避免重复自持。**

## `Rewrite/DoubanAds.conf`

- 用途：豆瓣 App 去广告（2 条域名级 `reject` + 5 条广告接口 `reject-dict`）
- 作者与出处：原作者奶思；取自 `fmz200/wool_scripts` 的 `QuantumultX/rewrite/split/partD/Douban.snippet`（上游 commit `6f218c9c`，2025-10-18；规则正文最后变更为 2025-09-14，commit `2f95d39`，即新增 `erebor.douban.com`、`ad.doubanio.com` 两条域名级 reject 的那次）
- 抓取时间：2026-09-17 ｜ 本副本 sha256：`3937560eb9f017e9e6de3c7190093d23acb1491e5645a3612adfe84341441232`
- 处理方式：去掉上游 `#!` 元数据头，改写为 UserScript 注释头，规则正文照录
- 本地改动：
  1. 新增接口拦截 `^https?:\/\/frodo\.douban\.com\/api\/v2\/erebor\/ url reject-dict`。抓包实测该接口返回 7 KB 广告数据且直连未被拦；上游只覆盖 `frodo.douban.com/api/v2/movie/banner`，路径不匹配。
  2. `hostname` 由上游的 `api.douban.com` 补全为实际需要的 7 个域，否则 5 条 `url` 规则在 MitM 未覆盖这些域时静默失效。
- 上游 `#!date` 字段已被其 split 脚本清空（值为 `undefined`），不能当作更新时间。
- 迁移：原在 `m6506659306/Rewrite` 的 `AdBlock/DoubanAds.conf`，已整体转入本仓。

## `Rewrite/YoutubeAds.conf` + `Rewrite/youtube.response.js`

- 用途：YouTube 视频 / 瀑布流 / 搜索页 / 播放页 / 短视频 / 贴片广告拦截，含视频自动 PIP、后台播放、自动翻译。上游注释称不适用允许 UDP 转发的节点及 Premium。
- 作者与出处：`@DivineEngine, @app2smile, @Maasea, @VirgilClyne`；来自 `ddgksf2013/Rewrite` 的 `AdBlock/YoutubeAds.conf`。脚本上游为 `Maasea/sgmodule` 的 `Script/Youtube/youtube.response.js`（commit `65075cdb`，2026-07-19，blob sha `becad8eaa6094c189ea8db6d644de68ac2d66f61`，抓取 2026-09-15）。
- 脚本校验：上游 sha256 `f98483d5f5017514f82502253c0db5ce2d4ffb7839887aa2cadc22666f5a7f12`；本副本 sha256 `6f708726830487fe8170eaaa64a18c32d124e443c3e896ed3e0f63b74fc6520f`
- 本地改动：
  1. `youtube.response.js` 第 1 行 `ai()` 内默认参数 `blockShorts:!1` 改为 `blockShorts:!0`（移除导航栏 Shorts 入口）。改动仅 1 个字符，文件长度不变（132,973 B），除该字符外与上游逐字节一致。
  2. `YoutubeAds.conf` 第 23 行 `script-response-body` 的目标改为本仓 `Rewrite/youtube.response.js`。
- 开关（`ai()` 默认值）：`blockUpload` 上游 true / 本副本 true（移除底部上传按钮）；`blockImmersive` true / true（移除 YouTube Music 沉浸页入口）；`blockShorts` 上游 false / 本副本 true。
- 脚本内部无运行时外部依赖；本仓的 YouTube 去广告链路已自持。
- 迁移：原在 `m6506659306/Rewrite` 的 `AdBlock/YoutubeAds.conf` 与 `Scripts/youtube.response.js`，已整体转入本仓。

## `Rewrite/BiliBili.Enhanced.custom.snippet` + `Rewrite/response.bundle.custom.js`

- 用途：BiliBili 增强（重写 + MITM 声明），原项目 BiliUniverse/Enhanced（作者 VirgilClyne），本地为 custom 改版；snippet 内各条 `script-response-body` 指向本仓 `Rewrite/response.bundle.custom.js`。
- 来源与改动记录见该 snippet 头部的 `#!` 字段（`#!date`、`#!version` 由上游脚本填写，不可当作本仓更新时间）。

## 维护约定

- 上游脚本 / 规则更新后，改动本副本前先核对其 blob sha 与 sha256，并把新的校验值写回本文件。
- 本仓不做 `gh repo sync`（它不是 fork）；上游更新靠手工比对，《远端仓库检索》流程见 Hermes 技能 `remote-repo-inspection`。
