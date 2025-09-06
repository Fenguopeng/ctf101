# Linux 入侵检测

## 日志分析

Debian/Ubuntu 系列通常为 /var/log/auth.log；RHEL/CentOS/AlmaLinux 等用 /var/log/secure。

记录认证与授权相关事件，包括 SSH 登录/断开、sudo 提权、su 切换用户、PAM 模块认证、polkit、sshd 密钥交换、失败的登录尝试、账户锁定等。

### sshd

SSH 登录、会话开启/关闭、密钥/密码认证结果、来源 IP、端口、指纹等

- PAM（pam_unix、pam_sss 等）：实际的认证决策与会话状态。
- systemd-logind：为登录用户分配/结束会话（New session X...）

#### 登录失败

- 用户名存在

```log
# 来自 IP 8.213.197.49 的一个 SSH 连接在 PAM 认证阶段失败。目标账户为 root。
2025-08-19T22:23:44.586422+08:00 iZbp1fvwegwglrx4q0etvfZ sshd[94607]: pam_unix(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=8.213.197.49  user=root

# 同一连接（同一 PID 94607）尝试使用密码登录 root 账户失败。来源端口 47952，协议 SSH-2。
2025-08-19T22:23:46.761981+08:00 iZbp1fvwegwglrx4q0etvfZ sshd[94607]: Failed password for root from 8.213.197.49 port 47952 ssh2
```

- 用户名不存在

```log
2025-08-19T22:12:02.144945+08:00 iZbp1fvwegwglrx4q0etvfZ sshd[94561]: Invalid user dev from 8.213.197.49 port 41346
2025-08-19T22:12:02.148697+08:00 iZbp1fvwegwglrx4q0etvfZ sshd[94561]: pam_unix(sshd:auth): check pass; user unknown
2025-08-19T22:12:02.148950+08:00 iZbp1fvwegwglrx4q0etvfZ sshd[94561]: pam_unix(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=8.213.197.49 
2025-08-19T22:12:04.283899+08:00 iZbp1fvwegwglrx4q0etvfZ sshd[94561]: Failed password for invalid user dev from 8.213.197.49 port 41346 ssh2
```

#### 登录成功

```log
# 来自 171.15.198.167 的客户端，使用密码方式成功登录了用户 test。表示密码被接受（成功认证）。
2025-08-19T22:49:03.719968+08:00 iZbp1fvwegwglrx4q0etvfZ sshd[94837]: Accepted password for test from 171.15.198.167 port 60142 ssh2
# PAM 会话模块记录：为用户 test 打开了一个 SSH 会话。uid=1001 是该用户的系统 UID。
# “by test(uid=0)” 是 PAM 的固定表述，表示由具有 root 权限的 sshd 进程建立了会话，不是 test 拥有 root 权限。
2025-08-19T22:49:03.722942+08:00 iZbp1fvwegwglrx4q0etvfZ sshd[94837]: pam_unix(sshd:session): session opened for user test(uid=1001) by test(uid=0)

# systemd-logind 分配了会话号 4993，标记一个新的登录会话开始。
2025-08-19T22:49:03.737178+08:00 iZbp1fvwegwglrx4q0etvfZ systemd-logind[809]: New session 4993 of user test.

# 为该用户的用户级 systemd 实例开启了会话（user@UID 的 systemd）。
2025-08-19T22:49:03.807053+08:00 iZbp1fvwegwglrx4q0etvfZ (systemd): pam_unix(systemd-user:session): session opened for user test(uid=1001) by test(uid=0)

# 客户端主动断开连接（原因码 11），仍是同一源 IP/端口。
2025-08-19T22:49:32.811731+08:00 iZbp1fvwegwglrx4q0etvfZ sshd[94909]: Received disconnect from 171.15.198.167 port 60142:11: disconnected by user

# 连接断开，标注关联的用户名与来源。
2025-08-19T22:49:32.812708+08:00 iZbp1fvwegwglrx4q0etvfZ sshd[94909]: Disconnected from user test 171.15.198.167 port 60142

# SSH 会话关闭。
2025-08-19T22:49:32.815225+08:00 iZbp1fvwegwglrx4q0etvfZ sshd[94837]: pam_unix(sshd:session): session closed for user test

# 会话注销，清理完成。
2025-08-19T22:49:32.823649+08:00 iZbp1fvwegwglrx4q0etvfZ systemd-logind[809]: Session 4993 logged out. Waiting for processes to exit.
2025-08-19T22:49:32.827693+08:00 iZbp1fvwegwglrx4q0etvfZ systemd-logind[809]: Removed session 4993.
```

### sudo

执行 sudo 命令的用户、目标用户、命令内容、是否授权成功。

```log
2025-08-19T22:55:33.669093+08:00 iZbp1fvwegwglrx4q0etvfZ sudo: ecs-user : TTY=pts/0 ; PWD=/var/log ; USER=root ; COMMAND=/usr/bin/whoami
2025-08-19T22:55:33.675232+08:00 iZbp1fvwegwglrx4q0etvfZ sudo: pam_unix(sudo:session): session opened for user root(uid=0) by ecs-user(uid=1000)
2025-08-19T22:55:33.679733+08:00 iZbp1fvwegwglrx4q0etvfZ sudo: pam_unix(sudo:session): session closed for user root
```

### CRON

计划任务触发时的会话开启/关闭（pam_unix(cron:session)）。

- su、login、polkitd、gdm 等：本地/图形/策略授权相关事件。

### wtmp 日志

wtmp 是 Linux/Unix 系统用于记录登录、登出、系统启动/关机、runlevel 变化等“会话级”事件的二进制日志文件。
它保存“交互式终端会话”的生命周期信息，常被用来还原谁在何时何地登录了系统，以及会话持续多久。
