# JWT

JWT（JSON Web Token）是一种开放的标准（RFC 7519），用于在应用程序或服务之间安全地传递信息。

## 基本结构

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

JWT 通常由三部分组成，每部分通过 `.` 分隔：

- `Header（头部）`：通常包含 token 的类型（JWT）和所使用的签名算法（如 HMAC SHA256）。
- `Payload（负载）`：包含声明（claims），这些是关于用户的信息。常见的声明有：
  - `sub`（主题）：表示令牌的主体（通常是用户 ID）
  - `iat`（签发时间）：令牌签发的时间
  - `exp`（过期时间）：令牌的过期时间
- `Signature（签名）`：通过对 Header 和 Payload 进行编码后，使用头部指定的算法和一个密钥生成的签名，用于验证 token 的完整性。

<https://jwt.io/>
<https://token.dev/>

```json
// Header
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload
{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022
}

// Signature
// HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
```

<https://github.com/ticarpi/jwt_tool>
<https://github.com/brendan-rius/c-jwt-cracker>
<https://jwt.rocks/>

## 考点

### `alg=none`签名绕过漏洞（CVE-2015-2951）

### 空密码

### 弱密钥

## 例题分析

### 例题1：[RootersCTF2019]ImgXweb  

## 练习题

## 参考资料

- <https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/06-Session_Management_Testing/10-Testing_JSON_Web_Tokens>
- <https://kleiton0x00.github.io/posts/json-web-token-exploitation/#4-hsrsa-key-confusion-and-public-key-leaked>
- <https://saucer-man.com/information_security/377.html>
<https://medium.com/@roshan.reju/attacking-json-web-tokens-892fc76b7fcf>

<!--
综合题目：[CISCN2019 华北赛区 Day1 Web2]ikun，JWT+picke反序列化

-->