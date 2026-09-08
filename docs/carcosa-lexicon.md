# Carcosa 词根词缀字典

这是 Carcosa 密文风格的词根、词缀、颗粒词和标点参考。词表由程序运行时生成；词缀与颗粒词只负责视觉构词，不参与密码学解码。

原始 HTML 版仍保留在 [`carcosa-lexicon.html`](./carcosa-lexicon.html)。

## 词表概览

| 模式 | register | 词表规模 | 基数 | 输出膨胀 |
|---|---|---:|---:|---:|
| R'lyehian | 粗粝口语 | 256 个音节 | base 256 | 约 5 字符/字节 |
| Elder Gods | 经文式祷文 | 32 个神名 | base 32 | 约 11 字符/字节 |

## R'lyehian

R'lyehian 使用原 Deep One 词典：厚重辅音起始、非自然元音核心和鼻音结尾组成 256 个等长音节。

### 音位构件

- **声母（onset）**：`kh`、`gh`、`sh`、`th`、`mh`、`ng`、`dh`、`wg`
- **元音核心（nucleus）**：`aa`、`ee`、`ii`、`oo`、`uu`、`ae`、`ai`、`au`、`ei`、`ou`、`oe`、`ui`、`ea`、`oi`、`ia`、`uo`
- **韵尾（coda）**：`g`、`n`

每个词根按下式生成：

```text
onset × nucleus × coda = 8 × 16 × 2 = 256
```

例如：

```text
khaag  = kh + aa + g
khaan  = kh + aa + n
ghuog  = gh + uo + g
wgoun  = wg + ou + n
```

所有词根长度相同，因此词表前缀无关；base-256 下每个词根直接对应一个字节。空字符串是明确分隔符，空格也始终可作为视觉分隔。

### 词缀

| 词缀 | 词性 | 示例 |
|---|---|---|
| `-qy` | 名词 noun | `khaag'khaagqy` |
| `-jz` | 动词 verb | `khaag'khaagjz` |
| `-bf` | 形容词 adjective | `thiin'ghaag'shounbf` |

词根只使用 `a d e g h i k m n o s t u w`；词缀使用其他字母，避免被误读为词根。

### 颗粒词

| 位置 | 出现条件 | 词表 |
|---|---|---|
| 句首 opener | `seed % 4 === 0` | `«khth»`、`«mglh»`、`«dhsh»` |
| 从句连接 joiner | `(seed + ci + wj) % 3 === 1` | `«wgh»`、`«ghuun»`、`«nhgh»` |
| 句尾 closer | `seed % 2 === 0` | `«nghth»`、`«ghuukth»`、`«wgmh»` |

示例：

```text
«khth» Khaag'khaagqy khaag'khaagjz «ghuun»;
khoog'wgoogqy ngoen'mhaen'wguugbf. «nghth»
```

### 标点与分隔

- 语法标点：`- ~ , . ; : ! ? ' —`
- 撇号用于词内视觉连接，可通过 `conjunction: false` 关闭。
- `«…»` 区域、空白、词缀和标点在解码时透明。

## Elder Gods

Elder Gods 使用 32 个神名作为 base-32 词根。每个名字本身就是完整词，因此没有词缀；语法只依靠颗粒词和标点。

| digit | name | digit | name | digit | name | digit | name |
|---:|---|---:|---|---:|---|---:|---|
| 0 | Cthulhu | 8 | Tsathoggua | 16 | Ithaqua | 24 | Ossadogwah |
| 1 | Yog-Sothoth | 9 | Yig | 17 | Cthylla | 25 | Rhan-Tegoth |
| 2 | Azathoth | 10 | Ghatanothoa | 18 | Abhoth | 26 | Tulzscha |
| 3 | Nyarlathotep | 11 | Nodens | 19 | Ubbo-Sathla | 27 | Byatis |
| 4 | Shub-Niggurath | 12 | Y'golonac | 20 | Mordiggian | 28 | Gnophkeh |
| 5 | Hastur | 13 | Gla'aki | 21 | Nyogtha | 29 | Zathog |
| 6 | Dagon | 14 | Eihort | 22 | Zhar | 30 | Kthanid |
| 7 | Hydra | 15 | Vulthoom | 23 | Lloigor | 31 | Cxaxukluth |

### Elder Gods 颗粒词

- 句首：`«Iä»`、`«Nyarlat»`
- 从句连接：`«R'lyeh»`、`«Sothoth»`、`«ftaghn»`
- 句尾：`«fhtagn»`、`«cthulhu»`

`-` 和 `'` 是神名内部的合法字符，因此 Elder Gods 使用 `!` 和 `·` 作为明确分隔符。

## 可逆性

每个词根对应一个数字。编码先写入 5 个数字的长度头，再接正文数字流。解码器会透明剥离：

- 词缀；
- 语法标点；
- 空白与模式分隔符；
- 完整的 `«…»` 颗粒词区域。

因此 `particles: false`、CLI 的 `-P/--no-particles` 或前端开关只改变外观，不改变解码结果。

