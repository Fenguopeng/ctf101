# 信息泄露

在 CTF 比赛中，信息泄露通常是出题人**故意设置**的，这些泄露可以帮助选手**获得提示、源代码**等信息，从而降低题目难度或进行深入代码审计。
可能的信息来源包括：

- 网页源代码（注释）和响应头
- robots.txt
- 网站备份文件，如`www.zip`、`index.php.bak`
- 版本控制目录，如`.git`、`.svn`
- 开发环境遗留文件
  - 临时文件（`vi`、`vim`、`gedit`生成的文件）
  - `.DS_store`文件
  - `.idea`文件夹
  - 文件读取（包含）漏洞

?> 安装[Wappalyzer](https://www.wappalyzer.com/)插件以识别网站所用的技术

## 目录扫描

通过扫描工具进行暴力目录探测

[dirsearch](https://github.com/maurosoria/dirsearch)是一款命令行风格的网站目录扫描工具

```shell
python3 dirsearch.py -e php -u http://example.com
```

## `.git`目录

Git 一个免费的开源分布式版本控制系统，[了解更多](https://www.liaoxuefeng.com/wiki/896043488029600)

如果存在`.git`目录，可以还原构建工程源代码

1. [GitHacker](https://github.com/WangYihang/GitHacker)
2. [GitHack](https://github.com/lijiejie/GitHack)

```shell
// 查看提交记录
git reflog 

// 版本回滚
git reset --hard [log hash]
```

此外，`.gitignore`文件保存 git 忽略的文件或目录，也可能有敏感信息

扩展阅读，[别想偷我源码：通用的针对源码泄露利用程序的反制（常见工具集体沦陷）](https://drivertom.blogspot.com/2021/08/git.html)

> [Git Cola](https://git-cola.github.io/)一款免费的git图形工具

例题

1. [Lab: Information disclosure in version control history](https://portswigger.net/web-security/information-disclosure/exploiting/lab-infoleak-in-version-control-history)

## `.idea`目录

JetBrains 公司出品的 IDE，如 PyCharm、IntelliJ IDEA、PhpStorm 等，会在项目根目录下创建`.idea`文件夹，用于保存项目的特定配置文件，包含文件变更、版本控制、调试信息等。

重点关注`workspace.xml`文件，可能会暴露文件名称

- FileEditorManager
- ChangeListManager
- editorHistoryManager

## 编辑器的临时文件

`vi`和`gedit`是 Linux 系统上常用的文本编辑器。`SWAP`文件是`vi`或其变体（如`vim`）创建，存储了正在编辑文件的恢复版本。会话开始时，编辑器会在当前目录创建一个临时文件，例如`.index.php.swp`。如果编辑器意外退出，该文件将会保留下来，用户可以通过特定命令进行恢复。

```shell
vim -r index.php
```

> 如果`.swp`文件已经存在，将会创建`.swo`、`.swn`等后缀的文件

`gedit`编辑器保存后，会创建一个`~`后缀的文件作为保存前的副本，如`index.php~`。

<!--
[.SWP File Extension](https://fileinfo.com/extension/swp)
-->

## `.DS_Store`文件

`.DS_Store`(Desktop Services Store) 是一种由苹果公司的 Mac OS X 操作系统生成的隐藏文件，用于存储目录的自定义属性，如文件图标位置和背景色。该文件由 Finder 创建和维护，类似于 Microsoft Windows 中的 desktop.ini 文件。分析`.DS_Store`文件可以恢复目录结构。相关工具包括：

1. [Python-dsstore](https://github.com/gehaxelt/Python-dsstore) - Python .DS_Store parser
2. [ds_store_exp](https://github.com/lijiejie/ds_store_exp) - 一个 .DS_Store 文件泄漏利用脚本，它解析`.DS_Store`文件并递归地下载文件
