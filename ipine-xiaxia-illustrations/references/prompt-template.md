---
tags:
  - IP形象
  - 猫咪
  - 虾线橘猫
  - Skill
---

# 虾线橘猫 Prompt 模板

> 基于 `ian-xiaohei-illustrations` 的 `prompt-template.md` 改写。
> 核心变化：把"小黑"替换为"虾线橘猫"，保留整体结构和约束。

---

## 主生成 Prompt

Generate one standalone 16:9 horizontal Chinese article illustration.

Pure white background. Minimalist black hand-drawn line art. Slightly wobbly pen lines. Lots of empty white space.

The recurring character is **虾线橘猫**, an orange-and-white cat with a distinctive orange stripe running down the center of its back (like a shrimp on its back). White face mask, orange patches on top of head and cheeks. Round eyes with blank serious expression. Slightly chubby but proportional cat body. Short thick legs. Tail has orange-and-white rings. Slightly uneven hand-drawn body outline.

虾线橘猫 must perform the core conceptual action, not decorate the scene. 虾线橘猫 should be serious, deadpan, and slightly bizarre, not cute. The orange shrimp-line on its back must be clearly visible.

---

## 变量占位符

| 变量 | 说明 |
|------|------|
| `{{theme}}` | 文章主题/核心概念 |
| `{{structure_type}}` | 结构类型：Workflow / 系统局部 / 前后对比 / 角色状态 / 概念隐喻 / 方法分层 / 地图路线 / 小漫画分镜 |
| `{{core_idea}}` | 这张图要传达的核心认知 |
| `{{composition}}` | 构图描述 |
| `{{suggested_elements}}` | 建议出现的物件或场景元素 |
| `{{labels}}` | 中文手写批注内容（2-8 个字每处，最多 5-8 处） |

---

## 颜色规则

- **Black**: main line art, 虾线橘猫 outline, structure, main text, primary objects
- **Orange**: 虾线橘猫's orange patches and shrimp-line, main flow/path/arrows
- **Red**: only for key warnings/problems/results
- **Blue**: only for secondary notes or feedback/system state

---

## 关键约束

- One image explains only one core structure.
- Keep the main subject around 40%-60% of the canvas.
- Preserve at least 35% blank white space.
- Do not write a title in the top-left corner.
- Do not write the structure type on the image.
- 虾线橘猫's back shrimp-line must be visible in every image.

---

## 图像编辑 Prompt

### 1. 移除标题
"Remove only the handwritten title and its underline from the top-left corner. Fill that area with the same clean white background."

### 2. 强化动作主体
"Make 虾线橘猫 more central to the conceptual action. 虾线橘猫 should be doing the strange work that explains the idea, not standing beside the diagram. Ensure the orange shrimp-line on its back is clearly visible."