# Emoji Maker

[English](./README.en.md) | [中文](./README.md)

一个简单易用的在线表情包制作工具。

## 功能特性

- 🖼️ 图片上传：支持多图片上传和组合
- ✍️ 文字编辑：支持添加、编辑和样式设置
- 🎨 样式定制：
  - 文字大小（12px - 72px）
  - 文字颜色自定义
  - 多种聊天气泡样式（绿色、蓝色、灰色，支持左右方向）
  - 透明底色聊天气泡
  - 圆角边框、方形边框、阴影边框等样式
- 🔄 元素控制：
  - 拖拽移动
  - 大小调整（图片：50px - 500px）
  - 旋转（0-360度）
  - 删除（支持 Delete/Backspace 键）
- 📱 自适应布局：适配不同屏幕尺寸
- 📋 图层管理：支持图层拖拽排序
- 💾 导出功能：一键导出表情图片

## 技术栈

- Vue 3
- TypeScript
- Vite
- html2canvas

## 开发环境设置

1. 克隆项目

```bash
git clone [项目地址]
cd emoji-maker
```

2. 安装依赖

```bash
pnpm install
```

3. 启动开发服务器

```bash
pnpm dev
```

4. 构建项目

```bash
pnpm build
```

## 使用说明

1. 上传图片：点击"上传图片"按钮选择一个或多个图片
2. 添加文字：点击"添加文字"按钮
3. 编辑元素：
   - 拖拽移动：直接用鼠标拖动元素
   - 调整大小：选中元素后使用右侧控制面板的滑块
   - 旋转：选中元素后使用右侧控制面板的旋转滑块
   - 删除：选中元素后点击删除按钮或按键盘删除键
4. 文字样式：
   - 双击文字进行编辑
   - 使用控制面板调整字号、颜色
   - 选择不同的边框样式和聊天气泡效果
5. 图层管理：
   - 在左侧图层面板查看所有元素
   - 拖拽图层改变元素叠加顺序
6. 导出：点击"导出表情"按钮保存图片

## 贡献

欢迎提交 Issue 和 Pull Request。

## 许可证

[MIT](LICENSE)

## 致谢

本项目使用 [Cursor](https://cursor.sh/) 编辑器开发，项目中的所有代码均由 Cursor 内置的 AI 助手（Claude）自动生成和优化，这充分展示了 AI 辅助编程的强大能力。Cursor 是一个革命性的 AI 驱动的代码编辑器，它不仅提供了智能的代码补全和重构建议，更可以通过自然语言对话来实现完整的功能开发。感谢 Cursor 团队开发了这么优秀的工具，让编程变得更加高效和有趣。

到 v28 版本为止，共计使用 50 次 Claude 次数。
