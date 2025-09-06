# 日志分析

## Apache

| 系统                | 访问日志                       | 错误日志                       |  
|---------------------|------------------------------|------------------------------|  
| Debian/Ubuntu       | `/var/log/apache2/access.log` | `/var/log/apache2/error.log` |  
| RHEL/CentOS/Fedora  | `/var/log/httpd/access_log`   | `/var/log/httpd/error_log`   |  

默认日志格式

# Common 格式

```
%h %l %u %t \"%r\" %>s %b
```

# Combined 格式

```
LogFormat "%h %l %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-Agent}i\"" combined
```

| 系统          | 主配置文件路径               |  
|---------------|----------------------------|  
| Debian/Ubuntu | `/etc/apache2/apache2.conf` |  
| RHEL/CentOS   | `/etc/httpd/conf/httpd.conf` |  

```bash
127.0.0.1 - - [14/Jul/2024:12:34:56 +0000] "GET /index.html HTTP/1.1" 200 1043
```

## 参考

- <https://signoz.io/guides/apache-log/>
