# QuantumultX

Quantumult X 分流规则聚合,输出 **proxy / direct** 两组规则文件,外加手动维护的 **plus** 补充规则,保持 Quantumult X 配置简洁,无需在配置里写大量规则。

数据源:**blackmatrix7/ios_rule_script**(QuantumultX 规则),每日北京时间 06:00 自动更新。

## 规则集

| 文件 | 用途 | 内容 |
|---|---|---|
| `rules_proxy.list` | 代理 | Amazon, Facebook, Google, GoogleEarth, GoogleVoice, Notion, Twitter, OpenAI |
| `rules_direct.list` | 直连 | Alibaba, Apple, JingDong, Microsoft, Tencent |
| `rules_plus.list` | 补充(手动维护) | 苹果推送、Bilibili 优化、Homebrew、媒体与广告拦截等 |

格式为 Quantumult X filter 文本,每行一条规则(`HOST-SUFFIX,` / `HOST,` / `HOST-WILDCARD,` / `IP-CIDR,`),策略组已统一重写为 `proxy` / `direct`。

## 用法

在 Quantumult X 配置的 `[filter_remote]` 中远程引用:

```
[filter_remote]
https://raw.githubusercontent.com/m6506659306/QuantumultX/main/rules_proxy.list, tag=proxy, update-interval=86400, force-policy=proxy
https://raw.githubusercontent.com/m6506659306/QuantumultX/main/rules_direct.list, tag=direct, update-interval=86400, force-policy=direct
```

> `force-policy` 会覆盖文件内每行的策略组名,把该文件所有规则强制导向你指定的策略组。若你的策略组名就是 `proxy` / `direct`,可省略;名称不同时请务必加上。

`rules_plus.list` 为手动维护的补充规则,建议粘贴到 `[filter_local]`(它是手动维护的,不会随自动更新变化)。

## 维护

- **增减分类**:编辑 `source_proxy.txt` / `source_direct.txt`,每行一个上游规则文件 URL,等每日自动更新即可
- 上游规则参考:<https://github.com/blackmatrix7/ios_rule_script/tree/master/rule/QuantumultX>
- 生成物 `rules_proxy.list` / `rules_direct.list` 为自动产物,请勿手改
- `rules_plus.list` 为手动维护文件,可直接编辑(自动更新不会覆盖它)

## 项目结构

```
rules_proxy.list      # 自动生成:代理规则(勿手改)
rules_direct.list     # 自动生成:直连规则(勿手改)
rules_plus.list       # 手动维护:补充规则(苹果推送、B站、广告拦截等)
source_proxy.txt      # proxy 上游规则 URL 清单
source_direct.txt     # direct 上游规则 URL 清单
response.bundle.custom.js         # 自建脚本:BiliBili 增强(被下面的 snippet 引用)
BiliBili.Enhanced.custom.snippet  # Quantumult X snippet:重写 + MITM 声明
.github/workflows/auto_merge.yml  # 每日北京时间 06:00 自动更新
```
