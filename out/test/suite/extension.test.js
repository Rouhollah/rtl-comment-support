"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const vscode = require("vscode");
const extension_1 = require("../../extension");
suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');
    test('Sample test', () => {
        assert.equal(-1, [1, 2, 3].indexOf(5));
        assert.equal(-1, [1, 2, 3].indexOf(0));
    });
    test('keeps zero and multi-digit numbers in the LTR run', () => {
        assert.strictEqual(extension_1.formatText('سلام item 0 123'), 'item 0 123 سلام');
    });
    test('keeps numbers in their original order beside English words', () => {
        assert.strictEqual(extension_1.formatText('version 2 سلام 2026 دنیا'), 'سلام 2026 دنیا version 2');
    });
    test('keeps a dotted version number with the surrounding Persian words', () => {
        assert.strictEqual(extension_1.formatText('این یک تست با vscode نسخه 1.100 است'), 'نسخه 1.100 است vscode این یک تست با');
    });
    test('moves a leading number expression to the visual right', () => {
        assert.strictEqual(extension_1.formatText('20 + 10 مساوری 30 است'), 'مساوری 30 است 20 + 10');
        assert.strictEqual(extension_1.formatText('20 سلام'), 'سلام 20');
        assert.strictEqual(extension_1.toClipboardComment('20 + 10 مساوری 30 است'), '// مساوری 30 است 20 + 10');
        assert.ok(!/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/.test(extension_1.toClipboardComment('20 + 10 مساوری 30 است')));
    });
    test('splits mixed-script words so English stays LTR', () => {
        assert.strictEqual(extension_1.formatText('بگوhello'), 'hello بگو');
    });
    test('keeps a number stuck to an RTL word', () => {
        assert.strictEqual(extension_1.formatText('نسخه2'), 'نسخه2');
    });
    test('keeps digits attached to English identifiers', () => {
        assert.strictEqual(extension_1.formatText('item0'), 'item0');
    });
    test('keeps a number between Persian words in place', () => {
        assert.strictEqual(extension_1.formatText('قیمت 100 تومان'), 'قیمت 100 تومان');
    });
    test('reorders mixed sentence around an English word', () => {
        assert.strictEqual(extension_1.formatText('این یک test است'), 'است test این یک');
    });
    test('keeps URLs in one LTR run', () => {
        assert.strictEqual(extension_1.formatText('See https://example.com برای جزئیات'), 'برای جزئیات See https://example.com');
    });
    test('keeps dotted identifiers in one LTR run', () => {
        assert.strictEqual(extension_1.formatText('user.name را بخوان'), 'را بخوان user.name');
    });
    test('keeps a decimal between Persian words in place', () => {
        assert.strictEqual(extension_1.formatText('مقدار 3.14 را برگردان'), 'مقدار 3.14 را برگردان');
    });
    test('leaves pure Persian unchanged', () => {
        assert.strictEqual(extension_1.formatText('سلام دنیا'), 'سلام دنیا');
    });
});
//# sourceMappingURL=extension.test.js.map