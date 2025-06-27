# 图像隐写

图像隐写是一种将数据（包括文本、图像、音频、视频）嵌入到图像中的信息隐藏技术，人类视觉上通常无法区分处理过的图像和原始图像。图像隐写技术的基本原理是利用人类视觉系统的特性和图像的冗余信息，通过对图像中特定像素的微小修改来实现数据的隐藏。该技术广泛应用于数据传输中的安全通信、版权保护以及隐私保护等领域。

## BMP

[BMP](https://zh.wikipedia.org/wiki/BMP)（Bitmap，位图）是一种于 1986 年随着 Microsoft Windows 1.0 发布而推出的**无压缩**图像文件格式，广泛用于 Windows 系统中，采用简单结构存储像素数据。

BMP 文件由以下部分组成：

- **文件头**（Bitmap File Header）：固定 14 个字节，包含文件类型标识（字符`BM`），文件大小、像素数据偏移量等。
- **信息头**（DIB Header）：紧跟文件头之后，包含图像宽度、高度、色深、压缩方式等信息。大小和格式有多种版本，常见为 40 字节的`BITMAPINFOHEADER`，也有向下兼容`BITMAPV5INFOHEADER`。
- （可选）**颜色表**（Color Table）：用于索引颜色，支持 1、4、8 位色深索引色，24 位及以上多为直接颜色值。
  - 1 位色深，单色位图，每个像素用 1 位表示，即 2 种颜色，每像素占 $1/8$ 字节。
  - 4 位色深，16 色位图，每个像素用 4 位表示，即 16 种颜色，每像素占$1/2$字节。
  - 8 位色深，256 色位图，每个像素用 8 位表示，即 256 种颜色，每像素占 1 节。
  - 24 位色深，24 位位图，每个像素用 3 字节表示。
- **像素数据**（Pixel Data）：以行存储，每行字节数必须是 4 的倍数，不足部分用填充字节补齐，像素存储顺序通常**自下而上**。

![BMP Format](../images/BMPfileFormat.svg)

### 例题分析

#### 例题1：[PicoCTF 2021]tunn3l_v1s10n

1. 附件没有后缀名，执行命令`file tunn3l_v1s10n`，结果是`tunn3l_v1s10n: data`，无法正确识别文件类型。
2. 通过十六进制编辑器查看文件。使用命令`xxd -g 1 tunn3l_v1s10n | head`，判断文件类型为`bmp`。

```
00000000: 42 4d 8e 26 2c 00 00 00 00 00 ba d0 00 00 ba d0  BM.&,...........
00000010: 00 00 6e 04 00 00 32 01 00 00 01 00 18 00 00 00  ..n...2.........
00000020: 00 00 58 26 2c 00 25 16 00 00 25 16 00 00 00 00  ..X&,.%...%.....
00000030: 00 00 00 00 00 00 23 1a 17 27 1e 1b 29 20 1d 2a  ......#..'..) .*
00000040: 21 1e 26 1d 1a 31 28 25 35 2c 29 33 2a 27 38 2f  !.&..1(%5,)3*'8/
00000050: 2c 2f 26 23 33 2a 26 2d 24 20 3b 32 2e 32 29 25  ,/&#3*&-$ ;2.2)%
00000060: 30 27 23 33 2a 26 38 2c 28 36 2b 27 39 2d 2b 2f  0'#3*&8,(6+'9-+/
00000070: 26 23 1d 12 0e 23 17 11 29 16 0e 55 3d 31 97 76  &#...#..)..U=1.v
00000080: 66 8b 66 52 99 6d 56 9e 70 58 9e 6f 54 9c 6f 54  f.fR.mV.pX.oT.oT
00000090: ab 7e 63 ba 8c 6d bd 8a 69 c8 97 71 c1 93 71 c1  .~c..m..i..q..q.
```

3. 修改后缀后，图片查看器无法正常打开图片，判断文件格式出错。
4. 修复文件步骤如下：
    - 文件标识`File Offset to PixelArray`字段应为`36 00 00 00`，即十六进制`0x36`，表示 54 字节。
    - 信息头`DIB Header Size`字段应为`28 00 00 00`，即十六进制`0x28`，表示 40 字节。
    - 修改图片高度，(2893454-54)/(1134*3+2) = 850

FLAG：`picoCTF{qu1t3_a_v13w_2020}`

参考资料：

- <https://github.com/HHousen/PicoCTF-2021/tree/master/Forensics/tunn3l%20v1s10n>

### 参考资料

- <https://www.ece.ualberta.ca/~elliott/ee552/studentAppNotes/2003_w/misc/bmp_file_format/bmp_file_format.htm>

## TIFF

## PNG

PNG（Portable Network Graphics，便携式网络图形）是一种广泛使用的无损压缩位图图片格式，具有`无损压缩`、`支持透明通道（Alpha通道）`和`内置校验`等特点。

PNG 文件包括以下主要部分：

- 文件标识（Signature）：8 字节，每个 PNG 文件以字节序列 `89 50 4E 47 0D 0A 1A 0A` 开头。
- 块（Chunks）：PNG 文件由多个不同类型的块组成，分为关键块和辅助块。
  
关键数据块中有4个标准数据块：  

- IHDR：图像头块，13 个字节，定义图像的基本属性，包含图像宽度、高度、颜色类型等信息。作为第一个数据块出现并只出现一次。
- PLTE：调色板块（可选），定义用于图像的颜色调色板。必须放在图像数据块之前。
- IDAT：图像数据块，存储`DEFLATE 算法`压缩后的图像像素数据。可以为一个或多个连续块，顺序不可颠倒，
- IEND：图像结束标志，指示文件的结尾。

### IDAT

IDAT 中的数据是通过 zlib（DEFLATE压缩算法）压缩的像素数据流。
多个 IDAT 块的数据拼接后构成完整的 zlib 流

### 例题分析

#### 例题1

#### 例题2

```bash
pngcheck

```

tweakpng

## JPG

JPEG（JPG）是一种广泛应用的**有损压缩**图像格式，具备`压缩比灵活`、`不支持透明通道`

有损压缩

jphide

## GIF

GIF（Graphics Interchange Format，图形交换格式）是一种由美国技术公司 CompuServe 于 1987 年推出的广泛使用的图像格式，现已成为 W3C 的标准。GIF 文件主要用于支持动画和图像压缩，常见于网页和社交媒体中，尤其是表情包。其优点包括`创建速度快`、`文件体积小`和`无损压缩`，然而，其色彩限制和低分辨率可能影响图像质量。

自推出以来，GIF 经历了两个主要版本：`GIF87a`（1987 年）是首个版本，支持最多 256 种颜色和静态图像；`GIF89a`（1989 年）在此基础上增加了动画支持、透明背景和元数据功能，使其更加灵活和实用。

### 文件结构

![gif_file_format](../images/gif_file_format.gif)

1. **文件头（Header）**
    - **签名（Signature）：** 3 个字节，`47 49 46`即字符`GIF`，表示该文件为 GIF 格式。
    - **版本（Version）：** 3 个字节，指明版本号，两个主要版本分别为`87a`和`89a`。
    - `GIF89a`
2. **逻辑屏幕描述符（Logical Screen Descriptor）**
    - 描述 GIF 的画布尺寸（宽度和高度）。
    - 指定全局颜色表的大小和是否使用透明色。
3. **（可选）全球颜色表（Global Color Table）**
    - 通常用于索引颜色。包含多达 256 种颜色的 RGB 值。每种颜色由三个字节（红、绿、蓝）表示。
4. **图形控制扩展（Graphics Control Extension）**
    - 提供关于图像显示的控制信息，如延迟时间、透明色的使用及是否是动画帧。
5. **图像描述符（Image Descriptor）**
    - 描述单个图像的起始位置和尺寸（例如左上角坐标、宽度和高度）。
    - 可选的局部颜色表也可以在此区块中定义。
6. **局部颜色表（Local Color Table）**
    - 针对特定图像使用的色彩表，允许不同的图像使用不同的颜色表。
    - 结构与全局颜色表相同。
7. **图像数据（Image Data）**
    - 实际的图像像素数据，通常经过 LZW（Lempel-Ziv-Welch）压缩。
8. **（可选）纯文本扩展（Plain Text Extension）**
    - 可选部分，用于存储文本内容。
9. **应用扩展（Application Extension）**
    - 存储应用程序相关的信息，通常用于动画控制。
10. **注释扩展（Comment Extension）**
    - 包含元数据，允许在 GIF 文件中加入注释。
11. **结束块（Trailer）**
    - 文件的结束标识，通常为一个字节，值为`0x3B`。

参考资料：

- <https://giflib.sourceforge.net/whatsinagif/bits_and_bytes.html>
- <https://www.w3.org/Graphics/GIF/spec-gif89a.txt>

### 时间轴

### 空间轴

ImageMagick 是一款流行的开源软件，支持丰富的数字图像操作。其中，`convert` 是 ImageMagick 的一个核心命令行工具，用于在不同的图像格式之间转换、修改和组合图像。

动画 GIF 文件由多帧图像组成，可以使用`convert`命令将其每一帧分割开。

```bash
convert -version
```

```bash
sudo apt update
sudo apt install imagemagick
```

```bash
convert filename.gif output.png
```

也可以使用在线工具<https://ezgif.com/split> 或 `Stegsolve.jar`。

#### 例题1：[DownUnderCTF 2021]How to pronounce GIF

附件下载：[challenge.gif](../../attachments/stego/challenge.gif)

使用`convert`命令分离帧，并保存在`frames`目录下。

```bash
convert challenge.gif frames/frame.png
```

每十个一组，每组得第一个垂直拼接为一个二维码。

```bash
convert frames/frame-{0,10,20,30,40,50,60,70,80,90,100,110}.png -append QRcode1.png
convert frames/frame-{1,11,21,31,41,51,61,71,81,91,101,111}.png -append QRcode2.png
...
```

共生成 10 个二维码，使用`zbarimg`命令获取内容。

```bash
$ zbarimg QRcode1.png
QR-Code:The princess is in another castle
scanned 1 barcode symbols from 1 images in 0.01 seconds
```

以此类推，得 QRcode6：`RFVDVEZ7YU1`，QRcode8：`fMV9oYVhYMHJfbjB3P30=`

拼接完整，然后 Base64 解码。

```bash
$ echo RFVDVEZ7YU1fMV9oYVhYMHJfbjB3P30= |base64 -d
DUCTF{aM_1_haXX0r_n0w?}
```

#### 例题2：[D^3CTF 2023]d3gif

```python
from PIL import Image

# 初始化一个空列表，用于存储像素值
rgb = []

# 读取每个图像并获取左上角像素的 RGB 值
for i in range(1089):
    with Image.open(f"frame-{i}.png") as img:
        # 将图像转换为 RGBA 格式（如果不是的话）
        img = img.convert("RGBA")
        # 获取左上角像素的颜色
        pixel_value = img.getpixel((0, 0))
        rgb.append(pixel_value)

# 创建一个新的 RGB 图像
output = Image.new("RGB", (33, 33))

# 根据条件设置每个像素的颜色
for index, j in enumerate(rgb):
    red, green, blue, alpha = j  # 解包 RGBA 值

    print(red, green, blue, alpha)

    if blue == 1:
        output.putpixel((red, green), (0, 0, 0))  # 黑色
    else:
        output.putpixel((red, green), (255, 255, 255))

# 显示和保存新创建的图像
output.show()
output.save("out.png")
```

FLAG：`antd3ctf{G1F_0R_C0L0R_0R_QRC0D3_0R_WHAT???}`

#### 相关题目

### 考点总结

## EXIF

[Exif](https://zh.wikipedia.org/wiki/Exif)（Exchangeable image file format，可交换图像文件格式）是专门为数码相机的照片设定的文件格式，可以记录数码照片的属性信息和拍摄数据。

```bash
```

## LSB隐写

通过修改图像中每个像素的最低有效位（Least Significant Bit，LSB），将秘密数据嵌入到图像中，而不会明显改变图像的视觉外观。

![https://miro.medium.com/v2/resize:fit:1300/format:webp/0*MQgIxjo4eKj3b-l6](https://miro.medium.com/v2/resize:fit:1300/format:webp/0*MQgIxjo4eKj3b-l6)
![](https://miro.medium.com/v2/resize:fit:1400/0*ijRQv5bQj4UZg-V1)

### 参考资料

- <https://medium.com/analytics-vidhya/shh-your-secret-is-safe-a-simple-guide-to-steganography-in-python-89116582277e>

## 数字水印

<https://medium.com/@PLZENTERTEXT/wargames-my-2024-forensics-misc-writeup-74375de25de5>
<https://ctftime.org/writeup/34120>

### 盲水印

## 隐写检测工具

[zsteg](https://github.com/zed-0xff/zsteg) detect stegano-hidden data in PNG & BMP

[stegdetect](https://web.archive.org/web/20150415213536/http://www.outguess.org/detection.php)是一个用来检测`JPEG`图片是否存在隐藏信息的自动化工具。可检测`jsteg`、`jphide`、`outguess`、`F5`、``、``

WbStego

jphide

<https://github.com/DominicBreuker/stego-toolkit>

<https://www.anquanke.com/post/id/189154#h2-7>

| 工具名    | 主要功能                      | 适用场景                         | 备注                              |  
|----------|-----------------------------|---------------------------------|----------------------------------|  
| **zsteg**  | 针对 PNG 和 BMP 图片的隐写分析 | 用于从 PNG、BMP 图片中提取隐藏数据  | 支持多种隐写算法，易用且功能强大       |  
| **WbStego**| 多格式隐写工具                | 支持多种图片格式的隐写，界面友好      | 兼容多种隐写算法，适合初学者使用        |  
| **jphide** | 基于 JPEG 文件的隐写         | 用于在 JPEG 图片中隐藏和提取数据     | 经典 JPEG 隐写工具，命令行操作         |  
| **jsteg**  | JPEG 隐写，专注单比特隐写       | 通过 LSB 技术隐藏数据，支持签名和验证  | 轻量且支持密码签名，适合对抗追踪攻击      |  
| **Steghide** |||

<https://github.com/DominicBreuker/stego-toolkit>

[jsteg](https://github.com/lukechampine/jsteg)

首先安装 Go 语言环境

```bash
sudo apt update
sudo apt install golang-go
```

然后再执行：

```bash
go install lukechampine.com/jsteg@latest
```

<https://georgeom.net/StegOnline/upload>
<http://stylesuxx.github.io/steganography/>
