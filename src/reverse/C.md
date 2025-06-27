# C语言基础

## 数据类型

## 指针

## 编译运行

### GCC

GCC（GNU Compiler Collection） 是一个由 GNU 项目开发的编译器套件，最初用于编译 C 语言，但现在已支持多种编程语言，包括 C++、Objective-C、Fortran、Ada 和 Go 等。GCC 是一个开源项目，广泛应用于类 Unix 操作系统上，是 Linux 系统上最常用的编译器之一。

#### 安装

在基于 Debian 的 Linux 系统（如 Ubuntu）上，您可以通过以下命令安装 GCC 及其多库支持：

```bash
sudo update
sudo apt install gcc gcc-multilib
gcc --version
```

- `gcc`：GNU C 编译器，用于编译 C 语言程序。
- `gcc-multilib`：提供支持多架构编译的库，让您能够编译和运行 32 位和 64 位程序。

#### 常用方法

```c
#include <stdio.h>

int main() {
    printf("Hello, World!\n");
    return 0;
}
```

- 编译运行单个 C 文件

```bash
$ gcc hello.c -o hello
$ file hello
hello: ELF 64-bit LSB shared object, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=433a53a76a26beb15041652b89314cd00e6a0fa6, for GNU/Linux 3.2.0, not stripped
$ ./hello
Hello, World!
```

- 编译为 32 位

```bash
gcc -m32 hello.c -o hello32
gcc -m32 -ggdb hello.c -o hello32
```

- 链接多个源文件

```bash
gcc file1.c file2.c -o output
```

```bash
```

```bash
```
