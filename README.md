# URL Quick Append Chrome Extension

## Install 安装

You can install it from [Chrome Store](https://chrome.google.com/webstore/detail/url-quick-append/bojlanjcfkfhlnjjdjadkcngddpfloha)

安装链接 [Chrome Store](https://chrome.google.com/webstore/detail/url-quick-append/bojlanjcfkfhlnjjdjadkcngddpfloha)


## Intro 介绍

Sometimes, you have an ID to a Pixiv Image, or a short URL to Baidu Cloud Drive, or only the ID for a Youtube link. Finding the correct link and entering those IDs manually can be very tedious, and I don't want to do them more than once. 

Things gets a lot worse when you have several image IDs to search.

Hence: this light-weight extension, with a minimalistic UI, that remembers the link, allows you to enter multiple pages and open them at once (with lazy load by default!).

百度云盘前面的链接是啥来着？我知道了 B 站 UP 主的 ID 但是前面的链接是啥来着？看 Pixiv 图包视频时不想下载全部，想要快速查看好几张图，怎么办呢？

这个插件让你快速输入多个链接，一次性打开全部（默认点开标签页再加载 "lazy load"），还能记录各种网站的链接前缀不怕再忘，附赠简约风格界面，省时省事还舒心。


## Tip 贴士

When editing the IDs Input box, you can press `Shift+Enter` to quickly open the links

你可以在输入 ID 的时候用 `Shift+Enter` 快速打开链接

### Quick Clean 快速整理

Examples 例子:
```
https://pan.baidu.com/s/ID123456
=> ID123456

链接：https://pan.baidu.com/s/ID123456 提取码: abc4
=> ID123456 + Quick Info Box [abc4]

链接：https://pan.baidu.com/s/ID123456提取码: abc4
=> BLANK + Quick Info Box [abc4]

:a123:b321
=> Quick Info Box [a123] + [b321]
```

## Version Notes

- Version 1.4 Added URL Quick Clean, Added Quick Info Boxes
- Version 1.3.1 Added More Default Search Queries including Youtube and Google
- Version 1.3 Removed "tabs" permission because it was not needed.
- Version 1.2 Fixed Layout Issues for Windows
