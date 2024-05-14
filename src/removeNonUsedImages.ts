import { window, Range } from "vscode";

const removeNonUsedImages = () => {
    const editor = window.activeTextEditor;

    if (editor) {
        const textDocument = editor.document;
        const markdownContent = textDocument.getText();
        const imgeRefRegex: RegExp = /!\[[^\]]*\]\[(.*?)\]/g;
        const inUseImagesUrl: string[] = [];
        let match;

        while ((match = imgeRefRegex.exec(markdownContent)) !== null) {
            const imageUrl: string = match[1];
            inUseImagesUrl.push(imageUrl);
        }

        const base64Regex = /\[(.*?)\]:\s*data:image\/png;base64,[a-zA-Z0-9+/=]+/g;

        let newMarkdownContent = markdownContent.replace(base64Regex, (match, base64) => {
            if (inUseImagesUrl.includes(base64)) {
                return match;
            }

            return "";
        });

        editor
            .edit((editBuilder) => {
                const fullRange = new Range(0, 0, textDocument.lineCount, 0);
                editBuilder.replace(fullRange, newMarkdownContent);
            })
            .then((success) => {
                if (success) {
                    textDocument.save();
                }
            });
    } else {
        window.showErrorMessage("No active text editor found.");
    }
};

export default removeNonUsedImages;
