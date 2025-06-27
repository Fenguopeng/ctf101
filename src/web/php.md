# PHP语法基础

PHP 是一种广泛应用的通用脚本语言，特别适合用于网页开发，其代码可嵌入到 HTML 中。它快速、灵活且实用，易于学习和使用。

PHP 作为`世界上最好的语言`，是 CTF Web 题目中的考查热点。

历史主流版本有`5.[56].x`、`7.[01234].x`和`8.[01234].x`。

## 环境搭建

参考`WAMP`和`LAMP`部分。

## [变量基础](https://www.php.net/manual/zh/language.variables.basics.php)

PHP 中的变量以美元符号`$`开头，后接变量名，且变量名**区分大小写**。

有效的变量名必须以**字母**或下划线开头，后面可以跟上任意数量的字母，数字或下划线。其正则表达式为`^[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*$`。

!> 所指的字母包括`a-z`，`A-Z`，以及 ASCII 字符从 128 到 255（0x80-0xff）。正则表达式显示，变量名支持 Unicode、中文，例如`$你好`

- 有效变量名

```php
<?php
$var = 'Bob'; // 将字符串 'Bob' 赋值给变量 $var
$Var = 'Joe';
echo "$var, $Var"; // 输出 "Bob, Joe"

$_4site = 'not yet'; // 合法变量名；以下划线开头
$i站点is = 'mansikka'; // 合法变量名；可以用中文
?>
```

- 无效变量名

```php
<?php
$4site = 'not yet';     // 非法变量名；以数字开头
```

## 基本语法

### PHP标记

当解析一个文件时，PHP 会寻找`起始和结束标记`，也就是`<?php`和`?>`，这告诉 PHP 开始和停止解析二者之间的代码。**此种解析方式使得 PHP 可以被嵌入到各种不同的文档中去**，而任何起始和结束标记之外的部分都会被 PHP 解析器忽略。

- 普通标记`<?php ?>`
- 短标记`<? ?>`
  - 短标记是被默认开启的，但是也可以通过设置`short_open_tag`来禁用
- `<?=`
  - `<?php echo`的简写形式，不受`short_open_tag` 控制
- ASP 风格标记`<% %>` 、`<%=`
  - 自 PHP 7.0.0 起 ，被移除
  - 默认关闭，须将`asp_tags`设置为 On
- 脚本标记 `<script language="php">`
  - 自 PHP 7.0.0 起，被移除
  - eg. `<script language="php">system("whoami"); </script>`

### 指令分隔符

PHP 每个语句后需用`分号`结束指令，结束标记隐含表示了一个分号，代码段的最后一行可以不加分号。

在文件末尾，PHP 代码段的结束标记可以省略，尤其在使用 include 或者 require 时，这样可以避免不必要的空白符出现。

### 注释

PHP 支持 C，C++ 和 Unix Shell 风格（Perl 风格）的注释。

```php
<?php
    echo 'This is a test'; // 这是一个单行注释, c++ 样式注释
    /* 这是一条多行注释
       另一行也是注释 */
    echo 'This is yet another test';
    echo 'One Final Test'; # 这是另一个单行注释, shell 风格的注释
?>
```

## 如何运行PHP代码？

- 通过网站运行

将 PHP 代码文件放在支持 PHP 的 Web 服务器（如 Apache、Ngnix）网站目录下，通过浏览器访问该文件即可运行。

- 命令行模式运行

在终端或命令行中执行以下命令来运行 PHP 代码：

> 若使用 PHP Study，需设置环境变量，或在 PHP 可执行程序目录下运行。

```bash
# 交互模式
php -a

# 执行代码，不包括标记
php -r <code>

# 执行指定的 PHP 文件
php -f scriptname.php
```

- 在线 PHP 代码测试编辑器

