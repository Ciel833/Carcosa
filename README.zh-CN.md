# Carcosa

将平淡的文本编码成不可名状的克苏鲁咏唱。

[English README](./README.md)

<a href="https://ciel833.github.io/Carcosa/"><strong>▶ 打开前端 Demo</strong></a>

> 当人类语言无法承载秘密，只有旧日支配者的低语才能替你守护真相。

这是一个**可逆**的克苏鲁神话密码玩具：任意 UTF-8 输入（英文、表情符号、二进制文件等）都可以编码成三种“洛夫克拉夫特式语言”，并无损解码。可选密码会额外加入密钥流混淆。输出有两种风格：

- **Prose（散文，默认）**：语法引擎将密码数字转换成完整的伪语言文章，包含词性、修饰词和标点，类似 [魔曰 / Abracadabra](https://github.com/SheepChef/Abracadabra) 的句子渲染方式。
- **Verse（诗体）**：初版的咏唱风格，每个格式单元对应一个词。

| 模式 | 风格 | 词表 | 散文示例 |
|---|---|---|---|
| **R'lyehian** | 神圣咏唱 | 27 个音节 | `«mglw» Phanphanzy phanphagjs «wgahn»; ngogmglanzy mglothngogcq. «fhtagn»` |
| **Deep One** | 粗砺口语 | 256 个音节 | `«khth» Khaagkhaagqy khaagkhaagjz «ghuun»; kheanshuundheenqy thiinghaagthoegbf. «nghth»` |
| **Elder Gods** | 经文式祷文 | 32 个名称 | `«Iä» Cthulhu Cthulhu «Sothoth»; Cthulhu Yog-Sothoth. «fhtagn»` |

## 工作原理

编码流程如下：

```text
明文 → UTF-8 字节 → [可选] 密码密钥流 XOR
     → 长度头（5 个 base-N 数字）+ 数值的 base-N 数字
     → 词元查找 → 模式格式化 → 密文
```

解码时会跳过模式分隔符、散文标记、空白和完整的 `«…»` 区域，再通过前缀无关字典树贪婪匹配词元，读取长度并还原原始字节。

### 关键设计

- **长度头位于数字空间中，而不是 BigInt 内部。** 因为 `bytesToBigInt` 会丢弃前导零字节，所以输入长度 `L` 使用 5 个固定宽度的 base-N 数字放在词元流开头。解码时将字节左侧补零到准确的 `L` 字节，因此前导零、全零和二进制数据都能精确往返。
- **前缀无关词表。** 同一模式内没有词元是另一个词元的前缀，因此撇号、空格、`!`、`·` 等格式标记只具有视觉作用。解析时这些标记对匹配透明，甚至可以出现在词元内部。
- **Elder Gods 的分隔符规则。** `-` 和 `'` 可能出现在名称内部（例如 `Yog-Sothoth`、`Y'golonac`、`Gla'aki`），因此该模式使用名称中不会出现的 `!` 和 `·` 作为分隔符。
- **密码密钥流。** 第 `i` 个密钥流字节为 `FNV1a32(password ∥ big-endian u32 i) & 0xff`。空密码表示不进行混淆。
- **Deep One 的 base 256 快速路径。** 它的数字本身就是字节，因此不需要 BigInt 转换。

## 一种语言，三种风格

三种模式使用同一条字节处理流程和同一个语法引擎，区别只在于数字到音素的词表映射。它们是同一种语言的三种发音风格：

- **R'lyehian**：神圣咏唱。27 个音节按 onset(3) × nucleus(3) × coda(3) 构成 27 = 3³，与《克苏鲁的呼唤》中提到的三进制设定相呼应。
- **Deep One**：粗砺口语。由厚重的辅音起始、非自然的元音核心和鼻音结尾构成 256 个等长音节。
- **Elder Gods**：经文式祷文。词表由 Cthulhu、Yog-Sothoth、Azathoth、Nyarlathotep 等 32 个神名组成，因此只使用修饰词和标点，不使用词形后缀。

## 散文模式

散文模式是在同一组数字上的可逆、可完全剥离的视觉包装，不会改变解码逻辑：

1. 每 2–3 个音节组成一个伪词；Elder Gods 每个神名就是一个词。
2. 词语按 `noun → verb → noun → adjective → verb → noun …` 的循环获得词性，并添加模式专用后缀。
3. 修饰词使用 `«…»` 包裹。当前密度较低：句首约 25%，句间约 1/3，句尾约 50%；句末标点始终出现。
4. 句子和标点由数字值确定性选择，因此相同输入始终生成相同文章。

由于修饰词、标点和后缀都可以被解码器剥离，旧版诗体密文也仍可正常解码。

## JavaScript API

在 Node.js 中使用 `require`，在浏览器中使用全局对象 `CthulhuCipher`：

```js
const ciphertext = CthulhuCipher.encodeText('你好，克苏鲁！', {
  mode: 'rlyehian',
  password: 'optional-password'
});

const plaintext = CthulhuCipher.decodeText(ciphertext, {
  mode: 'rlyehian',
  password: 'optional-password'
});
```

也可以直接处理二进制数据：

```js
const ciphertext = CthulhuCipher.encodeBytes(bytes, { mode, password });
const bytes = CthulhuCipher.decode(ciphertext, { mode, password });
```

## 限制与性能

- 单次输入上限（W=5）：R'lyehian 约 14.3 MB，Elder Gods 约 33.5 MB，Deep One 约 1.1 TB；实际还受 BigInt 和内存限制。
- 输出膨胀：Deep One 约为每字节 5 个字符，R'lyehian 约 8 个字符，Elder Gods 约 11 个字符。
- 几 KB 输入可即时处理；1 MB Deep One 约需 0.3–3 秒，R'lyehian 和 Elder Gods 在大文件上会更慢。

## 开发

项目零依赖，使用 Node.js 内置测试运行器：

```bash
npm test
```

测试覆盖三种模式、有无密码、中文、表情符号、组合字符、RTL 文本、NUL、前导零、全 `0xFF`、空输入、边界长度、词表属性、篡改密文、密钥流确定性、垃圾输入拒绝、性能，以及散文/诗体兼容性。

## 后续计划

未来版本计划加入：

- 修饰词密度调节
- 句式随机性调节
- 转轮加密

## 安全声明

这是**密码学强度很低的混淆工具，不是安全加密方案**，请勿用于保护真实机密：

- 相同密码和明文会产生相同密文。
- 未针对密码分析进行强化，重复密文会泄露结构。
- 截断或篡改密文可能得到看似合理但错误的明文。


## 许可证

MIT © 2026 Ciel
