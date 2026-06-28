#!/usr/bin/env bun
/**
 * 虾线橘猫 IP 配图生成 — 即梦4.0 API + 参考图
 *
 * 用法:
 *   bun scripts/generate.ts "场景描述" [输出路径] [尺寸]
 *   bun scripts/generate.ts --batch prompt-list.txt ./output/ 16:9
 */

import { createHash, createHmac } from "crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { basename, join, resolve } from "path";

// ── 配置 ──
const API_HOST = process.env.VOLC_API_HOST || "visual.volcengineapi.com";
const AK = process.env.VOLC_ACCESS_KEY || "";
const SK = process.env.VOLC_SECRET_KEY || "";
const REQ_KEY = "jimeng_t2i_v40";

const SIZE_MAP: Record<string, { w: number; h: number }> = {
// 贴图号默认 3:4 竖版
  "3:4": { w: 1728, h: 2304 },
  "16:9": { w: 2560, h: 1440 },
  "1:1": { w: 1328, h: 1328 },
  "9:16": { w: 1440, h: 2560 },
  "4:3": { w: 2304, h: 1728 },
};

// 参考图路径（相对于 skill 目录）
const REF_DIR = resolve(import.meta.dir, "..", "references");
const REF_IMAGES = ["01-front.png"];

// ── IP Prompt 模板 ──
function buildPrompt(scene: string): string {
  return `简笔画风格，手绘线稿，纯白背景。一只橘白相间的猫咪，${scene}。猫咪特征：白色打底毛色，脸颊和额头有橘色斑块。背部正中央（脊柱位置，后颈到尾根）有一条纵向橘色条纹，天生的毛色，不是贴上去的图案。圆眼睛，表情呆萌认真，不卖萌，不笑。身体圆润但不过分肥胖。画面要求：黑色细线勾勒轮廓，线条略带手绘抖动感。内部不上色，除了橘色条纹和橘色脸颊斑块。纯白背景，无纹理，无阴影，无渐变。大量留白，猫咪只占画面中间约40%。3比4竖版构图。整体风格清爽极简手绘草图感，不要精致插画感。`;
}

// ── API 签名 ──
function sha256(d: string) { return createHash("sha256").update(d).digest("hex"); }
function hmacSha256(k: Buffer, d: string) { return createHmac("sha256", k).update(d).digest(); }

function signRequest(body: string, timestamp: string, query: string): Record<string, string> {
  const date = timestamp.substring(0, 8);
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    "Host": API_HOST,
    "X-Date": timestamp,
  };
  const signedHeaders = Object.keys(h).map(k => k.toLowerCase()).sort().join(";");
  const canonicalHeaders = Object.keys(h).sort().map(k => `${k.toLowerCase()}:${h[k].trim()}`).join("\n");
  const canonicalRequest = ["POST", "/", query, canonicalHeaders + "\n", signedHeaders, sha256(body)].join("\n");
  const scope = `${date}/cn-north-1/cv/request`;
  const sts = ["HMAC-SHA256", timestamp, scope, sha256(canonicalRequest)].join("\n");
  let k = hmacSha256(Buffer.from(SK, "utf-8"), date);
  k = hmacSha256(k, "cn-north-1");
  k = hmacSha256(k, "cv");
  k = hmacSha256(k, "request");
  h["Authorization"] = `HMAC-SHA256 Credential=${AK}/${scope}, SignedHeaders=${signedHeaders}, Signature=${createHmac("sha256", k).update(sts).digest("hex")}`;
  return h;
}

async function apiCall(action: string, body: Record<string, unknown>) {
  const query = `Action=${action}&Version=2022-08-31`;
  const ts = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const bodyStr = JSON.stringify(body);
  const headers = signRequest(bodyStr, ts, query);
  const resp = await fetch(`https://${API_HOST}/?${query}`, { method: "POST", headers, body: bodyStr });
  return resp.json();
}

// ── 加载参考图 ──
function loadReferenceImages(): string[] {
  const refs: string[] = [];
  for (const f of REF_IMAGES) {
    const p = join(REF_DIR, f);
    if (existsSync(p)) refs.push(readFileSync(p).toString("base64"));
  }
  return refs;
}

