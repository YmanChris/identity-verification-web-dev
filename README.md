<div align="center">
  <img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Identity Verification Flow

一个用于身份文件采集与确认的前端流程 Demo。支持选择国家与证件类型，并通过「拍照」或「上传」完成证件采集，最终在确认页预览并输出结构化结果。

## 功能

- 证件选择：支持国家选择（CN/SG），证件类型包括 `National ID`、`Passport`（其他类型置灰）。
- 采集方式：可选「使用摄像头」或「本地上传」。
- 多面采集：`National ID` 需要正反面，`Passport` 仅采集照片页。
- 预览与确认：确认前展示已采集图片，支持返回重拍。
- 输出结果：确认后在控制台输出 JSON 结果（见下方示例）。
- 摄像头体验：包含权限/错误提示、取景框与引导文案，支持安全上下文检查（HTTPS/localhost）。

## 结果输出（示例）

点击确认后，会在浏览器控制台输出如下结构（`images` 为 Base64 Data URL）：

```json
{
  "country": "CN",
  "docType": "National ID",
  "images": {
    "front": "data:image/jpeg;base64,...",
    "back": "data:image/jpeg;base64,..."
  }
}
```

`Passport` 只会包含 `front`（照片页）：

```json
{
  "country": "SG",
  "docType": "Passport",
  "images": {
    "front": "data:image/jpeg;base64,..."
  }
}
```

## 本地运行

**前置条件：** Node.js

1. 安装依赖  
   `npm install`
2. 启动开发服务器  
   `npm run dev`

> 摄像头访问需要安全上下文（HTTPS 或 localhost）。如需外网访问，请使用安全隧道或部署到 HTTPS 环境。
