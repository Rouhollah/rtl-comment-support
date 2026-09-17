import * as vscode from 'vscode';
import { window } from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('rtl-comment-support', async () => {
		const result = await window.showInputBox({
			value: '',
			placeHolder: 'paste here or write your text, enjoy',
			ignoreFocusOut: true,
		});
		if (result?.trim()) {
			await vscode.env.clipboard.writeText(toClipboardComment(result));
			window.showInformationMessage('The text is converted and copied to the clipboard.');
		}
	});

	context.subscriptions.push(disposable);
}

const RTL_REGEX = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;

type CharClass = 'rtl' | 'ltr' | 'number' | 'neutral' | 'space';
type TextDir = 'rtl' | 'ltr';

interface Token {
	type: CharClass;
	value: string;
	dir?: TextDir;
}

function classifyChar(ch: string): CharClass {
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

function tokenize(text: string): Token[] {
	const tokens: Token[] = [];
	for (const ch of text) {
		const type = classifyChar(ch);
		const last = tokens[tokens.length - 1];
		if (last && last.type === type) {
			last.value += ch;
		} else {
			tokens.push({ type, value: ch });
		}
	}
	return tokens;
}

function nearestLetterDir(tokens: Token[], start: number, step: number): TextDir | undefined {
	for (let i = start; i >= 0 && i < tokens.length; i += step) {
		const type = tokens[i].type;
		if (type === 'rtl' || type === 'ltr') {
			return type;
		}
	}
	return undefined;
}

function nearestResolvedDir(tokens: Token[], start: number, step: number): TextDir | undefined {
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
function resolveNumberDir(tokens: Token[], index: number): TextDir {
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

function resolveDirections(tokens: Token[]): void {
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

function groupRuns(tokens: Token[]): Token[][] {
	const runs: Token[][] = [];
	let current: Token[] = [];
	let currentDir: TextDir | undefined;

	const flush = (): void => {
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
		} else {
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
export function formatText(text: string): string {
	const tokens = tokenize(text.trim());
	resolveDirections(tokens);
	return groupRuns(tokens)
		.reverse()
		.map(run => run.map(token => token.value).join(''))
		.join(' ');
}

export function toClipboardComment(text: string): string {
	return `// ${formatText(text)}`;
}

export function deactivate() { }
