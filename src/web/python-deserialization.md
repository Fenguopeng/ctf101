# Python 反序列化漏洞

pickle 是 Python 的一个内置模块，用于序列化和反序列化数据。序列化是指将 Python 对象转换为字节流的过程，而反序列化则是将字节流还原为 Python 对象的过程。

**pickle.dump**
功能：将对象序列化并写入到一个文件对象中。
使用场景：用于将数据持久化到文件，适合需要长期存储的场景。

```python
pickle.dump(obj, file, protocol=None)
```

```python
# 序列化对象
data = {'name': 'Alice', 'age': 30, 'city': 'New York'}

# 将对象序列化到文件
with open('data.pkl', 'wb') as file:
    pickle.dump(data, file)

```

**pickle.dumps**
功能：将对象序列化为一个字节串。
使用场景：适用于需要在内存中处理数据或在网络上传输数据的场景。

```python
pickle.dumps(obj, protocol=None)
```

```python
import pickle

data = {'key': 'value'}

# 将数据序列化为字节串
serialized_data = pickle.dumps(data)
print(serialized_data)  # 输出类似于 b'\x80\x03}q\x00(X\x03...'
```

同时，还有 pickle.load 和 pickle.loads

```python
import pickle

# 反序列化对象
with open('data.pkl', 'rb') as file:
    loaded_data = pickle.load(file)

print(loaded_data)  # 输出: {'name': 'Alice', 'age': 30, 'city': 'New York'}
```

基本数据类型的序列化后存储的内容格式：

```python
# python 3.11
import pickle

# 整型
data_int = 42
serialized_int = pickle.dumps(data_int)
print(serialized_int) # 输出: b'\x80\x04K*.' (Python 3.x)

# 浮点型
data_float = 3.14
serialized_float = pickle.dumps(data_float)
print(serialized_float) # 输出: b'\x80\x04G@\t\x1e\xb8Q\xeb\x85\x1f' (Python 3.x)

# 字符串
data_str = "Hello, World!"
serialized_str = pickle.dumps(data_str)
print(serialized_str) # 输出: b'\x80\x04\x95\x0e\x00\x00\x00\x8c\rHello, World!\x94.' (Python 3.x)

# 布尔值
data_bool = True
serialized_bool = pickle.dumps(data_bool)
print(serialized_bool) # 输出: b'\x80\x04\x88.' (Python 3.x)

# None
data_none = None
serialized_none = pickle.dumps(data_none)
print(serialized_none) # 输出: b'\x80\x04N.' (Python 3.x)

# 列表
data_list = [1, 2, 3]
serialized_list = pickle.dumps(data_list)
print(serialized_list) # 输出: b'\x80\x04\x95\x07\x00\x00\x00]\x94(K\x01K\x02K\x03e.' (Python 3.x)

# 元组
data_tuple = (1, 2, 3)
serialized_tuple = pickle.dumps(data_tuple)
print(serialized_tuple) # 输出: b'\x80\x04\x95\x07\x00\x00\x00(K\x01K\x02K\x03t.' (Python 3.x)

# 字典
data_dict = {'a': 1, 'b': 2}
serialized_dict = pickle.dumps(data_dict)
print(serialized_dict) # 输出: b'\x80\x04\x95\x0e\x00\x00\x00}\x94(\x8c\x01a\x94K\x01\x8c\x01b\x94K\x02u.' (Python 3.x)

# 集合
data_set = {1, 2, 3}
serialized_set = pickle.dumps(data_set)
print(serialized_set) # 输出: b'\x80\x04\x95\x07\x00\x00\x00\x8c\x03set\x94(K\x01K\x02K\x03e.' (Python 3.x)
```

序列化后，pickle 数据的存储方式取决于使用的协议，pickle 模块 提供了多个协议：

