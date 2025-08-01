import * as vscode from "vscode";
import { McStructureConverter } from "./mcStructureEditor";

export function activate(context: vscode.ExtensionContext) {
    const converter = new McStructureConverter();

    const customEditorProvider = vscode.window.registerCustomEditorProvider("mcstructure-editor.editor", {
        async openCustomDocument(uri: vscode.Uri, openContext: vscode.CustomDocumentOpenContext, token: vscode.CancellationToken) {
            return { uri, dispose: () => {} };
        },
        async resolveCustomEditor(document: vscode.CustomDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken) {
            webviewPanel.webview.html = `
                    <!DOCTYPE html>
                    <html>
                    <head><title>MCStructure Editor</title></head>
                    <body>
                        <div style="text-align: center; margin-top: 50px;">
                            <h2>Converting MCStructure to JSON...</h2>
                            <p>Please wait while we open your file in the JSON editor.</p>
                        </div>
                    </body>
                    </html>
                `;

            setTimeout(async () => {
                try {
                    await converter.openAsJson(document.uri);
                    webviewPanel.dispose();
                } catch (error) {
                    webviewPanel.webview.html = `
                            <!DOCTYPE html>
                            <html>
                            <body>
                                <div style="text-align: center; margin-top: 50px; color: red;">
                                    <h2>Error</h2>
                                    <p>Failed to convert MCStructure file: ${error}</p>
                                </div>
                            </body>
                            </html>
                        `;
                }
            }, 100);
        },
    });

    const openAsJsonCommand = vscode.commands.registerCommand("mcstructure-editor.openAsJson", async (uri?: vscode.Uri) => {
        try {
            if (!uri) {
                const fileUri = await vscode.window.showOpenDialog({
                    canSelectFiles: true,
                    canSelectMany: false,
                    filters: {
                        "MCStructure files": ["mcstructure"],
                    },
                });

                if (fileUri && fileUri[0]) {
                    uri = fileUri[0];
                } else {
                    vscode.window.showErrorMessage("No file selected");
                    return;
                }
            }

            if (!uri.fsPath.endsWith(".mcstructure")) {
                vscode.window.showErrorMessage("Please select a .mcstructure file");
                return;
            }

            await converter.openAsJson(uri);
        } catch (error) {
            vscode.window.showErrorMessage(`Error opening file: ${error}`);
        }
    });

    const saveAsStructureCommand = vscode.commands.registerCommand("mcstructure-editor.saveAsStructure", async () => {
        try {
            const activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor) {
                vscode.window.showErrorMessage("No active editor");
                return;
            }

            await converter.saveJsonAsStructure(activeEditor.document);
            vscode.window.showInformationMessage("MCStructure file saved successfully!");

            await vscode.commands.executeCommand("workbench.action.revertAndCloseActiveEditor");
        } catch (error) {
            vscode.window.showErrorMessage(`Error saving file: ${error}`);
        }
    });

    context.subscriptions.push(customEditorProvider, openAsJsonCommand, saveAsStructureCommand);
}

// export function deactivate() {}
