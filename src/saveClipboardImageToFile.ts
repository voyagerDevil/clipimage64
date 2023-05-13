import path = require("path");
import { spawn } from "child_process";

export const saveClipboardImageToFile = async (imagePath: string, cb: any) => {
    if (!imagePath) {
        return;
    }

    const platform = process.platform;

    if (platform === "win32") {
        const psScript = path.join(__dirname, "/assets/pc.ps1");
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

        powershell.on("error", function (e: any) {
            if (e.code === "ENOENT") {
                console.error(
                    "🚀 ~ file: saveClipboardImageToFile.ts:31 ~ e:",
                    e
                );
            } else {
                console.error(
                    "🚀 ~ file: saveClipboardImageToFile.ts:31 ~ e:",
                    e
                );
            }
        });

        powershell.stdout.on("data", function (data: Buffer) {
            cb(imagePath, data.toString().trim());
        });
    } else if (platform === "darwin") {
        // Mac
        const scriptPath = path.join(__dirname, "/assets/mac.applescript");

        const appleScript = spawn("osascript", [scriptPath, imagePath]);

        appleScript.on("error", function (e) {
            console.error("🚀 ~ file: saveClipboardImageToFile.ts:54 ~ e:", e);
        });

        appleScript.on("exit", function (code, signal) {
            console.log(
                "🚀 ~ file: saveClipboardImageToFile.ts:57 ~ code, signal:",
                code,
                signal
            );
        });

        appleScript.stdout.on("data", function (data: Buffer) {
            cb(imagePath, data.toString().trim());
        });
    } else {
        // Linux
        const scriptPath = path.join(__dirname, "../../res/linux.sh");

        const ascript = spawn("sh", [scriptPath, imagePath]);

        ascript.on("error", function (e) {
            console.error("🚀 ~ file: saveClipboardImageToFile.ts:76 ~ e:", e);
        });

        ascript.on("exit", function (code, signal) {
            // console.log('exit',code,signal);
        });

        ascript.stdout.on("data", function (data: Buffer) {
            let result = data.toString().trim();
            if (result === "no xclip") {
                console.warn(
                    "🚀 ~ file: saveClipboardImageToFile.ts:84 ~ result:",
                    result
                );
                return;
            }
            cb(imagePath, result);
        });
    }
};