- 协议 0：ASCII；兼容性最佳，但体积相对较大。
- 协议 1：旧版二进制格式；比协议 0 体积小。
- 协议 2：提供对较新特性的支持，使用于 Python 2.x。
- 协议 3：引入 Python 3，支持对 bytes 数据类型的序列化。
- 协议 4：支持更多数据类型，擅长序列化大型数据。
- 协议 5：是 Python 3.8 新增的，支持更大的数据量以及更高效的序列化。

| 操作码 (Opcode) | 字节 (Bytes)  | 说明 (Description)                                                       | 中文说明                             |  
|------------------|---------------|--------------------------------------------------------------------------|--------------------------------------|  
| MARK             | `b'('`        | 推送特殊标记对象到栈上                                                   | 将特殊标记对象推入栈上               |  
| STOP             | `b'.'`        | 每个 pickle 以 STOP 结束                                                 | 每个 pickle 的结尾标记               |  
| POP              | `b'0'`        | 丢弃栈顶元素                                                             | 丢弃栈顶元素                         |  
| POP_MARK         | `b'1'`        | 丢弃自栈顶到顶部标记之间的所有元素                                        | 丢弃栈顶到顶部标记之间的所有元素     |  
| DUP              | `b'2'`        | 复制栈顶元素                                                             | 复制栈顶元素                         |  
| FLOAT            | `b'F'`        | 推送浮点对象；十进制字符串参数                                            | 推送浮点对象，参数为十进制字符串     |  
| INT              | `b'I'`        | 推送整数或布尔值；十进制字符串参数                                        | 推送整数或布尔值，参数为十进制字符串 |  
| BININT           | `b'J'`        | 推送四字节有符号整数                                                     | 推送四字节有符号整数                 |  
| BININT1          | `b'K'`        | 推送一个字节的无符号整数                                                  | 推送一个字节的无符号整数             |  
| LONG             | `b'L'`        | 推送长整型；十进制字符串参数                                              | 推送长整型，参数为十进制字符串       |  
| BININT2          | `b'M'`        | 推送两个字节的无符号整数                                                  | 推送两个字节的无符号整数             |  
| NONE             | `b'N'`        | 推送 None                                                                | 推送 None                            |  
| PERSID           | `b'P'`        | 推送持久对象；ID来自字符串参数                                            | 推送持久对象，ID来自字符串参数       |  
| BINPERSID        | `b'Q'`        | 同上，推送持久对象                                                         | 同上，推送持久对象                   |  
| REDUCE           | `b'R'`        | 将可调用对象应用于参数元组，两个都在栈上                                  | 将可调用对象应用于参数元组          |  
| STRING           | `b'S'`        | 推送字符串；换行符结束的字符串参数                                        | 推送字符串，参数以换行符结尾        |  
| BINSTRING        | `b'T'`        | 推送字符串；计数的二进制字符串参数                                        | 推送计数的二进制字符串               |  
| SHORT_BINSTRING  | `b'U'`        | 同上，推送字符串；长度小于 256 字节                                        | 同上，推送长度小于 256 字节的字符串  |  
| UNICODE          | `b'V'`        | 推送 Unicode 字符串；原始 Unicode 转义的参数                              | 推送 Unicode 字符串                  |  
| BINUNICODE       | `b'X'`        | 同上，推送字符串；计数的 UTF-8 字符串参数                                 | 同上，推送计数的 UTF-8 字符串        |  
| APPEND           | `b'a'`        | 将栈顶元素附加到下面的列表                                                | 将栈顶元素附加到下方列表            |  
| BUILD            | `b'b'`        | 调用 `__setstate__` 或 `__dict__.update()`                                | 调用 `__setstate__` 或 `__dict__.update()` |  
| GLOBAL           | `b'c'`        | 推送 `self.find_class(modname, name)`；两个字符串参数                    | 推送 `self.find_class(modname, name)` |  
| DICT             | `b'd'`        | 从栈元素构建字典                                                         | 从栈元素构建字典                    |  
| EMPTY_DICT       | `b'}'`        | 推送空字典                                                               | 推送空字典                          |  
| APPENDS          | `b'e'`        | 通过栈顶切片扩展栈上的列表                                               | 通过栈顶切片扩展栈上的列表          |  
| GET              | `b'g'`        | 从备忘录中推送项目；索引为字符串参数                                      | 从备忘录中推送项目                   |  
| BINGET           | `b'h'`        | 同上，推送项目；使用一个字节作为索引参数                                  | 同上，使用一个字节的索引            |  
| INST             | `b'i'`        | 构建并推送类实例                                                         | 构建并推送类实例                    |  
| LONG_BINGET      | `b'j'`        | 从备忘录中推送项目；索引为四字节参数                                      | 从备忘录中推送项目，索引为四字节参数 |  
| LIST             | `b'l'`        | 从栈顶元素构建列表                                                       | 从栈顶元素构建列表                  |  
| EMPTY_LIST       | `b']'`        | 推送空列表                                                               | 推送空列表                          |  
| OBJ              | `b'o'`        | 构建并推送类实例                                                         | 构建并推送类实例                    |  
| PUT              | `b'p'`        | 将栈顶存储在备忘录中；索引为字符串参数                                  | 将栈顶存储在备忘录中                |  
| BINPUT           | `b'q'`        | 同上，使用一个字节作为索引参数                                           | 同上，使用一个字节的索引            |  
| LONG_BINPUT      | `b'r'`        | 同上，使用四字节作为索引参数                                             | 同上，使用四字节的索引              |  
| SETITEM          | `b's'`        | 向字典中添加键值对                                                       | 向字典中添加键值对                  |  
| TUPLE            | `b't'`        | 从栈顶元素构建元组                                                       | 从栈顶元素构建元组                  |  
| EMPTY_TUPLE      | `b')'`        | 推送空元组                                                               | 推送空元组                          |  
| SETITEMS         | `b'u'`        | 通过添加栈顶的键值对修改字典                                             | 通过添加栈顶的键值对修改字典        |  
| BINFLOAT         | `b'G'`        | 推送浮点数；参数为8字节浮点编码                                          | 推送浮点，参数为8字节浮点           |  

