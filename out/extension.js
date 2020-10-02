"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const vscode_1 = require("vscode");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    let disposable = vscode.commands.registerCommand('rtl-comment-support', () => __awaiter(this, void 0, void 0, function* () {
        // The code you place here will be executed every time your command is executed
        const result = yield vscode_1.window.showInputBox({
            value: '',
            placeHolder: 'paste here or write your text, enjoy',
        });
        let isRTLFormat = false;
        let virtulArray = [];
        let virtualString = "";
        let originalTextArray = result === null || result === void 0 ? void 0 : result.split(' ');
        originalTextArray = originalTextArray === null || originalTextArray === void 0 ? void 0 : originalTextArray.filter(f => f.trim() != " " && f != '');
        if (originalTextArray === null || originalTextArray === void 0 ? void 0 : originalTextArray.length) {
            let temp = [];
            let englishWords = [];
            let numbers = [];
            let numberExist = false;
            for (let i = 0; i < originalTextArray.length; i++) {
                isRTLFormat = isRightToLeft(originalTextArray[i]);
                // If in right to left format
                if (isRTLFormat) {
                    // If a few English words had already been found
                    if (englishWords.length > 1) {
                        temp.unshift(concatItems(englishWords));
                        virtulArray.unshift(...temp);
                        temp = [];
                        englishWords = [];
                    }
                    // If only one English word was found
                    else if (englishWords.length > 0) {
                        temp.unshift(englishWords[0]);
                        virtulArray.unshift(...temp);
                        temp = [];
                        englishWords = [];
                    }
                    // Add right to left word to end of array
                    temp.push(originalTextArray[i]);
                }
                else {
                    // If the word is not number
                    if (!parseInt(originalTextArray[i])) {
                        englishWords.push(originalTextArray[i]);
                        if (numberExist) {
                            temp.unshift(englishWords[0]);
                            virtulArray.unshift(...temp);
                            temp = [];
                            englishWords = [];
                            numberExist = false;
                        }
                    }
                    // If the word is number
                    else {
                        temp.push(originalTextArray[i]);
                        numberExist = true;
                    }
                }
            }
            // Add the last word or words to the array
            if (temp.length > 0) {
                virtulArray.unshift(...temp);
                temp = [];
            }
            if (englishWords.length > 0) {
                temp.unshift(concatItems(englishWords));
                virtulArray.unshift(...temp);
            }
            let concatedArray = [];
            concatedArray = concatItems(virtulArray);
            virtualString = "// " + concatedArray.join(' ');
            console.log(virtualString);
            vscode.env.clipboard.writeText(virtualString);
            vscode_1.window.showInformationMessage("The text is converted and copied to the clipboard.").then((dismis) => dismis);
        }
    }));
    // concat the engilish array to one
    function concatItems(array) {
        let concatedArray = [];
        for (let z = 0; z < array.length; z++) {
            concatedArray = concatedArray.concat(array[z]);
        }
        return concatedArray;
    }
    // explore format  
    function isRightToLeft(text) {
        let isRTL = false;
        const RTL_Regex = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
        for (let i = 0; i < text.length; i++) {
            const element = text.charCodeAt(i);
            if (RTL_Regex.test(String.fromCharCode(element))) {
                isRTL = true;
                break;
            }
        }
        return isRTL;
    }
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map