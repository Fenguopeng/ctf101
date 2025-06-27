# 内存取证

## Volatility 3 工具

[Volatility 3](https://volatility3.readthedocs.io/en/latest/)是一款强大的内存取证工具，用于分析计算机内存转储（RAM dump）。

### 安装

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

### 常用方法

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
