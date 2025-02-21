# Emoji Maker

[English](./README.en.md) | [中文](./README.md)

A simple and easy-to-use online emoji maker tool.

## Features

- 🖼️ Image Upload: Support multiple image uploads and combinations
- ✍️ Text Editing: Support adding, editing, and style settings
- 🎨 Style Customization:
  - Text size (12px - 72px)
  - Custom text color
  - Multiple chat bubble styles (green, blue, gray, with left and right directions)
  - Transparent background chat bubbles
  - Rounded corners, square borders, shadow borders, and more
- 🔄 Element Control:
  - Drag and drop movement
  - Size adjustment (images: 50px - 500px)
  - Rotation (0-360 degrees)
  - Deletion (supports Delete/Backspace keys)
- 📱 Responsive Layout: Adapts to different screen sizes
- 📋 Layer Management: Support layer drag and drop sorting
- 💾 Export Function: One-click emoji image export

## Tech Stack

- Vue 3
- TypeScript
- Vite
- html2canvas

## Development Setup

1. Clone the project

```bash
git clone [project URL]
cd emoji-maker
```

1. Install dependencies

```bash
pnpm install
```

1. Start development server

```bash
pnpm dev
```

1. Build project

```bash
pnpm build
```

## Usage Guide

1. Upload Images: Click the "Upload Image" button to select one or more images
2. Add Text: Click the "Add Text" button
3. Edit Elements:
   - Drag Movement: Directly drag elements with mouse
   - Size Adjustment: Use the slider in the right control panel when element is selected
   - Rotation: Use the rotation slider in the right control panel when element is selected
   - Delete: Click delete button or press keyboard delete key when element is selected
4. Text Styles:
   - Double-click text to edit
   - Use control panel to adjust font size and color
   - Choose different border styles and chat bubble effects
5. Layer Management:
   - View all elements in the left layer panel
   - Drag layers to change element stacking order
6. Export: Click "Export Emoji" button to save image

## Contributing

Issues and Pull Requests are welcome.

## License

[MIT](LICENSE)

## Acknowledgments

This project was developed using the [Cursor](https://cursor.sh/) editor, with all code automatically generated and optimized by Cursor's built-in AI assistant (Claude), demonstrating the powerful capabilities of AI-assisted programming. Cursor is a revolutionary AI-driven code editor that not only provides intelligent code completion and refactoring suggestions but also enables complete feature development through natural language dialogue. Thanks to the Cursor team for developing such an excellent tool that makes programming more efficient and enjoyable.
