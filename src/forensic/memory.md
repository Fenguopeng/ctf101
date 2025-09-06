# 内存取证

## 内存转储

内存转储能保存运行时的关键易失性证据（进程、网络连接、恶意软件痕迹、注册表、凭据、解密密钥、MFT 等）。

常见的取证镜像格式

- RAW
  - 特点：逐位拷贝，无元数据，通用性强。
  - 优点：几乎所有工具支持；简单直接。
  - 缺点：体积大，无内置压缩/校验元数据。

### DumpIt

Windows 7

### Magenet RAM Capture

[Magnet RAM Capture](https://www.magnetforensics.com/resources/magnet-ram-capture/) 是 Magnet Forensics 提供的**免费**内存采集工具，可在 **Windows** 主机上抓取物理内存镜像，用于后续取证分析。

支持系统：Windows XP, Vista, 7, 8, 10, 2003, 2008, 2012 （支持 32 位与 64 位）
最新版本： V1.20，发布于 2019-7-24（支持在启用虚拟安全模式的 Windows 10 上进行采集）

### WinPmem

<https://medium.com/@cyberforensicator57/capturing-memory-dump-using-winpmem-5e1eb29c811d>

### LiME

###

## 内存分析

### Volatility 3

[Volatility 3](https://volatility3.readthedocs.io/en/latest/)是一款强大的内存取证工具，用于分析计算机内存转储（RAM dump）。

#### 安装

- `Kali Linux 2024.4` 及以后版本

```shell
$ sudo apt install pipx
$ pipx install volatility3
  installed package volatility3 2.26.0, installed using Python 3.13.2
  These apps are now globally available
    - vol
    - volshell
done! ✨ 🌟 ✨
```

导入符号表

查看可用的插件：

```bash
vol -h
```

#### 常用方法

使用 `-f` 选项指定内存转储文件。

#### 进程信息

```shell
vol -f windows.pslist
vol -f windows.psscan
vol -f windows.pstree
```

cmdline

```shell
vol -f windows.cmdline
```

DLLS

```shell
vol -f windows.dlllist --pid
```

#### 网络信息

```shell
vol -f windows.netscan
vol -f windows.netstat
```

#### 文件

文件扫描

```shell
vol -f windows.filescan
```

导出文件

```shell
vol -f windows.dumpfiles ‑‑virtaddr <offset>
vol -f windows.dumpfiles ‑‑physaddr <offset>
```

#### 注册表

```shell
vol -f windows.registry.printkey
```

```shell
vol -f windows.registry.hash
```

## 参考资料

- <https://github.com/ufrisk/MemProcFS>
