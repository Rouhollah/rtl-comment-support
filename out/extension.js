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
exports.deactivate = exports.toClipboardComment = exports.formatText = exports.activate = void 0;
const vscode = require("vscode");
const vscode_1 = require("vscode");
function activate(context) {
    const disposable = vscode.commands.registerCommand('rtl-comment-support', () => __awaiter(this, void 0, void 0, function* () {
        const result = yield vscode_1.window.showInputBox({
            value: '',
            placeHolder: 'paste here or write your text, enjoy',
            ignoreFocusOut: true,
        });
        if (result === null || result === void 0 ? void 0 : result.trim()) {
            yield vscode.env.clipboard.writeText(toClipboardComment(result));
            vscode_1.window.showInformationMessage('The text is converted and copied to the clipboard.');
        }
    }));
    context.subscriptions.push(disposable);
}
exports.activate = activate;
const RTL_REGEX = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
function classifyChar(ch) {
    if (/\s/.test(ch)) {
        return 'space';
    }
    if (/[0-9]/.test(ch)) {
        return 'number';
    }
    if (RTL_REGEX.test(ch)) {
        return 'rtl';
    }
    if (/[A-Za-z]/.test(ch) || ch.toLowerCase() !== ch.toUpperCase()) {
        return 'ltr';
    }
    return 'neutral';
}
function tokenize(text) {
    const tokens = [];
    for (const ch of text) {
        const type = classifyChar(ch);
        const last = tokens[tokens.length - 1];
        if (last && last.type === type) {
            last.value += ch;
        }
        else {
            tokens.push({ type, value: ch });
        }
    }
    return tokens;
}
function nearestLetterDir(tokens, start, step) {
    for (let i = start; i >= 0 && i < tokens.length; i += step) {
        const type = tokens[i].type;
        if (type === 'rtl' || type === 'ltr') {
            return type;
        }
    }
    return undefined;
}
function nearestResolvedDir(tokens, start, step) {
    for (let i = start; i >= 0 && i < tokens.length; i += step) {
        if (tokens[i].dir) {
            return tokens[i].dir;
        }
    }
    return undefined;
}
// Numbers next to English stay LTR. Numbers after/between Persian stay
// with the RTL run. A number at the start of the sentence stays LTR so
// the whole expression can move to the visual right.
function resolveNumberDir(tokens, index) {
    const left = nearestLetterDir(tokens, index - 1, -1);
    const right = nearestLetterDir(tokens, index + 1, 1);
    if (left === 'ltr' || right === 'ltr') {
        return 'ltr';
    }
    if (left === 'rtl') {
        return 'rtl';
    }
    return 'ltr';
}
function resolveDirections(tokens) {
    for (const token of tokens) {
        if (token.type === 'rtl' || token.type === 'ltr') {
            token.dir = token.type;
        }
    }
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].type === 'number') {
            tokens[i].dir = resolveNumberDir(tokens, i);
        }
    }
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].type === 'neutral') {
            tokens[i].dir =
                nearestResolvedDir(tokens, i - 1, -1) ||
                    nearestResolvedDir(tokens, i + 1, 1) ||
                    'ltr';
        }
    }
}
function groupRuns(tokens) {
    const runs = [];
    let current = [];
    let currentDir;
    const flush = () => {
        if (!current.length) {
            return;
        }
        while (current.length && current[current.length - 1].type === 'space') {
            current.pop();
        }
        if (current.length) {
            runs.push(current);
        }
        current = [];
        currentDir = undefined;
    };
    for (const token of tokens) {
        if (token.type === 'space') {
            if (current.length) {
                current.push(token);
            }
            continue;
        }
        if (currentDir === undefined || token.dir === currentDir) {
            current.push(token);
            currentDir = token.dir;
        }
        else {
            flush();
            current = [token];
            currentDir = token.dir;
        }
    }
    flush();
    return runs;
}
// Reverse mixed RTL/LTR runs only. Keep logical order inside each run so
// Cursor/VS Code bidi can still render Persian correctly. No bidi marks.
function formatText(text) {
    const tokens = tokenize(text.trim());
    resolveDirections(tokens);
    return groupRuns(tokens)
        .reverse()
        .map(run => run.map(token => token.value).join(''))
        .join(' ');
}
exports.formatText = formatText;
function toClipboardComment(text) {
    return `// ${formatText(text)}`;
}
exports.toClipboardComment = toClipboardComment;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map