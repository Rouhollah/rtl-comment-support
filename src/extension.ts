import { OutgoingMessage } from 'http';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { window } from 'vscode';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('rtl-comment-support', async () => {
		// The code you place here will be executed every time your command is executed
		const result = await window.showInputBox({
			value: '',
			placeHolder: 'paste here or write your text, enjoy',
		});
		let isRTLFormat = false;
		let virtulArray = [];
		let virtualString = "";
		let originalTextArray = result?.split(' ');
		originalTextArray = originalTextArray?.filter(f => f.trim() != " " && f != '');
		if (originalTextArray?.length) {
			let temp: any[] = [];
			let englishWords: any[] = [];
			let numbers: any[] = [];
			let numberExist: boolean = false;
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
			let concatedArray: any[] = [];
			concatedArray = concatItems(virtulArray);
			virtualString = "// " + concatedArray.join(' ');
			console.log(virtualString);
			vscode.env.clipboard.writeText(virtualString);
			window.showInformationMessage("The text is converted and copied to the clipboard.").then((dismis)=>dismis);
			
		}
	});
	
	// concat the engilish array to one
	function concatItems(array: Array<any>) {
		let concatedArray: any[] = [];
		for (let z = 0; z < array.length; z++) {
			concatedArray = concatedArray.concat(array[z]);
		}
		return concatedArray;
	}

	// explore format  
	function isRightToLeft(text: string): boolean {
		let isRTL = false;
		const RTL_Regex = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
		for (let i = 0; i < text.length; i++) {
			const element = text.charCodeAt(i);
			if (RTL_Regex.test(String.fromCharCode(element))) {
				isRTL = true;
				break
			}
		}
		return isRTL;
	}
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
