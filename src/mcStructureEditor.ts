import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as nbt from "prismarine-nbt";

export class McStructureConverter {
    private originalFileMapping = new Map<string, string>();

    /**
     * Open a .mcstructure file and display it as JSON in the editor
     */
    public async openAsJson(uri: vscode.Uri): Promise<void> {
        try {
            const jsonData = await this.loadMcStructureAsJson(uri.fsPath);
            const jsonContent = JSON.stringify(jsonData, null, 4);

            const doc = await vscode.workspace.openTextDocument({
                content: jsonContent,
                language: "json",
            });

            await vscode.window.showTextDocument(doc, {
                preview: false,
                viewColumn: vscode.ViewColumn.Active,
            });

            vscode.commands.executeCommand("setContext", "mcstructure-editor.isActive", true);

            this.setOriginalFilePath(doc, uri.fsPath);

            vscode.window.showInformationMessage(
                `Opened ${path.basename(uri.fsPath)} as JSON. Click the "Save to MCStructure" button in the editor title bar to save changes.`,
                { modal: false }
            );
        } catch (error) {
            throw new Error(`Failed to open mcstructure file: ${error}`);
        }
    }

    /**
     * Save JSON content back as .mcstructure binary file
     */
    public async saveJsonAsStructure(document: vscode.TextDocument): Promise<void> {
        try {
            const jsonText = document.getText();
            let jsonData: any;

            try {
                jsonData = JSON.parse(jsonText);
            } catch (parseError) {
                throw new Error("Invalid JSON format. Please fix JSON syntax errors before saving.");
            }

            const originalPath = this.originalFileMapping.get(document.uri.toString());

            if (originalPath) {
                await this.saveJsonAsMcStructure(jsonData, originalPath);
            } else {
                const saveUri = await vscode.window.showSaveDialog({
                    filters: {
                        "MCStructure files": ["mcstructure"],
                    },
                    defaultUri: vscode.Uri.file(document.fileName.replace(".json", ".mcstructure")),
                });

                if (saveUri) {
                    await this.saveJsonAsMcStructure(jsonData, saveUri.fsPath);
                } else {
                    throw new Error("Save cancelled");
                }
            }
        } catch (error) {
            throw new Error(`Failed to save mcstructure file: ${error}`);
        }
    }

    /**
     * Load .mcstructure file and convert to JSON
     */
    private async loadMcStructureAsJson(filePath: string): Promise<any> {
        try {
            const buffer = fs.readFileSync(filePath);
            return await this.structureToJson(buffer);
        } catch (error) {
            console.error("Error loading mcstructure file:", error);
            return {
                error: "Failed to load mcstructure file",
                message: error instanceof Error ? error.message : String(error),
                timestamp: new Date().toISOString(),
            };
        }
    }

    /**
     * Convert JSON back to .mcstructure format and save
     */
    private async saveJsonAsMcStructure(jsonData: any, filePath: string): Promise<void> {
        try {
            const data = this.parseStructure(jsonData);
            fs.writeFileSync(filePath, data);

            console.log("Saved mcstructure file:", filePath);
        } catch (error) {
            console.error("Error saving mcstructure file:", error);
            throw error;
        }
    }

    /**
     * Store original file path in document metadata
     */
    private setOriginalFilePath(document: vscode.TextDocument, originalPath: string): void {
        this.originalFileMapping.set(document.uri.toString(), originalPath);

        const onActiveEditorChange = vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (editor && editor.document.uri.toString() === document.uri.toString()) {
                vscode.commands.executeCommand("setContext", "mcstructure-editor.isActive", true);
            } else {
                const isMcStructureActive = editor && this.originalFileMapping.has(editor.document.uri.toString());
                vscode.commands.executeCommand("setContext", "mcstructure-editor.isActive", isMcStructureActive);
            }
        });

        const disposable = vscode.workspace.onDidCloseTextDocument((closedDoc) => {
            if (closedDoc.uri.toString() === document.uri.toString()) {
                this.originalFileMapping.delete(document.uri.toString());

                if (this.originalFileMapping.size === 0) {
                    vscode.commands.executeCommand("setContext", "mcstructure-editor.isActive", false);
                }

                disposable.dispose();
                onActiveEditorChange.dispose();
            }
        });
    }

    /**
     * Get the original file path for a document (if it was opened from a .mcstructure file)
     */
    public getOriginalFilePath(document: vscode.TextDocument): string | undefined {
        return this.originalFileMapping.get(document.uri.toString());
    }

    /**
     * Convert Json data to a structure
     */
    public parseStructure(data: any) {
        return nbt.writeUncompressed(data, "little");
    }

    /**
     * Convert a structure to json
     */
    public async structureToJson(data: Buffer) {
        return (await nbt.parse(data)).parsed;
    }
}
