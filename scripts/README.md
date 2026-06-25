# Claude Code 桥接脚本

> 原 Skill 设计用于内置 `image_gen` 的 Codex 环境。Claude Code（Anthropic）没有内置生图能力，因此需要这些桥接脚本调用外部 API。

---

## 前置要求

1. **OpenAI API Key**
   - 访问 https://platform.openai.com/api-keys 申请
   - 设置环境变量：
     ```bash
     export OPENAI_API_KEY="sk-你的key"
     # 建议加到 ~/.zshrc 或 ~/.bashrc
     ```

2. **安装依赖**
   ```bash
   pip install openai
   ```

---

## 使用方法

### 直接命令行调用

```bash
python3 scripts/generate_image.py \
  -p "A hand-drawn style illustration of an orange-and-white cat with a shrimp-line on its back, pure white background, black sketch lines, minimal style" \
  -o "assets/my-article/01-topic.png"
```

### 在 Claude Code 中使用

Claude Code 读取 SKILL.md 和 references/ 文件后，会输出详细的生图 prompt。然后你手动运行：

```bash
python3 scripts/generate_image.py -p "<Claude 输出的英文 prompt>" -o "<输出路径>"
```

### 批量生成

如果有多个 prompt，可以写一个简单的 shell 循环：

```bash
for i in 01 02 03; do
  read -p "输入第 $i 张的 prompt: " p
  python3 scripts/generate_image.py -p "$p" -o "assets/article/$i-topic.png"
done
```

---

## 关于 Prompt 语言

DALL-E 3 对**英文 prompt** 理解更好，建议：
- 让 Claude 先用中文理解文章，输出**英文生图 prompt**
- 把英文 prompt 传给 `generate_image.py`

---

## 费用参考（OpenAI DALL-E 3）

| 质量 | 尺寸 | 单价 |
|------|------|------|
| Standard | 1024×1024 | $0.040/张 |
| Standard | 1792×1024 | $0.080/张 |
| HD | 1024×1024 | $0.080/张 |
| HD | 1792×1024 | $0.120/张 |

正文配图推荐 **Standard 1792×1024**，接近 16:9，$0.08/张。一篇文章 5 张图约 $0.4。

---

## 替代方案

如果不想用 OpenAI API，可以修改 `generate_image.py` 接入其他平台：

- **Stability AI**（更便宜，$0.003-0.04/张）
- **Midjourney API**（效果好，但 API 较难申请）
- **本地 Stable Diffusion**（免费，但需要 GPU）
- **国内平台**：通义万相、即梦、可灵（需各自 API）
