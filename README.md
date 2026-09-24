# QuantumultX

Quantumult X 分流规则聚合,输出 **proxy / direct** 两组规则文件,外加手动维护的 **plus** 补充规则,保持 Quantumult X 配置简洁,无需在配置里写大量规则。

数据源:**blackmatrix7/ios_rule_script**(QuantumultX 规则),每日北京时间 06:00 自动更新。

## 目录

| 目录 | 内容 |
|---|---|
| `Filter/` | 分流规则:上游清单、自动生成产物、手动补充规则 |
| `Rewrite/` | 重写规则、脚本与 snippet |
| `SOURCES.md` | 自持文件的来源、本地改动与 sha256 校验值 |

## 规则集

| 文件 | 用途 | 内容 |
|---|---|---|
| `Filter/rules_proxy.list` | 代理 | Amazon, Facebook, Google, GoogleEarth, GoogleVoice, Notion, Twitter, OpenAI |
| `Filter/rules_direct.list` | 直连 | Alibaba, Apple, JingDong, Microsoft, Tencent |
| `Filter/rules_plus.list` | 补充(手动维护) | 苹果推送、Bilibili 优化、Homebrew、媒体与广告拦截等 |

格式为 Quantumult X filter 文本,每行一条规则(`HOST-SUFFIX,` / `HOST,` / `HOST-WILDCARD,` / `IP-CIDR,`),策略组已统一重写为 `proxy` / `direct`。

## 用法

在 Quantumult X 配置的 `[filter_remote]` 中远程引用:

```
[filter_remote]
https://raw.githubusercontent.com/m6506659306/QuantumultX/main/Filter/rules_proxy.list, tag=proxy, update-interval=86400, force-policy=proxy
https://raw.githubusercontent.com/m6506659306/QuantumultX/main/Filter/rules_direct.list, tag=direct, update-interval=86400, force-policy=direct
```

> `force-policy` 会覆盖文件内每行的策略组名,把该文件所有规则强制导向你指定的策略组。若你的策略组名就是 `proxy` / `direct`,可省略;名称不同时请务必加上。

`Filter/rules_plus.list` 为手动维护的补充规则,建议粘贴到 `[filter_local]`(它是手动维护的,不会随自动更新变化)。

## 重写

| 文件 | 用途 | MitM 要求 |
|---|---|---|
| `Rewrite/DoubanAds.conf` | 豆瓣 App 去广告:2 条域名级 `reject` + 6 条广告接口 `reject-dict` + 1 条素材 `reject-img` | 域名级不需要;`url` 规则需覆盖文件内 `hostname` 列的 11 个域 |
| `Rewrite/YoutubeAds.conf` | YouTube 去广告:视频 / 瀑布流 / 搜索页 / 播放页 / 短视频 / 贴片,含视频自动 PIP、后台播放 | 需覆盖文件内 `hostname` 列的 `*.googlevideo.com`、`www.youtube.com` 等 5 项;上游注明不适用允许 UDP 转发的节点 |
| `Rewrite/BiliBili.Enhanced.custom.snippet` | BiliBili 增强 snippet(重写规则 + MITM 声明) | 需要(`mitm` 段已声明) |
| `Rewrite/Biliverse.Enhanced.QX.analyze-fix.snippet` | BiliBili 增强 0.6.0 QX 版:界面自定义 + 设置面板 + MITM 声明;面板后端动作 `script-analyze-echo-response`,7 处脚本引用指向 `Rewrite/vendor/` | 需要(`mitm` 段已声明,4 个域) |

> 两份 BiliBili 增强 snippet 的匹配路径重叠(`x/resource/show/tab/v2`、`x/v2/account/mine`、`x/v2/region/index`、`x/v2/channel/region/list`),同时启用会让同一响应被两个脚本先后处理,请只保留一份。

远程引用(Quantumult X:设置 → 重写 → 添加 → 从 URL 导入):

```
https://raw.githubusercontent.com/m6506659306/QuantumultX/main/Rewrite/DoubanAds.conf
https://raw.githubusercontent.com/m6506659306/QuantumultX/main/Rewrite/YoutubeAds.conf
https://raw.githubusercontent.com/m6506659306/QuantumultX/main/Rewrite/Biliverse.Enhanced.QX.analyze-fix.snippet
```

`Rewrite/YoutubeAds.conf` 第 23 行与 `Rewrite/BiliBili.Enhanced.custom.snippet` 各条 `script-response-body` 均指向本仓内的脚本副本(`Rewrite/youtube.response.js`、`Rewrite/response.bundle.custom.js`)。

这些自持文件的来源、本地改动与 sha256 校验值登记在 `SOURCES.md`。

## 维护

- **增减分类**:编辑 `Filter/source_proxy.txt` / `Filter/source_direct.txt`,每行一个上游规则文件 URL,等每日自动更新即可
- 上游规则参考:<https://github.com/blackmatrix7/ios_rule_script/tree/master/rule/QuantumultX>
- 生成物 `Filter/rules_proxy.list` / `Filter/rules_direct.list` 为自动产物,请勿手改
- `Filter/rules_plus.list` 为手动维护文件,可直接编辑(自动更新不会覆盖它)

## 项目结构

```
Filter/
  rules_proxy.list    # 自动生成:代理规则(勿手改)
  rules_direct.list   # 自动生成:直连规则(勿手改)
  rules_plus.list     # 手动维护:补充规则(苹果推送、B站、广告拦截等)
  source_proxy.txt    # proxy 上游规则 URL 清单
  source_direct.txt   # direct 上游规则 URL 清单
Rewrite/
  DoubanAds.conf                    # 豆瓣 App 去广告(域名级 reject + 接口 reject-dict)
  YoutubeAds.conf                   # YouTube 去广告(脚本引用指向同目录 youtube.response.js)
  youtube.response.js               # 上游 Maasea/sgmodule 脚本的自持副本
  response.bundle.custom.js         # 自建脚本:BiliBili 增强(被下面的 snippet 引用)
  BiliBili.Enhanced.custom.snippet  # Quantumult X snippet:重写 + MITM 声明
  Biliverse.Enhanced.QX.analyze-fix.snippet  # Quantumult X snippet:BiliBili 增强 0.6.0(界面 + 设置面板)
  vendor/                           # 上述 snippet 引用的上游脚本自持副本
    Biliverse/Enhanced/             #   response.bundle.js / request.bundle.js / settings/index.mjs
    NSNanoCat/PreferencePanes/      #   api.js / index.mjs / navigation.mjs
SOURCES.md                          # 自持文件的来源、本地改动与校验值
README.md
.github/workflows/auto_merge.yml    # 每日北京时间 06:00 自动更新
```
