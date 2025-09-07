# 文件上传漏洞

文件上传漏洞有两个利用途径：一是直接上传可执行文件（如 PHP）以获取 webshell；二是上传包含 PHP 代码的文件，通过文件包含获取 webshell。

## 常见绕过方法

### 客户端校验绕过

### 文件扩展名检测绕过

- 大小写绕过`pHp`
  - 检查时忽略大小写
- 双写绕过`phphpp`
  - 替换为空，替换后新的字符串为 preg_replace(,'')
- 罕见后缀
  - ^\.ph(p[3457]?|t|tml|ps)$
- 解析特性
  - 1.php.666
  - /1.jpg/1.php

### 文件截断绕过

CVE-2006-7243

> **PHP before 5.3.4** accepts the \0 character in a pathname, which might allow context-dependent attackers to bypass intended access restrictions by placing a safe file extension after this character, as demonstrated by .php\0.jpg at the end of the argument to the file_exists function.

### `Content-Type`检测绕过（MIME绕过）

`Content-Type`是一个 HTTP 头部字段，用于指示资源的原始媒体类型。`MIME`是媒体类型的一种标准。`Content-Type`字段使用`MIME`来表示媒体类型，是使用`MIME`的具体方式。

`MIME`类型的结构包括`类型`和`子类型`两部分，中间用斜杠`/`分割。[点击进一步了解](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Basics_of_HTTP/MIME_types)

`Content-Type`检测绕过方法为，直接修改为`image/png` , `text/plain`等。

- [getimagesize](https://www.php.net/manual/zh/function.getimagesize.php)
  - 在脚本文件开头补充图片对应的头部值，或在图片后写入脚本代码

### 文件内容绕过

- 文件头检测
  - `GIF89a`
- [PHP语言标记](/Web/PHP?id=标记)检测，在`PHP 7`以前版本，通常使用脚本标记`<script language="php"></script>`绕过

## 制作图片马

图片马是指在正常图片中嵌入可执行代码，表面上看起来仍是正常图片。常用制作方法如下：

- 拼接图片和代码

```powershell
<#
copy 是 Windows 命令行中的复制命令
/b 表示以二进制模式复制文件
1.jpg+1.php 表示将 1.jpg 和 1.php 文件的内容合并
2.jpg 是合并后生成的新文件名
#>
copy /b 1.jpg+1.php 2.jpg
```

- 修改图片的元数据

将指定的 PHP 代码作为注释添加到 img.png 图片。

```shell
exiftool -Comment="<?php ... ?>" >> img.png
```

## 条件竞争

先保存文件，再检测文件内容。利用时间差，访问文件。

?> **TODO** 例题

## 从文件上传到其他漏洞

## Zip/Tar文件上传后自动解压缩

## php-gd渲染绕过

## 练习题

- upload labs
- SUCTF 2019 Checkin
- GXYCTF2019BabyUpload
- HarekazeCTF2019 Avatar Uploader

## 经典赛题分析
