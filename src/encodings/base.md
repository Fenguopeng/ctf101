# Base编码

## Base64

Base64 是一种基于 64 个可打印字符来表示二进制数据的表示方法，3 个字节可由 4 个可打印字符表示。64 个可打印字符包括大小写字母`a-z`、`A-Z`，数字`0-9`以及两个特殊字符`+` 和 `/`，因此命名为“Base64”。

```bash
$ echo hello | base64
aGVsbG8K

$ echo aGVsbG8K | base64 -d
hello
```

## Base32

```
A-Z（26个大写字母）
2-7（数字，不包括易于混淆的数字0和1）
```

## Base58

`123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ`，与Base64相比，排除了数字`0`、大写字母`O`、大写字符`I`、小写字母`l`，避免混淆。

主要用于比特币地址、私钥、钱包文件等的编码，避免容易混淆字符，提高用户输入体验。

## Base62

## Base85

## 例题分析

### 例题-`Base`

题目来源：2021 年中国能源网络安全大赛预赛

题目描述：
`31332b353d3f3f3f2d2d2d2d7a6d6a74706d3838757366677a6d797474736467746d65697a6c6c74787a6d657a61646a766d6f66757365677262776b7a77666a7a61796f7a646d75373d3d3d`

题目分析：

首先十六进制解码，得`13+5=???----zmjtpm88usfgzmyttsdgtmeizlltxzmezadjvmofusegrbwkzwfjzayozdmu7===`，提示字符串`13+5=???-`，有效字符串只有小写字母和数字，且存在数字`8`，判断不是转为大写后得`Base 32`，根据提示`13+5`，需要对字母和数字作如下转换：

+ 小写字母进行`ROT 13`
+ 数字进行`ROT 5`
+ 转为大写字母并`Base 32`解码

[CyberChef](https://gchq.github.io/CyberChef/#recipe=ROT13(true,true,false,13)ROT13(false,false,true,5)To_Upper_case('All')From_Base32('A-Z2-7%3D',true)&input=em1qdHBtODh1c2Znem15dHRzZGd0bWVpemxsdHh6bWV6YWRqdm1vZnVzZWdyYndrendmanpheW96ZG11Nz09PQ&ieol=CRLF&oeol=NEL)

FLAG：`flag{9e6ef1a3f5f0e31cadd29c297bef5ad2}`

## 练习题

### EZ_XOR

题目来源：2018护网杯线上赛

`AAoHAR1WX1VQVlNVU1VRUl5XXyMjI1FWJ1IjUCQnXlZWXyckXhs=`

FLAG：`flag{09360535374819EEE70A4E6BA8009AB8}`
