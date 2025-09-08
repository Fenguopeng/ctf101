# Python 沙箱逃逸

在 Python 中导入模块的方法：

## 模块导入

- 基本导入

使用 `import` 语句导入整个模块。这种方式会将模块的所有功能引入当前命名空间，但需要通过模块名访问模块中的内容。

```python
import module_name

# 使用模块中的函数
module_name.function_name()
```

- 选择性导入

使用 `from ... import ...` 语句从模块中导入特定的功能。这种方法可以直接使用导入的功能，而无需模块名前缀。

```python
from module_name import function_name

# 直接调用导入的函数
function_name()
```

- 动态导入

`__import__` 是一个内置函数，用于在运行时导入模块。它可以用于动态地导入模块名称在运行时确定的情况。函数的第一个参数是要导入的模块的名称（作为字符串），可以是完整的模块路径。

```python
# 动态导入模块
module_name = "math"
math_module = __import__(module_name)

# 使用导入的模块
result = math_module.sqrt(16)
print(result)  # 输出: 4.0
```

此外，还可以给导入的模块或函数起别名，

使用 as 关键字为导入的模块或函数指定一个别名。这在模块名较长或与现有名称冲突时尤为有用。

```ptyhon
import module_name as alias_name

# 使用别名调用模块中的函数
alias_name.function_name()

from module_name import function_name as alias_function_name

# 使用别名直接调用函数
alias_function_name()
```

## 重要模块

- `os` 模块

`os` 模块提供了一种与操作系统进行交互的方式，其中包含了可以用于执行系统命令的函数。

```python
import os
os.system('id')
```

`platform` 模块可以用来获取操作系统中的信息，但不是直接用来执行命令的。通过获取匹配的命令，你可以进一步结合其他模块用于执行系统命令。

## 内置函数

```python
>>> dir(__builtins__)
['ArithmeticError', 'AssertionError', 'AttributeError', 'BaseException', 'BufferError', 'BytesWarning', 'DeprecationWarning', 'EOFError', 'Ellipsis', 'EnvironmentError', 'Exception', 'False', 'FloatingPointError', 'FutureWarning', 'GeneratorExit', 'IOError', 'ImportError', 'ImportWarning', 'IndentationError', 'IndexError', 'KeyError', 'KeyboardInterrupt', 'LookupError', 'MemoryError', 'NameError', 'None', 'NotImplemented', 'NotImplementedError', 'OSError', 'OverflowError', 'PendingDeprecationWarning', 'ReferenceError', 'RuntimeError', 'RuntimeWarning', 'StandardError', 'StopIteration', 'SyntaxError', 'SyntaxWarning', 'SystemError', 'SystemExit', 'TabError', 'True', 'TypeError', 'UnboundLocalError', 'UnicodeDecodeError', 'UnicodeEncodeError', 'UnicodeError', 'UnicodeTranslateError', 'UnicodeWarning', 'UserWarning', 'ValueError', 'Warning', 'ZeroDivisionError', '_', '__debug__', '__doc__', '__import__', '__name__', '__package__', 'abs', 'all', 'any', 'apply', 'basestring', 'bin', 'bool', 'buffer', 'bytearray', 'bytes', 'callable', 'chr', 'classmethod', 'cmp', 'coerce', 'compile', 'complex', 'copyright', 'credits', 'delattr', 'dict', 'dir', 'divmod', 'enumerate', 'eval', 'execfile', 'exit', 'file', 'filter', 'float', 'format', 'frozenset', 'getattr', 'globals', 'hasattr', 'hash', 'help', 'hex', 'id', 'input', 'int', 'intern', 'isinstance', 'issubclass', 'iter', 'len', 'license', 'list', 'locals', 'long', 'map', 'max', 'memoryview', 'min', 'next', 'object', 'oct', 'open', 'ord', 'pow', 'print', 'property', 'quit', 'range', 'raw_input', 'reduce', 'reload', 'repr', 'reversed', 'round', 'set', 'setattr', 'slice', 'sorted', 'staticmethod', 'str', 'sum', 'super', 'tuple', 'type', 'unichr', 'unicode', 'vars', 'xrange', 'zip']
```

## 一切皆对象

在 Python 中，object 类是所有类的基类。这意味着无论你定义的类是什么，最终都是从 object 类继承而来的。以下是关于 Python object 类的一些关键点：

```python
().__class__.__bases__[0].subclasses__()
```

### 内置属性

`__class__`

每个对象都有一个 `__class__` 属性，它指向该对象所属的类。`__class__` 是一个内置属性，可以用来动态地获取和确认对象的类型或类。

obj.__class__ 返回的是对象 obj 的类的引用。也就是说，它是一个类对象，而不是一个实例。

## 参考资料

- <https://ciphersaw.me/ctf-wiki/pwn/linux/sandbox/python-sandbox-escape/>
- <https://medium.com/@damarabrianr/hackthebox-code-writeup-from-python-sandbox-escape-to-root-via-json-bypass-16d668bd307e>
- <https://blog.ionelmc.ro/2015/02/09/understanding-python-metaclasses/>