// ── 生成单张 ──
async function generate(sceneDesc: string, outputPath: string, size: { w: number; h: number }): Promise<boolean> {
  const prompt = buildPrompt(sceneDesc);
  const refs = loadReferenceImages();

  process.stdout.write(`  提交中...`);

  const submitBody: Record<string, unknown> = {
    req_key: REQ_KEY,
    prompt,
    seed: -1,
    width: size.w,
    height: size.h,
  };

  if (refs.length > 0) {
    submitBody.binary_data_base64 = refs;
    process.stdout.write(` (带${refs.length}张参考图)`);
  }

  const submitResult: any = await apiCall("CVSync2AsyncSubmitTask", submitBody);
  if (submitResult.code !== 10000) {
    console.log(` ❌ API错误: ${JSON.stringify(submitResult).slice(0, 300)}`);
    return false;
  }

  const taskId = submitResult.data?.task_id;
  process.stdout.write(` #${taskId.slice(-8)}`);

  const deadline = Date.now() + 180000;
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 2000));
    const pollResult: any = await apiCall("CVSync2AsyncGetResult", { req_key: REQ_KEY, task_id: taskId });
    const data = pollResult.data || pollResult;
    process.stdout.write(` → ${data.status}`);

    if (data.status === "done") {
      const urls = data.image_urls || data.binary_data_base64;
      if (urls?.length) {
        const img = urls[0];
        if (typeof img === "string" && img.startsWith("http")) {
          const r = await fetch(img);
          writeFileSync(outputPath, Buffer.from(await r.arrayBuffer()));
        } else {
          const b64 = typeof img === "string" && img.includes(",") ? img.split(",")[1] : img;
          writeFileSync(outputPath, Buffer.from(b64, "base64"));
        }
        console.log(` ✅`);
        return true;
      }
      console.log(` ❌ 无图片数据`);
      return false;
    }
    if (["failed", "not_found", "expired"].includes(data.status)) {
      console.log(` ❌ ${data.status}`);
      return false;
    }
  }
  console.log(` ❌ 超时`);
  return false;
}

// ── 主入口 ──
async function main() {
  const args = process.argv.slice(2);

  if (!AK || !SK) {
    console.log("❌ 请配置 .env 文件 (VOLC_ACCESS_KEY + VOLC_SECRET_KEY)");
    process.exit(1);
  }

  if (args[0] === "--batch") {
    // 批量模式：从文本文件读取场景描述
    const file = args[1];
    const outDir = args[2] || "./output";
    const size = SIZE_MAP[args[3] || "16:9"] || SIZE_MAP["16:9"];

    if (!file || !existsSync(file)) { console.log("❌ 文件不存在"); process.exit(1); }
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

    const scenes = readFileSync(file, "utf-8").split("\n")
      .map(l => l.trim()).filter(l => l && !l.startsWith("#"));

    console.log(`\n🐱 虾线橘猫批量配图 (参考图: ${REF_IMAGES.join(", ")})`);
    console.log(`   数量: ${scenes.length}  尺寸: ${size.w}x${size.h}\n`);

    let ok = 0;
    for (let i = 0; i < scenes.length; i++) {
      const outPath = join(outDir, `xiaxia-${String(i + 1).padStart(2, "0")}.png`);
      console.log(`[${i + 1}/${scenes.length}] ${scenes[i].slice(0, 40)}...`);
      if (await generate(scenes[i], outPath, size)) ok++;
      if (i < scenes.length - 1) await new Promise(r => setTimeout(r, 4000));
    }
    console.log(`\n📊 ${ok}/${scenes.length} 成功\n`);
  } else {
    // 单张模式
    const scene = args[0];
    const outPath = args[1] || `/tmp/xiaxia-${Date.now()}.png`;
    const size = SIZE_MAP[args[2] || "16:9"] || SIZE_MAP["16:9"];

    if (!scene) {
      console.log("用法: bun scripts/generate.ts '场景描述' [输出路径] [16:9|3:4|1:1]");
      console.log("      bun scripts/generate.ts --batch scenes.txt ./output/ 16:9");
      process.exit(1);
    }

    console.log(`\n🐱 虾线橘猫配图 (参考图: ${REF_IMAGES.join(", ")})`);
    console.log(`   场景: ${scene.slice(0, 60)}...`);
    await generate(scene, outPath, size);
  }
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
