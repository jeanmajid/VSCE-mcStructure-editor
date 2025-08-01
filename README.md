# Minecraft Structure Editor

A Visual Studio Code extension that allows you to edit Minecraft `.mcstructure` files as human-readable JSON format.

## Features

- **Convert .mcstructure to JSON**: Open Minecraft structure files as editable JSON
- **Save JSON back to .mcstructure**: Convert your edited JSON back to the binary structure format by pressing the save button

## Usage

### Opening .mcstructure Files

There are several ways to open a `.mcstructure` file for editing:

#### Method 1: Default Editor (Recommended)
1. Simply **click** on any `.mcstructure` file in the Explorer
2. The extension will automatically convert it to JSON and open it in the editor
3. You'll see a loading message briefly, then the JSON content will appear

#### Method 2: Context Menu
1. **Right-click** on a `.mcstructure` file in the Explorer
2. Select **"Open MCStructure as JSON"** from the context menu
3. The file will be converted and opened as JSON

#### Method 3: Command Palette
1. Open the Command Palette (`Ctrl+Shift+P`)
2. Type and select **"MCStructure: Open MCStructure as JSON"**
3. Choose your `.mcstructure` file from the file dialog

### Saving Changes

To save your edited JSON back to the original `.mcstructure` format:

1. **Click the "Save as MCStructure" button** in the editor title bar (looks like a save icon)
2. Or use the Command Palette (`Ctrl+Shift+P`) and select **"MCStructure: Save as MCStructure"**

## Requirements

- Visual Studio Code version 1.22.0 or higher
- Node.js (for development)

## Development

### Building the Extension

```bash
npm i
npm run compile
or
npm run watch
```

### Running in Development

1. Open the project in VS Code
2. Press `F5` to start debugging
3. A new Extension Development Host window will open with the extension loaded

### Dependencies

- [prismarine-nbt](https://github.com/PrismarineJS/prismarine-nbt): Used for reading and writing NBT data from Minecraft files

## License

MIT

## Support

If you encounter any issues or have suggestions:
1. Check the [Issues](https://github.com/jeanmajid/VSCE-mcStructure-editor/issues) page for existing reports
2. Create a new issue with detailed information about the problem
