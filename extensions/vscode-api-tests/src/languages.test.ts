/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as assert from 'assert';
import {languages, workspace, commands, Uri, Diagnostic, Range, Command, Disposable} from 'vscode';

suite('languages namespace tests', () => {

	test('diagnostic collection, forEach, clear, has', function () {
		let collection = languages.createDiagnosticCollection('test');
		assert.equal(collection.name, 'test');
		collection.dispose();
		assert.throws(() => collection.name);

		let c = 0;
		collection = languages.createDiagnosticCollection('test2');
		collection.forEach(() => c++);
		assert.equal(c, 0);

		collection.set(Uri.parse('foo:bar'), [
			new Diagnostic(new Range(0, 0, 1, 1), 'message-1'),
			new Diagnostic(new Range(0, 0, 1, 1), 'message-2')
		]);
		collection.forEach(() => c++);
		assert.equal(c, 1);

		c = 0;
		collection.clear();
		collection.forEach(() => c++);
		assert.equal(c, 0);

		collection.set(Uri.parse('foo:bar1'), [
			new Diagnostic(new Range(0, 0, 1, 1), 'message-1'),
			new Diagnostic(new Range(0, 0, 1, 1), 'message-2')
		]);
		collection.set(Uri.parse('foo:bar2'), [
			new Diagnostic(new Range(0, 0, 1, 1), 'message-1'),
			new Diagnostic(new Range(0, 0, 1, 1), 'message-2')
		]);
		collection.forEach(() => c++);
		assert.equal(c, 2);

		assert.ok(collection.has(Uri.parse('foo:bar1')));
		assert.ok(collection.has(Uri.parse('foo:bar2')));
		assert.ok(!collection.has(Uri.parse('foo:bar3')));
		collection.delete(Uri.parse('foo:bar1'));
		assert.ok(!collection.has(Uri.parse('foo:bar1')));

		collection.dispose();
	});

	test('diagnostic collection, immutable read', function () {
		let collection = languages.createDiagnosticCollection('test');
		collection.set(Uri.parse('foo:bar'), [
			new Diagnostic(new Range(0, 0, 1, 1), 'message-1'),
			new Diagnostic(new Range(0, 0, 1, 1), 'message-2')
		]);

		let array = collection.get(Uri.parse('foo:bar'));
		assert.throws(() => array.length = 0);
		assert.throws(() => array.pop());
		assert.throws(() => array[0] = new Diagnostic(new Range(0, 0, 0, 0), 'evil'));

		collection.forEach((uri, array) => {
			assert.throws(() => array.length = 0);
			assert.throws(() => array.pop());
			assert.throws(() => array[0] = new Diagnostic(new Range(0, 0, 0, 0), 'evil'));
		});

		array = collection.get(Uri.parse('foo:bar'));
		assert.equal(array.length, 2);

		collection.dispose();
	});

	test('diagnostics & CodeActionProvider', function () {

		class D2 extends Diagnostic {
			customProp = { complex() { } };
			constructor() {
				super(new Range(0, 2, 0, 7), 'sonntag');
			}
		};

		let diag1 = new Diagnostic(new Range(0, 0, 0, 5), 'montag');
		let diag2 = new D2();

		let ran = false;
		let uri = Uri.parse('ttt:path.far');

		let r1 = languages.registerCodeActionsProvider({ pattern: '*.far' }, {
			provideCodeActions(document, range, ctx): Command[] {

				assert.equal(ctx.diagnostics.length, 2);
				let [first, second] = ctx.diagnostics;
				assert.ok(first === diag1);
				assert.ok(second === diag2);
				assert.ok(diag2 instanceof D2);
				ran = true;
				return [];
			}
		});

		let r2 = workspace.registerTextDocumentContentProvider('ttt', {
			provideTextDocumentContent() {
				return 'this is some text';
			}
		});

		let r3 = languages.createDiagnosticCollection();
		r3.set(uri, [diag1]);

		let r4 = languages.createDiagnosticCollection();
		r4.set(uri, [diag2]);

		workspace.openTextDocument(uri).then(doc => {
			return commands.executeCommand('vscode.executeCodeActionProvider', uri, new Range(0, 0, 0, 10));
		}).then(commands => {
			assert.ok(ran);
			Disposable.from(r1, r2, r3, r4).dispose();
		});
	});
});