特殊值

| 操作码 (Opcode) | 字节 (Bytes) | 说明 (Description)                                                               | 中文说明                                      |  
|------------------|--------------|----------------------------------------------------------------------------------|-----------------------------------------------|  
| TRUE             | `b'I01\n'`   | 不是操作码；请参见 `pickletools.py` 中的 INT 文档                               | 不是操作码，详见 `pickletools.py` 中的 INT 文档 |  
| FALSE            | `b'I00\n'`   | 不是操作码；请参见 `pickletools.py` 中的 INT 文档                               | 不是操作码，详见 `pickletools.py` 中的 INT 文档 |  

协议2

| 操作码 (Opcode) | 字节 (Bytes)  | 说明 (Description)                                                          | 中文说明                                                  |  
|------------------|---------------|--------------------------------------------------------------------------|-----------------------------------------------------------|  
| PROTO            | `b'\x80'`    | 标识 pickle 协议                                                      | 标识 pickle 协议                                          |  
| NEWOBJ           | `b'\x81'`    | 通过应用 `cls.__new__` 构建对象                                      | 通过应用 `cls.__new__` 构建对象                          |  
| EXT1             | `b'\x82'`    | 从扩展注册表中推送对象；1字节索引                                     | 从扩展注册表中推送对象，使用1字节索引                    |  
| EXT2             | `b'\x83'`    | 同上，但使用2字节索引                                                  | 同上，但使用2字节索引                                    |  
| EXT4             | `b'\x84'`    | 同上，但使用4字节索引                                                  | 同上，但使用4字节索引                                    |  
| TUPLE1           | `b'\x85'`    | 从栈顶构建1元组                                                        | 从栈顶构建1元组                                          |  
| TUPLE2           | `b'\x86'`    | 从两个栈顶元素构建2元组                                               | 从两个栈顶元素构建2元组                                  |  
| TUPLE3           | `b'\x87'`    | 从三个栈顶元素构建3元组                                               | 从三个栈顶元素构建3元组                                  |  
| NEWTRUE          | `b'\x88'`    | 推送 True                                                              | 推送 True                                               |  
| NEWFALSE         | `b'\x89'`    | 推送 False                                                             | 推送 False                                              |  
| LONG1            | `b'\x8a'`    | 推送小于256字节的长整型                                                 | 推送小于256字节的长整型                                  |  
| LONG4            | `b'\x8b'`    | 推送非常大的长整型                                                     | 推送非常大的长整型                                      |  

