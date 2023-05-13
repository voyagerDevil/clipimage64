import * as vscode from "vscode";
import { saveClipboardImageToFile } from "./saveClipboardImageToFile";
import path = require("path");

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "clipimage64" is now active!');

    let disposable = vscode.commands.registerCommand(
        "clipimage64.pasteImageInBase64",
        () => {
            // vscode.env.clipboard.readText().then((curr: any) => {
            //     console.log(`curr: ${curr}`);
            //     // vscode.window.showInformationMessage(curr);
            // });
            const saveInPath = path.resolve(__dirname, "/temp");
            saveClipboardImageToFile(
                saveInPath,
                (imagePath: string, imagePathReturnByScript: string) => {
                    console.log(
                        "🚀 ~ file: extension.ts:19 ~ activate ~ imagePath, imagePathReturnByScript:",
                        imagePath,
                        imagePathReturnByScript
                    );
                }
            );
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}
