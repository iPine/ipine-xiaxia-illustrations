#!/usr/bin/env python3
"""
虾线橘猫配图生成桥接脚本
用 OpenAI DALL-E 3 替代 Codex 内置的 image_gen
"""

import os
import sys
import json
import argparse
from pathlib import Path

try:
    from openai import OpenAI
except ImportError:
    print("错误：需要安装 openai 库")
    print("运行：pip install openai")
    sys.exit(1)


def generate_image(prompt: str, output_path: str, size: str = "1792x1024"):
    """
    调用 DALL-E 3 生成图片

    Args:
        prompt: 英文或中文生图 prompt
        output_path: 保存路径，如 "assets/article-illustrations/01-topic.png"
        size: DALL-E 3 支持 1024x1024, 1792x1024(横版), 1024x1792(竖版)
              正文配图用 1792x1024（接近 16:9）
    """
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    # 确保输出目录存在
    output_dir = Path(output_path).parent
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"🎨 生成图片: {output_path}")
    print(f"📝 Prompt: {prompt[:100]}...")

    response = client.images.generate(
        model="dall-e-3",
        prompt=prompt,
        size=size,
        quality="standard",  # 或 "hd"（更贵但更精细）
        n=1,
    )

    # DALL-E 3 返回图片 URL
    image_url = response.data[0].url

    # 下载图片
    import urllib.request
    urllib.request.urlretrieve(image_url, output_path)

    print(f"✅ 已保存: {output_path}")
    return output_path


def main():
    parser = argparse.ArgumentParser(description="虾线橘猫配图生成器")
    parser.add_argument("--prompt", "-p", required=True, help="生图 prompt")
    parser.add_argument("--output", "-o", required=True, help="输出路径")
    parser.add_argument("--size", "-s", default="1792x1024",
                        choices=["1024x1024", "1792x1024", "1024x1792"],
                        help="图片尺寸 (默认 1792x1024 横版)")

    args = parser.parse_args()

    if not os.environ.get("OPENAI_API_KEY"):
        print("❌ 错误：未设置 OPENAI_API_KEY 环境变量")
        sys.exit(1)

    generate_image(args.prompt, args.output, args.size)


if __name__ == "__main__":
    main()