协议3

| 操作码 (Opcode) | 字节 (Bytes) | 说明 (Description)                                           | 中文说明                          |  
|------------------|--------------|------------------------------------------------------------|-----------------------------------|  
| BINBYTES         | `b'B'`      | 推送字节；计数的二进制字符串参数                            | 推送字节，参数为计数的二进制字符串  |  
| SHORT_BINBYTES   | `b'C'`      | 同上；长度小于256字节                                      | 同上，长度小于256字节              |  

协议4：

| 操作码 (Opcode)     | 字节 (Bytes)  | 说明 (Description)                                        | 中文说明                              |  
|----------------------|---------------|---------------------------------------------------------|---------------------------------------|  
| SHORT_BINUNICODE     | `b'\x8c'`    | 推送短字符串；UTF-8 长度小于256字节                     | 推送短字符串，UTF-8 长度小于256字节   |  
| BINUNICODE8          | `b'\x8d'`    | 推送非常长字符串                                         | 推送非常长字符串                     |  
| BINBYTES8            | `b'\x8e'`    | 推送非常长字节字符串                                     | 推送非常长字节字符串                 |  
| EMPTY_SET            | `b'\x8f'`    | 推送空集合                                               | 推送空集合                            |  
| ADDITEMS             | `b'\x90'`    | 通过添加栈顶元素修改集合                                 | 通过添加栈顶元素修改集合             |  
| FROZENSET            | `b'\x91'`    | 从栈顶元素构建冻结集合                                   | 从栈顶元素构建冻结集合               |  
| NEWOBJ_EX            | `b'\x92'`    | 类似于 NEWOBJ，但处理关键字参数                         | 类似于 NEWOBJ，但处理关键字参数      |  
| STACK_GLOBAL         | `b'\x93'`    | 与 GLOBAL 相同，但使用栈上的名称                       | 与 GLOBAL 相同，使用栈名称            |  
| MEMOIZE              | `b'\x94'`    | 将栈顶存储在备忘录中                                    | 将栈顶存储在备忘录中                 |  
| FRAME                | `b'\x95'`    | 表示新框架的开始                                        | 表示新框架的开始                     |  

```python
import pickle

class test:
    def __init__(self):
        self.people = 'lituer'

a = test()
serialized = pickle.dumps(a, protocol=3)  # 指定PVM 协议版本
print(serialized)

unserialized = pickle.loads(serialized)  # 注意，loads 能够自动识别反序列化的版本
print(unserialized.people)
```

Python 官方提供了工具，叫 pickletools 它的作用主要是：

- 可读性较强的方式展示一个序列化对象（pickletools.dis）
- 对一个序列化结果进行优化（pickletools.optimize）

```python
import pickle
import pickletools

a = test()
serialized = pickle.dumps(a, protocol=3)  # 指定PVM 协议版本
print(pickletools.dis(serialized))
```

## `__reduce__`方法

`__reduce__` 是 Python 中一个特殊的方法，用于自定义如何序列化（pickling）和反序列化（unpickling）对象。

## 参考资料

- <https://tttang.com/archive/1885/>
- <https://www.digitalocean.com/community/tutorials/python-pickle-example>
- <https://medium.com/@harryfyx/writeup-uiuctf-2024-push-and-pickle-cf821c49194f>
- <https://infosecwriteups.com/vulnerabilities-in-python-serialization-pickle-d2385de642f6>
