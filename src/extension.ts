import * as vscode from "vscode";
import path = require("path");
import { saveClipboardImageToFile } from "./saveClipboardImageToFile";
import { readFile, unlink } from "fs";
import LOGGER from "./logger";

export function activate(context: vscode.ExtensionContext) {
    console.log("Congratulations, your extension 'clipimage64' is now active!");

    let disposable = vscode.commands.registerCommand(
        "clipimage64.pasteImageInBase64",
        () => {
            const moment = Date.now();
            const saveInPath = path.join(__dirname, `${moment}.png`);

            const callback = (
                callbackError: Error,
                imagePathReturnByScript: string
            ) => {
                if (callbackError) {
                    LOGGER.error(callbackError.message);
                    return;
                }

                try {
                    readFile(imagePathReturnByScript, (err, data) => {
                        if (err) {
                            throw err;
                        }

                        const imageBase64 = data.toString("base64");
                        const pasteImageString = `![](data:image/png;base64,${imageBase64})`;
                        const editor = vscode.window.activeTextEditor;

                        if (!editor) {
                            LOGGER.error("Undefined active text editor");
                            return;
                        }

                        editor.edit((edit) => {
                            let current = editor.selection;
                            if (current.isEmpty) {
                                edit.insert(current.start, pasteImageString);
                            } else {
                                edit.replace(current, pasteImageString);
                            }
                        });

                        // Removing residual image
                        unlink(imagePathReturnByScript, (err) => {
                            if (err) {
                                LOGGER.error(
                                    `Error while deleting residual image: ${err.message}`
                                );
                                return;
                            }
                            LOGGER.log("Residual image removed successfully");
                        });
                    });
                } catch (err) {
                    LOGGER.error(`Error while reading image File: ${err}`);
                }
            };

            saveClipboardImageToFile(saveInPath, callback);
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}