> **强烈推荐**使用在线 PHP 代码测试编辑器[onlinephp.io](https://onlinephp.io/)，该工具提供多种 PHP 版本的选择。

## 类型

PHP 支持四种标量值（标量值不能拆分为更小的单元，例如，和数组不同）类型：int 值、浮点数值（float）、string 值和 bool 值。PHP 也支持两种复合类型：数组和对象。这些值类型可以赋值给变量或者从函数返回。

### Integer 整型
  
可以使用十进制，**十六进制**，八进制或二进制表示，前面可以加上可选的符号（`-` 或者 `+`）。

- 要使用**八进制**表达，数字前必须加上`0`（零）。 PHP 8.1.0 起，八进制表达也可以在前面加上`0o`或者`0O`。
- 要使用**十六进制**表达，数字前必须加上`0x`。
- 要使用**二进制**表达，数字前必须加上`0b`。

```php
<?php
$a = 1234; // 十进制数
$a = 0123; // 八进制数 (等于十进制 83)
$a = 0o123; // 八进制数 (PHP 8.1.0 起)
$a = 0x1A; // 十六进制数 (等于十进制 26)
$a = 0b11111111; // 二进制数字 (等于十进制 255)
$a = 1_234_567; // 整型数值 (PHP 7.4.0 以后)
?>
```

### Float 浮点型

浮点型（也叫浮点数 float，双精度数 double 或实数 real）用于表示小数，常用于需要高精度的小数计算和科学计算等场景。

?> **科学计数法**使用小写`e`或大写`E`均可。

```php
<?php
$a = 1.234; 
$b = 1.2e3; // 科学计数法
$c = 7E-10; // 科学计数法
$d = 1_234.567; // 从 PHP 7.4.0 开始支持
?>
```

### String 字符串

一个字符串是由一系列的字符组成，其中每个字符等同于一个字节。常用单引号和双引号定义字符串。

?> 用双引号定义的字符串支持**变量解析**，遇到一个美元符号（$），后面的字符会被解释为变量名，然后替换为变量的值。

```php
<?php
$juice = "apple";

echo "He drank some $juice juice." . PHP_EOL;
// He drank some apple juice.
```

#### 数字字符串

如果一个字符串可以被解释为`int`或 `float`类型，则它被视为`数字字符串`。

```php
<?php
var_dump(is_numeric('1234')); // bool(true)
var_dump(is_numeric('0123')); // bool(true)
var_dump(is_numeric('1.234')); // bool(true)
var_dump(is_numeric('1.2e3')); // bool(true)
```

#### 前导数字字符串

其开头类似于数字字符串，后跟任何字符，如`123a`。

```php
<?php
var_dump(is_numeric('123a')); // bool(false)
var_dump(is_numeric('123e')); // bool(false)
```

?> `前导数字字符串`只是一个字符串，不是数字字符串。

### Boolean 布尔类型

`bool`仅有两个值，用于表达真（truth）值，使用常量`true` 或 `false`表示。两个都不区分大小写。

```php
$foo = True; // 将变量 $foo 赋值为 TRUE
$bar = false; // 将变量 $bar 赋值为 FALSE
```

### NULL

`null`类型只有一个值，就是不区分大小写的常量`null`，未定义和`unset()`的变量都将解析为值`null`。

```php
$var = NULL; 
```

### Array 数组

数组实际上是键值对。

```php
<?php
$array1 = array(
    "foo" => "bar",
    "bar" => "foo",
);

// 使用短数组语法
$array2 = [
    "foo" => "bar",
    "bar" => "foo",
];

// 没有键名的索引数组
$array3 = array("foo", "bar", "hello", "world");
$array4 = ["foo", "bar", "hello", "world"];

// 用方括号`[]`访问数组
// 应在用字符串表示的数组索引上加上引号，单引号、双引号均可
var_dump($array1['foo']); // string(3) "bar"
var_dump($array2["foo"]); // string(3) "bar"

/* 尽管错误，但仍能正常运行。未定义的常量 foo。
   将未定义的常量当作裸字符串。从 PHP 7.2.0 起已废弃，并触发 E_WARNING 级别错误。 从 PHP 8.0.0 起被移除，并触发 Error 异常。*/
var_dump($array2[foo]); // string(3) "bar"

var_dump($array3[0]); // string(3) "foo"

/* 在 PHP 8.0.0 之前，方括号和花括号可以互换使用来访问数组单元。
   花括号语法在 PHP 7.4.0 中已弃用，在 PHP 8.0.0 中不再支持。*/
var_dump($array4{0}); // string(3) "foo"
```

- 从 PHP 7.1.O 起，支持`[]`数组解包，`[$foo, $bar, $baz] = $source_array;`

## 超全局变量

预定义变量。
超全局变量是指在全部作用域中始终可用的内置变量。

### $_GET

`$_GET`通过 URL 参数（又叫 query string）传递给当前脚本的变量的**数组**。

- `$_GET`、 `$_POST`是通过 **urldecode()** 传递的，`urldecode($_POST['id'])`，可通过双重 URL 编码绕过。
  - URL 解码[urldecode()](https://www.php.net/manual/zh/function.urldecode.php) 加号（'+'）被解码成一个空格字符。
- 若 URL 中的查询字符串`?arg=a`，则`$_GET['arg']`为字符串类型；若 URL 中的查询字符串`?arg[a]=a`，则`$_GET['arg']`为数组类型。
  - `?arg[]=a&arg[]=b`，不指定 key，自动索引递增
  - `?arg[name]=a&arg[name2]=b`，指定数组 key，**不需要加引号**
- `$_GET`，该数组不仅仅对 method 为 GET 的请求生效，而是会针对**所有带 query string 的请求**。

## 常量

可以使用 const 关键字或 define() 函数两种方法来定义一个常量。一个常量一旦被定义，就不能再改变或者取消定义。常量前面没有美元符号（$）；

```php
<?php
// 简单的标量值
const CONSTANT = 'Hello World';

echo CONSTANT;
```

在 PHP 8.0.0 之前，调用未定义的常量会被解释为一个该常量的字符串，即（CONSTANT 对应 "CONSTANT"）。 此方法已在 PHP 7.2.0 中被废弃，会抛出一个 E_WARNING 级错误。
参见手册中为什么 $foo[bar]是错误的（除非 bar 是一个常量）。

### 预定义常量

内核预定义常量在 PHP 的内核中定义。它包含 PHP、Zend 引擎和 SAPI 模块。比如`PHP_EOL`为当前平台中对换行符的定义。

### 魔术常量

有九个魔术常量它们的值随着它们在代码中的位置改变而改变。例如 `__LINE__` 的值就依赖于它在脚本中所处的行来决定。“魔术”常量都在编译时解析，而常规常量则在运行时解析。这些特殊的常量不区分大小写。

## 表达式

## 函数

```php
<?php
// 定义函数 foo()
function foo($arg_1, $arg_2, /* ..., */ $arg_n)
{
    echo "Example function.\n";
    return $retval;
}

// 调用函数 foo()
foo();
?>
```

函数无需在调用之前被定义，但是当一个函数是有条件被定义时，必须在调用函数之前定义。

### 可变函数

如果一个变量名后有圆括号，PHP 将寻找与变量的值同名的函数，并且尝试执行它。也称为**动态函数**。

```php
<?php
function foo() {
    echo "In foo()<br />\n";
}

function bar($arg = '')
{
    echo "In bar(); argument was '$arg'.<br />\n";
}

$func = 'foo';
$func();        // 调用 foo()

$func = 'bar';
$func('test');  // 调用 bar()
```

PHP7 前是不允许用`($a)();`这样的方法来执行动态函数的，但 PHP7 中增加了对此的支持。所以，我们可以通过`('phpinfo')();`来执行函数，第一个括号中可以是任意 PHP 表达式。

<!--  
## 类与对象

### 匿名类

PHP7 现在支持通过 new class 来实例化匿名类，这可以用来替代一些“用后即焚”的完整类定义。匿名类很有用，可以创建一次性的简单对象。匿名类的名称是通过引擎赋予的。匿名类的名称在不同版本存在差异。

```php
<?php
echo get_class(new class() {} );
// PHP 7.4 
// class@anonymous%00/var/www/html/index.php:2$1

// PHP 7.[0123]
// class@anonymous%00/var/www/html/index.php0x7fb985e59023
```

在 PHP 7.4 中，匿名类的名称与之前版本有所不同，`class@anonymous%00/var/www/html/index.php:2$1`，包含有脚本名称、匿名类所在的行号`:2`、序号`$1`。在实际测试中发现，每次会话其序号从`$0`递增。

我们可以用过引用匿名类的名称实例化。

```php
<?php
$a = new class {
    function getflag() {
        echo "flag{}";
    }
};

$b = $_GET['b'];
$c = new $b();
$c->getflag();

// ?b=class@anonymous%00/var/www/html/1.php:2$0
```
-->