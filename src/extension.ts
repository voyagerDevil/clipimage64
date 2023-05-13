import * as vscode from "vscode";
import path = require("path");
import { saveClipboardImageToFile } from "./saveClipboardImageToFile";
import { readFile, unlink } from "fs";

export function activate(context: vscode.ExtensionContext) {
    console.log("Congratulations, your extension 'clipimage64' is now active!");

    let disposable = vscode.commands.registerCommand(
        "clipimage64.pasteImageInBase64",
        () => {
            // vscode.env.clipboard.readText().then((curr: any) => {
            //     console.log(`curr: ${curr}`);
            //     // vscode.window.showInformationMessage(curr);
            // });
            const moment = Date.now();
            const saveInPath = path.join(__dirname, `${moment}.png`);
            saveClipboardImageToFile(
                saveInPath,
                async (imagePathReturnByScript: string) => {
                    
                    try {
                        readFile(imagePathReturnByScript, (err, data) => {
                            if (err) { throw err; }
                            const imageBase64 = data.toString("base64");
                            const pasteImageString = `![](data:image/png;base64,${imageBase64})`;
                            const editor = vscode.window.activeTextEditor;

                            if (!editor) { return; }

                            editor.edit(edit => {
                                let current = editor.selection;
                                if (current.isEmpty) {
                                    edit.insert(current.start, pasteImageString);
                                } else {
                                    edit.replace(current, pasteImageString);
                                }
                            });

                            // Removing residual image
                            unlink(imagePathReturnByScript, (err)=>{
                                if (err) {
                                    console.error("Error removing file:", err);
                                    return;
                                }
                                console.log("Residual image removed successfully");
                            });
                        });
                    } catch (error) {
                        console.error("🚀 ~ file: extension.ts:29 ~ error:", error);
                    }
                }
            );
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}
