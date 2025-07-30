# MySQL

## 安装

## 连接

### 本地连接

```bash
mysql -u root 
mysql -u -p
mysql -u -p123456
```

### 远程连接

```bash
mysql -h <hostname> -u root 
mysql -h <hostname> -u -p
mysql -h <hostname> -u -p123456
```

1.在/etc/my.cnf 文件 mysqld 块中新建一个【secure_file_priv=NULL】，重启 mysql【systemctlrestartmysqll
2.在/etc/my.cnf 文件 mysqld 块中新建一个【log_raw=OFF】，重启 mysql【systemctlrestartmysql]
3.执行【mysqlbinlog --stop-position=55024--database=drug/var/lib/mysql/mysql-
bin.000001|mysql-uroot】命令
4.关于 mysqlbinlog 数据回滚的参考链接：
<https://blog.csdn.net/lnterest1_wyt/article/details/115028429>

配置 MySQL 为非标准端口 55434。

配置禁止 mysql 读取和写入文件
