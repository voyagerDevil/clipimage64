import path = require("path");
import { spawn } from "child_process";
import LOGGER from "./logger";
import { FileSystemError, window } from "vscode";

export const saveClipboardImageToFile = (imagePath: string, cb: any) => {
    const platform = process.platform;

    if (platform === "win32") {
        const psScript = path.join(__dirname, "../assets/winpc.ps1");
        const command = "powershell";
        const powershell = spawn(command, [
            "-noprofile",
            "-noninteractive",
            "-nologo",
            "-sta",
            "-executionpolicy",
            "unrestricted",
            "-windowstyle",
            "hidden",
            "-file",
            psScript,
            imagePath,
        ]);

        powershell.on("error", function (e: FileSystemError) {
            if (e.code === "ENOENT") {
                window.showErrorMessage("No image found in clipboard :(");
                cb(e);
            } else {
                window.showErrorMessage("Error obtaining the image :(");
                cb(e);
            }
        });

        powershell.stdout.on("data", function (data: Buffer) {
            LOGGER.log("Image obtained successfully");
            cb(undefined, data.toString().trim());
        });
    } else if (platform === "darwin") {
        // Mac
        const scriptPath = path.join(__dirname, "../assets/mac.applescript");

        const appleScript = spawn("osascript", [scriptPath, imagePath]);

        appleScript.on("error", function (e) {
            window.showErrorMessage("Something went wrong :(");
            cb(e);
        });

        appleScript.on("exit", function (code, signal) {
            window.showErrorMessage("No image found in clipboard");
            LOGGER.log(`Code: ${code}`);
            LOGGER.log(`Signal: ${signal}`);
        });

        appleScript.stdout.on("data", function (data: Buffer) {
            cb(undefined, data.toString().trim());
        });
    } else {
        // Linux
        const scriptPath = path.join(__dirname, "../assets/linux.sh");

        const linuxScript = spawn("sh", [scriptPath, imagePath]);

        linuxScript.on("error", function (e) {
            window.showErrorMessage("Something went wrong :(");
            cb(e);
        });

        linuxScript.on("exit", function (code, signal) {
            window.showErrorMessage("No image found in clipboard");
            LOGGER.log(`Code: ${code}`);
            LOGGER.log(`Signal: ${signal}`);
        });

        linuxScript.stdout.on("data", function (data: Buffer) {
            let result = data.toString().trim();
            if (result === "no xclip") {
                LOGGER.warn("xclip not installed");
                window.showWarningMessage("xclip not installed");
                cb(new Error("xclip not installed"));
            }
            cb(undefined, result);
        });
    }
};
