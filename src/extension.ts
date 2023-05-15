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
                    if (imagePathReturnByScript === "no image") {
                        vscode.window.showErrorMessage(
                            "No image found in the clipboard."
                        );
                        throw new Error("No image found in the clipboard.");
                    }
                    readFile(imagePathReturnByScript, (err, data) => {
                        if (err) {
                            throw err;
                        }

                        const imageBase64 = data.toString("base64");
                        const referenceImage = `![Alternative Text][${moment}]`;
                        const pasteImageString = `[${moment}]:data:image/png;base64,${imageBase64}`;
                        const editor = vscode.window.activeTextEditor;

                        if (!editor) {
                            LOGGER.error("Undefined active text editor");
                            return;
                        }

                        const document = editor.document;
                        const lastLine = document.lineAt(
                            document.lineCount - 1
                        );

                        let currentPosition = editor.selection;
                        const endPosition = lastLine.range.end;

                        editor
                            .edit((edit) => {
                                // Paste reference image in the current line
                                if (currentPosition.isEmpty) {
                                    edit.insert(
                                        currentPosition.start,
                                        referenceImage
                                    );
                                } else {
                                    edit.replace(
                                        currentPosition,
                                        referenceImage
                                    );
                                }

                                // The Image text will be paste at the end of the file
                                edit.insert(
                                    endPosition,
                                    "\n" + "\n" + pasteImageString
                                );
                            })
                            .then((success) => {
                                if (success) {
                                    const insertedRange = new vscode.Range(
                                        currentPosition.start.translate({
                                            characterDelta: 2,
                                        }),
                                        currentPosition.start.translate({
                                            characterDelta: 18,
                                        })
                                    );
                                    editor.selection = new vscode.Selection(
                                        insertedRange.start,
                                        insertedRange.end
                                    );
                                } else {
                                    vscode.window.showErrorMessage(
                                        "Failed to insert text at the end of the file."
                                    );
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
