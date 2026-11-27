# 动漫屋 / 漫画人

> 版本 `0.2.0` 面向核心 4.x：返回页面可取得的作品标题、作者、简介、标签和公共封面；读者页提供作品链接时关联规范目录，以完整目录序号命名。缺失元数据不影响下载，图片签名不进入公开元数据。归档和进度见[核心 API](https://yinyanfr.github.io/comic-dl/guide/service-api/)。

[English](README.en.md)

`@comic-dl/dm5` 是 [comic-dl](https://github.com/yinyanfr/comic-dl) 的动漫屋与漫画人共用源。它通过动漫屋网页搜索、列章和下载公开章节，也接受漫画人的作品和章节链接。同一章用两个站点的链接下载到同一目录时共用一个 CBZ。需要登录或购买的章节不受支持。

## 使用

按 [comic-dl 快速入门](https://yinyanfr.github.io/comic-dl/guide/quickstart/) 安装 CLI，再运行：

```sh
comic-dl add @comic-dl/dm5
comic-dl search 妖神记 --source dm5
comic-dl list 'https://www.manhuaren.com/manhua-yaoshenji/'
comic-dl chapter 'https://www.dm5.com/m426475/' -o ./downloads
```
