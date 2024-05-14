import { commands, ExtensionContext } from "vscode";
import pasteImageInBase64 from "./pasteImageInBase64";
import removeNonUsedImages from "./removeNonUsedImages";

export function activate(context: ExtensionContext) {
    console.log("Congratulations, your extension 'clipimage64' is now active!");

    context.subscriptions.push(
        commands.registerCommand("clipimage64.pasteImageInBase64", pasteImageInBase64)
    );

    context.subscriptions.push(
        commands.registerCommand("clipimage64.removeNonUsedImages", removeNonUsedImages)
    );
}

export function deactivate() {}
