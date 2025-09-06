# 文档隐写

## Office文档隐写

自 Office 2007 起，微软采用了 Office Open XML (OOXML) 文件格式。常见的 `.docx`、`.xlsx`、`.pptx` 文件，实际上都是一种特殊的 ZIP 压缩包，内部包含了众多以 `.xml` 结尾的文件和文件夹。

```
[Content_Types].xml
_rels/
docProps/
word/    或  xl/  或  ppt/
```

`[Content_Types].xml`描述整个包中包含的所有部件及其内容类型。用于告诉 Office 如何解析各类数据。

`_rels/`目录包含包级关系文件（如 `.rels`），指明文件之间的关联关系（例如正文和图片、宏的关系）。

`docProps/`目录包括文档属性，如作者、标题、创建时间、修改时间等元数据。`core.xml`：核心属性;`app.xml`：应用属性。

`word/`或`xl/`或`ppt/`主目录存放文档主体内容。

针对 Word 文档，常见文件包括：

- `document.xml`：正文内容
- `styles.xml`：样式定义
- `settings.xml`：文档设置
- `numbering.xml`：编号信息
- `footnotes.xml` / `endnotes.xml`：脚注、尾注
- `media/`：嵌入的图片、对象等二进制文件

针对 Excel 文档，常见文件包括：

- `workbook.xml`：工作簿信息
- `worksheets/`：各个工作表（如 `sheet1.xml`）
- `styles.xml`：样式
- `sharedStrings.xml`：所有共享字符串
- `media/`：嵌入图片等

针对 PowerPoint 文档，常见文件包括：

- `presentation.xml`：演示文稿结构
- `slides/`：所有幻灯片（如 slide1.xml）
- `slideLayouts/` 和 `slideMasters/`：幻灯片布局和母版
- `notesSlides/`：备注
- `media/`：嵌入的图片或视频

- 在`Word`中`隐藏文字`

选择需要隐藏的字，右键选择`字体`，勾选`隐藏文字`。
在选项中，选择`显示`>`隐藏文字`。

文档密码破解

### 例题分析：[CISCN 2024]神秘的文件

<https://github.com/CTF-Archives/2024-CISCN-Quals?tab=readme-ov-file#day1-%E7%A5%9E%E7%A7%98%E6%96%87%E4%BB%B6>

- `core.xml`核心属性，`QFCfpPQ6ZymuM3gq`、`Key:lanjing`，得`Part1:flag{e`
- 内嵌有`Word`文档， <https://gchq.github.io/CyberChef/#recipe=ROT13(true,true,true,-10)From_Base64('A-Za-z0-9%2B/%3D',true,false)&input=bVFQaW5OUzZYdG0xSkdKcw&ieol=CR&oeol=CR>，`part2:675efb`
- 宏，RC4，`PArt3:3-34`
- 第三页，<https://gchq.github.io/CyberChef/#recipe=From_Base64('A-Za-z0-9%2B/%3D',true,false)&input=VUdGNWREUTZObVl0TkRBPQ&ieol=CR&oeol=CR>，`Payt4:6f-40`
- 第 5 页，备注，`pArt5:5f-90d`
- 第 5 页左上角，`ParT6:d-2`
- `slides\slides4.xml`, `PART7=22b3`
- `slideLayout2.xml`，`paRt8:87e`
- `image57.jpg`，`parT9:dee`
- `comment1.xml`,`PARt10:9}`

flag:`flag{e675efb3-346f-405f-90dd-222b387edee9}`

#### 例题1

## PDF隐写

## 文本隐写术

### Whitespace esolang 编码隐写

[Whitespace](https://zh.wikipedia.org/wiki/Whitespace)是一种使用空格、制表符和换行符来表示数据的编程语言。

`CTRL+A`全选

### SNOW 隐写术

<https://darkside.com.au/snow/>

### 零宽字符隐写术

零宽字符的 Unicode 隐写术 Zero Width Space Steganography (ZWSP)

|字符名称|英文|Unicode|
|--|--|--|
|零宽空格|Zero-width space|U+200B|
|零宽非连字|Zero-width non-joiner|U+200C|
|零宽连字|Zero-width joiner|U+200D|
|从左到右标记|Left-To-Right Mark|U+200E|
|从右到左标记|Right-To-Left Mark|U+200F|
|从左到右嵌入|Left-To-Right Embedding|U+202A|
|从右到左嵌入|Right-To-Left Embedding|U+202B|
|||U+202C|
|从左到右覆盖|Left-To-Right Override|U+202D|
|从右到左覆盖|Right-To-Left Override|U+202E|
|词连接符|Word joiner|U+2060|
|零宽不换行空格|Zero-width no-break space|U+FEFF|

- CSAW CTF Quals 2020 widthless

<https://330k.github.io/misc_tools/unicode_steganography.html>
