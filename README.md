# ipine-xiaxia-illustrations

> 虾线橘猫 IP 插图 Skill。把中文文章里的判断、流程、状态和隐喻，变成白底、手绘、怪诞但清爽的正文配图。

默认视觉 IP 是"虾线橘猫"：橘白相间猫咪，背部正中一条纵向橘色条纹，圆眼、空表情，认真做荒诞但成立的事。背上的虾线必须清晰可见。

---

## 这是什么

一个 Claude Code Skill。告诉 AI"画虾线橘猫在干嘛"，它自动按角色设定出图——纯白背景、极简手绘线稿、风格统一。

基于开源项目改造，把原有角色替换为虾线橘猫 IP。

---

## 文件结构

```
├── SKILL.md              # Skill 定义
├── references/           # 风格DNA、角色设定、prompt模板
│   ├── style-dna.md
│   ├── xiaohei-ip.md
│   ├── prompt-template.md
│   ├── composition-patterns.md
│   └── qa-checklist.md
└── examples/images/      # 风格参考图（即梦API生成）
```

---

## 安装

```bash
cp -r ipine-xiaxia-illustrations ~/.claude/skills/
```

---

## 使用

在 Claude Code 中说：

```
帮我用虾线橘猫画一张图：猫趴在键盘上，表情认真
```

Skill 会自动按角色设定写 prompt，生成风格统一的插图。

---

## 生图模型

使用 **即梦 4.0**（jimeng_t2i_v40），通过火山引擎 API 调用。国内直连，手机号注册即可。

> 本仓库是 Skill 定义文件。实际生图需配置即梦 API 后端。

---

## 许可

MIT
