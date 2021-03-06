/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as assert from 'assert';
import { KeyMod, KeyCode, createKeybinding, SimpleKeybinding, KeyChord } from 'vs/base/common/keyCodes';
import { MacLinuxKeyboardMapper, IKeyboardMapping } from 'vs/workbench/services/keybinding/common/macLinuxKeyboardMapper';
import { OperatingSystem } from 'vs/base/common/platform';
import { UserSettingsLabelProvider } from 'vs/platform/keybinding/common/keybindingLabels';
import { USLayoutResolvedKeybinding } from 'vs/platform/keybinding/common/usLayoutResolvedKeybinding';
import { KeyboardEventCodeUtils } from 'vs/workbench/services/keybinding/common/keyboardEventCode';
import { IHTMLContentElement } from 'vs/base/common/htmlContent';
import { TPromise } from 'vs/base/common/winjs.base';
import { readRawMapping, assertMapping, IResolvedKeybinding, assertResolveKeybinding, simpleHTMLLabel, chordHTMLLabel, assertResolveKeyboardEvent } from 'vs/workbench/services/keybinding/test/keyboardMapperTestUtils';

function createKeyboardMapper(file: string, OS: OperatingSystem): TPromise<MacLinuxKeyboardMapper> {
	return readRawMapping<IKeyboardMapping>(file).then((rawMappings) => {
		return new MacLinuxKeyboardMapper(rawMappings, OS);
	});
}

suite('keyboardMapper - MAC de_ch', () => {

	let mapper: MacLinuxKeyboardMapper;

	suiteSetup((done) => {
		createKeyboardMapper('mac_de_ch', OperatingSystem.Macintosh).then((_mapper) => {
			mapper = _mapper;
			done();
		}, done);
	});

	test('mapping', (done) => {
		assertMapping(mapper, 'mac_de_ch.txt', done);
	});

	function assertKeybindingTranslation(kb: number, expected: string | string[]): void {
		_assertKeybindingTranslation(mapper, OperatingSystem.Macintosh, kb, expected);
	}

	function _assertResolveKeybinding(k: number, expected: IResolvedKeybinding[]): void {
		assertResolveKeybinding(mapper, createKeybinding(k, OperatingSystem.Macintosh), expected);
	}

	function _simpleHTMLLabel(pieces: string[]): IHTMLContentElement {
		return simpleHTMLLabel(pieces, OperatingSystem.Macintosh);
	}

	function _chordHTMLLabel(firstPart: string[], chordPart: string[]): IHTMLContentElement {
		return chordHTMLLabel(firstPart, chordPart, OperatingSystem.Macintosh);
	}

	test('kb => hw', () => {
		// unchanged
		assertKeybindingTranslation(KeyMod.CtrlCmd | KeyCode.KEY_1, 'cmd+Digit1');
		assertKeybindingTranslation(KeyMod.CtrlCmd | KeyCode.KEY_B, 'cmd+KeyB');
		assertKeybindingTranslation(KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KEY_B, 'shift+cmd+KeyB');
		assertKeybindingTranslation(KeyMod.CtrlCmd | KeyMod.Shift | KeyMod.Alt | KeyMod.WinCtrl | KeyCode.KEY_B, 'ctrl+shift+alt+cmd+KeyB');

		// flips Y and Z
		assertKeybindingTranslation(KeyMod.CtrlCmd | KeyCode.KEY_Z, 'cmd+KeyY');
		assertKeybindingTranslation(KeyMod.CtrlCmd | KeyCode.KEY_Y, 'cmd+KeyZ');

		// Ctrl+/
		assertKeybindingTranslation(KeyMod.CtrlCmd | KeyCode.US_SLASH, 'shift+cmd+Digit7');
	});

	// TODO: missing
	test('resolveKeybinding Cmd+A', () => {
		_assertResolveKeybinding(
			KeyMod.CtrlCmd | KeyCode.KEY_A,
			[]
		);
	});

	test('resolveKeybinding Cmd+B', () => {
		_assertResolveKeybinding(
			KeyMod.CtrlCmd | KeyCode.KEY_B,
			[{
				label: '⌘B',
				ariaLabel: 'Command+B',
				HTMLLabel: [_simpleHTMLLabel(['⌘', 'B'])],
				electronAccelerator: 'Cmd+B',
				userSettingsLabel: 'cmd+b',
				isChord: false,
				hasCtrlModifier: false,
				hasShiftModifier: false,
				hasAltModifier: false,
				hasMetaModifier: true,
				dispatchParts: ['meta+[KeyB]', null],
			}]
		);
	});

	test('resolveKeybinding Cmd+Z', () => {
		_assertResolveKeybinding(
			KeyMod.CtrlCmd | KeyCode.KEY_Z,
			[{
				label: '⌘Z',
				ariaLabel: 'Command+Z',
				HTMLLabel: [_simpleHTMLLabel(['⌘', 'Z'])],
				electronAccelerator: 'Cmd+Z',
				userSettingsLabel: 'cmd+z',
				isChord: false,
				hasCtrlModifier: false,
				hasShiftModifier: false,
				hasAltModifier: false,
				hasMetaModifier: true,
				dispatchParts: ['meta+[KeyY]', null],
			}]
		);
	});

	test('resolveKeyboardEvent Cmd+[KeyY]', () => {
		assertResolveKeyboardEvent(
			mapper,
			{
				ctrlKey: false,
				shiftKey: false,
				altKey: false,
				metaKey: true,
				keyCode: -1,
				code: 'KeyY'
			},
			{
				label: '⌘Z',
				ariaLabel: 'Command+Z',
				HTMLLabel: [_simpleHTMLLabel(['⌘', 'Z'])],
				electronAccelerator: 'Cmd+Z',
				userSettingsLabel: 'cmd+z',
				isChord: false,
				hasCtrlModifier: false,
				hasShiftModifier: false,
				hasAltModifier: false,
				hasMetaModifier: true,
				dispatchParts: ['meta+[KeyY]', null],
			}
		);
	});

	test('resolveKeybinding Cmd+]', () => {
		_assertResolveKeybinding(
			KeyMod.CtrlCmd | KeyCode.US_CLOSE_SQUARE_BRACKET,
			[{
				label: '⌃⌥⌘6',
				ariaLabel: 'Control+Alt+Command+6',
				HTMLLabel: [_simpleHTMLLabel(['⌃', '⌥', '⌘', '6'])],
				electronAccelerator: 'Ctrl+Alt+Cmd+6',
				userSettingsLabel: 'ctrl+alt+cmd+6',
				isChord: false,
				hasCtrlModifier: true,
				hasShiftModifier: false,
				hasAltModifier: true,
				hasMetaModifier: true,
				dispatchParts: ['ctrl+alt+meta+[Digit6]', null],
			}]
		);
	});

	test('resolveKeyboardEvent Cmd+[BracketRight]', () => {
		assertResolveKeyboardEvent(
			mapper,
			{
				ctrlKey: false,
				shiftKey: false,
				altKey: false,
				metaKey: true,
				keyCode: -1,
				code: 'BracketRight'
			},
			{
				label: '⌘¨',
				ariaLabel: 'Command+¨',
				HTMLLabel: [_simpleHTMLLabel(['⌘', '¨'])],
				electronAccelerator: null,
				userSettingsLabel: 'cmd+[BracketRight]',
				isChord: false,
				hasCtrlModifier: false,
				hasShiftModifier: false,
				hasAltModifier: false,
				hasMetaModifier: true,
				dispatchParts: ['meta+[BracketRight]', null],
			}
		);
	});

	test('resolveKeybinding Shift+]', () => {
		_assertResolveKeybinding(
			KeyMod.Shift | KeyCode.US_CLOSE_SQUARE_BRACKET,
			[{
				label: '⌃⌥9',
				ariaLabel: 'Control+Alt+9',
				HTMLLabel: [_simpleHTMLLabel(['⌃', '⌥', '9'])],
				electronAccelerator: 'Ctrl+Alt+9',
				userSettingsLabel: 'ctrl+alt+9',
				isChord: false,
				hasCtrlModifier: true,
				hasShiftModifier: false,
				hasAltModifier: true,
				hasMetaModifier: false,
				dispatchParts: ['ctrl+alt+[Digit9]', null],
			}]
		);
	});

	test('resolveKeybinding Cmd+/', () => {
		_assertResolveKeybinding(
			KeyMod.CtrlCmd | KeyCode.US_SLASH,
			[{
				label: '⇧⌘7',
				ariaLabel: 'Shift+Command+7',
				HTMLLabel: [_simpleHTMLLabel(['⇧', '⌘', '7'])],
				electronAccelerator: 'Shift+Cmd+7',
				userSettingsLabel: 'shift+cmd+7',
				isChord: false,
				hasCtrlModifier: false,
				hasShiftModifier: true,
				hasAltModifier: false,
				hasMetaModifier: true,
				dispatchParts: ['shift+meta+[Digit7]', null],
			}]
		);
	});

	test('resolveKeybinding Cmd+Shift+/', () => {
		_assertResolveKeybinding(
			KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.US_SLASH,
			[{
				label: '⇧⌘\'',
				ariaLabel: 'Shift+Command+\'',
				HTMLLabel: [_simpleHTMLLabel(['⇧', '⌘', '\''])],
				electronAccelerator: null,
				userSettingsLabel: 'shift+cmd+[Minus]',
				isChord: false,
				hasCtrlModifier: false,
				hasShiftModifier: true,
				hasAltModifier: false,
				hasMetaModifier: true,
				dispatchParts: ['shift+meta+[Minus]', null],
			}]
		);
	});

	test('resolveKeybinding Cmd+K Cmd+\\', () => {
		_assertResolveKeybinding(
			KeyChord(KeyMod.CtrlCmd | KeyCode.KEY_K, KeyMod.CtrlCmd | KeyCode.US_BACKSLASH),
			[{
				label: '⌘K ⌃⇧⌥⌘7',
				ariaLabel: 'Command+K Control+Shift+Alt+Command+7',
				HTMLLabel: [_chordHTMLLabel(['⌘', 'K'], ['⌃', '⇧', '⌥', '⌘', '7'])],
				electronAccelerator: null,
				userSettingsLabel: 'cmd+k ctrl+shift+alt+cmd+7',
				isChord: true,
				hasCtrlModifier: false,
				hasShiftModifier: false,
				hasAltModifier: false,
				hasMetaModifier: false,
				dispatchParts: ['meta+[KeyK]', 'ctrl+shift+alt+meta+[Digit7]'],
			}]
		);
	});

	test('resolveKeybinding Cmd+K Cmd+=', () => {
		_assertResolveKeybinding(
			KeyChord(KeyMod.CtrlCmd | KeyCode.KEY_K, KeyMod.CtrlCmd | KeyCode.US_EQUAL),
			[{
				label: '⌘K ⇧⌘0',
				ariaLabel: 'Command+K Shift+Command+0',
				HTMLLabel: [_chordHTMLLabel(['⌘', 'K'], ['⇧', '⌘', '0'])],
				electronAccelerator: null,
				userSettingsLabel: 'cmd+k shift+cmd+0',
				isChord: true,
				hasCtrlModifier: false,
				hasShiftModifier: false,
				hasAltModifier: false,
				hasMetaModifier: false,
				dispatchParts: ['meta+[KeyK]', 'shift+meta+[Digit0]'],
			}]
		);
	});

	test('resolveKeybinding Cmd+DownArrow', () => {
		_assertResolveKeybinding(
			KeyMod.CtrlCmd | KeyCode.DownArrow,
			[{
				label: '⌘↓',
				ariaLabel: 'Command+DownArrow',
				HTMLLabel: [_simpleHTMLLabel(['⌘', '↓'])],
				electronAccelerator: 'Cmd+Down',
				userSettingsLabel: 'cmd+down',
				isChord: false,
				hasCtrlModifier: false,
				hasShiftModifier: false,
				hasAltModifier: false,
				hasMetaModifier: true,
				dispatchParts: ['meta+[ArrowDown]', null],
			}]
		);
	});

	test('resolveKeybinding Cmd+NUMPAD_0', () => {
		_assertResolveKeybinding(
			KeyMod.CtrlCmd | KeyCode.NUMPAD_0,
			[{
				label: '⌘NumPad0',
				ariaLabel: 'Command+NumPad0',
				HTMLLabel: [_simpleHTMLLabel(['⌘', 'NumPad0'])],
				electronAccelerator: null,
				userSettingsLabel: 'cmd+numpad0',
				isChord: false,
				hasCtrlModifier: false,
				hasShiftModifier: false,
				hasAltModifier: false,
				hasMetaModifier: true,
				dispatchParts: ['meta+[Numpad0]', null],
			}]
		);
	});

	test('resolveKeybinding Ctrl+Home', () => {
		_assertResolveKeybinding(
			KeyMod.CtrlCmd | KeyCode.Home,
			[{
				label: '⌘Home',
				ariaLabel: 'Command+Home',
				HTMLLabel: [_simpleHTMLLabel(['⌘', 'Home'])],
				electronAccelerator: 'Cmd+Home',
				userSettingsLabel: 'cmd+home',
				isChord: false,
				hasCtrlModifier: false,
				hasShiftModifier: false,
				hasAltModifier: false,
				hasMetaModifier: true,
				dispatchParts: ['meta+[Home]', null],
			}]
		);
	});

	test('resolveKeyboardEvent Ctrl+[Home]', () => {
		assertResolveKeyboardEvent(
			mapper,
			{
				ctrlKey: false,
				shiftKey: false,
				altKey: false,
				metaKey: true,
				keyCode: -1,
				code: 'Home'
			},
			{
				label: '⌘Home',
				ariaLabel: 'Command+Home',
				HTMLLabel: [_simpleHTMLLabel(['⌘', 'Home'])],
				electronAccelerator: 'Cmd+Home',
				userSettingsLabel: 'cmd+home',
				isChord: false,
				hasCtrlModifier: false,
				hasShiftModifier: false,
				hasAltModifier: false,
				hasMetaModifier: true,
				dispatchParts: ['meta+[Home]', null],
			}
		);
	});
});

suite('keyboardMapper - LINUX de_ch', () => {

	let mapper: MacLinuxKeyboardMapper;

	suiteSetup((done) => {
		createKeyboardMapper('linux_de_ch', OperatingSystem.Linux).then((_mapper) => {
			mapper = _mapper;
			done();
		}, done);
	});

	test('mapping', (done) => {
		assertMapping(mapper, 'linux_de_ch.txt', done);
	});

	function assertKeybindingTranslation(kb: number, expected: string | string[]): void {
		_assertKeybindingTranslation(mapper, OperatingSystem.Linux, kb, expected);
	}

	function _assertResolveKeybinding(k: number, expected: IResolvedKeybinding[]): void {
		assertResolveKeybinding(mapper, createKeybinding(k, OperatingSystem.Linux), expected);
	}

	function _simpleHTMLLabel(pieces: string[]): IHTMLContentElement {
		return simpleHTMLLabel(pieces, OperatingSystem.Linux);
	}

	function _chordHTMLLabel(firstPart: string[], chordPart: string[]): IHTMLContentElement {
		return chordHTMLLabel(firstPart, chordPart, OperatingSystem.Linux);
	}

	test('kb => hw', () => {
		// unchanged
		assertKeybindingTranslation(KeyMod.CtrlCmd | KeyCode.KEY_1, 'ctrl+Digit1');
		assertKeybindingTranslation(KeyMod.CtrlCmd | KeyCode.KEY_B, 'ctrl+KeyB');
		assertKeybindingTranslation(KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KEY_B, 'ctrl+shift+KeyB');
		assertKeybindingTranslation(KeyMod.CtrlCmd | KeyMod.Shift | KeyMod.Alt | KeyMod.WinCtrl | KeyCode.KEY_B, 'ctrl+shift+alt+meta+KeyB');

		// flips Y and Z
		assertKeybindingTranslation(KeyMod.CtrlCmd | KeyCode.KEY_Z, 'ctrl+KeyY');
		assertKeybindingTranslation(KeyMod.CtrlCmd | KeyCode.KEY_Y, 'ctrl+KeyZ');

		// Ctrl+/
		assertKeybindingTranslation(KeyMod.CtrlCmd | KeyCode.US_SLASH, 'ctrl+shift+Digit7');
	});

	test('resolveKeybinding Ctrl+A', () => {
		_assertResolveKeybinding(
			KeyMod.CtrlCmd | KeyCode.KEY_A,
			[{
				label: 'Ctrl+A',
				ariaLabel: 'Control+A',
				HTMLLabel: [_simpleHTMLLabel(['Ctrl', 'A'])],
				electronAccelerator: 'Ctrl+A',
				userSettingsLabel: 'ctrl+a',
				isChord: false,
				hasCtrlModifier: true,
				hasShiftModifier: false,
				hasAltModifier: false,
				hasMetaModifier: false,
				dispatchParts: ['ctrl+[KeyA]', null],
			}]
		);
	});

	test('resolveKeybinding Ctrl+Z', () => {
		_assertResolveKeybinding(
			KeyMod.CtrlCmd | KeyCode.KEY_Z,
			[{
				label: 'Ctrl+Z',
				ariaLabel: 'Control+Z',
				HTMLLabel: [_simpleHTMLLabel(['Ctrl', 'Z'])],
				electronAccelerator: 'Ctrl+Z',
				userSettingsLabel: 'ctrl+z',
				isChord: false,
				hasCtrlModifier: true,
				hasShiftModifier: false,
				hasAltModifier: false,
				hasMetaModifier: false,
				dispatchParts: ['ctrl+[KeyY]', null],
			}]
		);
	});

	test('resolveKeyboardEvent Ctrl+[KeyY]', () => {
		assertResolveKeyboardEvent(
			mapper,
			{
				ctrlKey: true,
				shiftKey: false,
				altKey: false,
				metaKey: false,
				keyCode: -1,
				code: 'KeyY'
			},
			{
				label: 'Ctrl+Z',
				ariaLabel: 'Control+Z',
				HTMLLabel: [_simpleHTMLLabel(['Ctrl', 'Z'])],
				electronAccelerator: 'Ctrl+Z',
				userSettingsLabel: 'ctrl+z',
				isChord: false,
				hasCtrlModifier: true,
				hasShiftModifier: false,
				hasAltModifier: false,
				hasMetaModifier: false,
				dispatchParts: ['ctrl+[KeyY]', null],
			}
		);
	});

	test('resolveKeybinding Ctrl+]', () => {
		_assertResolveKeybinding(
			KeyMod.CtrlCmd | KeyCode.US_CLOSE_SQUARE_BRACKET,
			[]
		);
	});

	test('resolveKeyboardEvent Ctrl+[BracketRight]', () => {
		assertResolveKeyboardEvent(
			mapper,
			{
				ctrlKey: true,
				shiftKey: false,
				altKey: false,
				metaKey: false,
				keyCode: -1,
				code: 'BracketRight'
			},
			{
				label: 'Ctrl+¨',
				ariaLabel: 'Control+¨',
				HTMLLabel: [_simpleHTMLLabel(['Ctrl', '¨'])],
				electronAccelerator: null,
				userSettingsLabel: 'ctrl+[BracketRight]',
				isChord: false,
				hasCtrlModifier: true,
				hasShiftModifier: false,
				hasAltModifier: false,
				hasMetaModifier: false,
				dispatchParts: ['ctrl+[BracketRight]', null],
			}
		);
	});

	test('resolveKeybinding Shift+]', () => {
		_assertResolveKeybinding(
			KeyMod.Shift | KeyCode.US_CLOSE_SQUARE_BRACKET,
			[{
				label: 'Ctrl+Alt+0',
				ariaLabel: 'Control+Alt+0',
				HTMLLabel: [_simpleHTMLLabel(['Ctrl', 'Alt', '0'])],
				electronAccelerator: 'Ctrl+Alt+0',
				userSettingsLabel: 'ctrl+alt+0',
				isChord: false,
				hasCtrlModifier: true,
				hasShiftModifier: false,
				hasAltModifier: true,
				hasMetaModifier: false,
				dispatchParts: ['ctrl+alt+[Digit0]', null],
			}, {
				label: 'Ctrl+Alt+$',
				ariaLabel: 'Control+Alt+$',
				HTMLLabel: [_simpleHTMLLabel(['Ctrl', 'Alt', '$'])],
				electronAccelerator: null,
				userSettingsLabel: 'ctrl+alt+[Backslash]',
				isChord: false,
				hasCtrlModifier: true,
				hasShiftModifier: false,
				hasAltModifier: true,
				hasMetaModifier: false,
				dispatchParts: ['ctrl+alt+[Backslash]', null],
			}]
		);
	});

	test('resolveKeybinding Ctrl+/', () => {
		_assertResolveKeybinding(
			KeyMod.CtrlCmd | KeyCode.US_SLASH,
			[{
				label: 'Ctrl+Shift+7',
				ariaLabel: 'Control+Shift+7',
				HTMLLabel: [_simpleHTMLLabel(['Ctrl', 'Shift', '7'])],
				electronAccelerator: 'Ctrl+Shift+7',
				userSettingsLabel: 'ctrl+shift+7',
				isChord: false,
				hasCtrlModifier: true,
				hasShiftModifier: true,
				hasAltModifier: false,
				hasMetaModifier: false,
				dispatchParts: ['ctrl+shift+[Digit7]', null],
			}]
		);
	});

	test('resolveKeybinding Ctrl+Shift+/', () => {
		_assertResolveKeybinding(
			KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.US_SLASH,
			[{
				label: 'Ctrl+Shift+\'',
				ariaLabel: 'Control+Shift+\'',
				HTMLLabel: [_simpleHTMLLabel(['Ctrl', 'Shift', '\''])],
				electronAccelerator: null,
				userSettingsLabel: 'ctrl+shift+[Minus]',
				isChord: false,
				hasCtrlModifier: true,
				hasShiftModifier: true,
				hasAltModifier: false,
				hasMetaModifier: false,
				dispatchParts: ['ctrl+shift+[Minus]', null],
			}]
		);
	});

	test('resolveKeybinding Ctrl+K Ctrl+\\', () => {
		_assertResolveKeybinding(
			KeyChord(KeyMod.CtrlCmd | KeyCode.KEY_K, KeyMod.CtrlCmd | KeyCode.US_BACKSLASH),
			[]
		);
	});

	test('resolveKeybinding Ctrl+K Ctrl+=', () => {
		_assertResolveKeybinding(
			KeyChord(KeyMod.CtrlCmd | KeyCode.KEY_K, KeyMod.CtrlCmd | KeyCode.US_EQUAL),
			[{
				label: 'Ctrl+K Ctrl+Shift+0',
				ariaLabel: 'Control+K Control+Shift+0',
				HTMLLabel: [_chordHTMLLabel(['Ctrl', 'K'], ['Ctrl', 'Shift', '0'])],
				electronAccelerator: null,
				userSettingsLabel: 'ctrl+k ctrl+shift+0',
				isChord: true,
				hasCtrlModifier: false,
				hasShiftModifier: false,
				hasAltModifier: false,
				hasMetaModifier: false,
				dispatchParts: ['ctrl+[KeyK]', 'ctrl+shift+[Digit0]'],
			}]
		);
	});

	test('resolveKeybinding Ctrl+DownArrow', () => {
		_assertResolveKeybinding(
			KeyMod.CtrlCmd | KeyCode.DownArrow,
			[{
				label: 'Ctrl+DownArrow',
				ariaLabel: 'Control+DownArrow',
				HTMLLabel: [_simpleHTMLLabel(['Ctrl', 'DownArrow'])],
				electronAccelerator: 'Ctrl+Down',
				userSettingsLabel: 'ctrl+down',
				isChord: false,
				hasCtrlModifier: true,
				hasShiftModifier: false,
				hasAltModifier: false,
				hasMetaModifier: false,
				dispatchParts: ['ctrl+[ArrowDown]', null],
			}]
		);
	});

	test('resolveKeybinding Ctrl+NUMPAD_0', () => {
		_assertResolveKeybinding(
			KeyMod.CtrlCmd | KeyCode.NUMPAD_0,
			[{
				label: 'Ctrl+NumPad0',
				ariaLabel: 'Control+NumPad0',
				HTMLLabel: [_simpleHTMLLabel(['Ctrl', 'NumPad0'])],
				electronAccelerator: null,
				userSettingsLabel: 'ctrl+numpad0',
				isChord: false,
				hasCtrlModifier: true,
				hasShiftModifier: false,
				hasAltModifier: false,
				hasMetaModifier: false,
				dispatchParts: ['ctrl+[Numpad0]', null],
			}]
		);
	});

	test('resolveKeybinding Ctrl+Home', () => {
		_assertResolveKeybinding(
			KeyMod.CtrlCmd | KeyCode.Home,
			[{
				label: 'Ctrl+Home',
				ariaLabel: 'Control+Home',
				HTMLLabel: [_simpleHTMLLabel(['Ctrl', 'Home'])],
				electronAccelerator: 'Ctrl+Home',
				userSettingsLabel: 'ctrl+home',
				isChord: false,
				hasCtrlModifier: true,
				hasShiftModifier: false,
				hasAltModifier: false,
				hasMetaModifier: false,
				dispatchParts: ['ctrl+[Home]', null],
			}]
		);
	});

	test('resolveKeyboardEvent Ctrl+[Home]', () => {
		assertResolveKeyboardEvent(
			mapper,
			{
				ctrlKey: true,
				shiftKey: false,
				altKey: false,
				metaKey: false,
				keyCode: -1,
				code: 'Home'
			},
			{
				label: 'Ctrl+Home',
				ariaLabel: 'Control+Home',
				HTMLLabel: [_simpleHTMLLabel(['Ctrl', 'Home'])],
				electronAccelerator: 'Ctrl+Home',
				userSettingsLabel: 'ctrl+home',
				isChord: false,
				hasCtrlModifier: true,
				hasShiftModifier: false,
				hasAltModifier: false,
				hasMetaModifier: false,
				dispatchParts: ['ctrl+[Home]', null],
			}
		);
	});
});

suite('keyboardMapper - LINUX en_us', () => {

	let mapper: MacLinuxKeyboardMapper;

	suiteSetup((done) => {
		createKeyboardMapper('linux_en_us', OperatingSystem.Linux).then((_mapper) => {
			mapper = _mapper;
			done();
		}, done);
	});

	test('mapping', (done) => {
		assertMapping(mapper, 'linux_en_us.txt', done);
	});

	function _assertResolveKeybinding(k: number, expected: IResolvedKeybinding[]): void {
		assertResolveKeybinding(mapper, createKeybinding(k, OperatingSystem.Linux), expected);
	}

	function _simpleHTMLLabel(pieces: string[]): IHTMLContentElement {
		return simpleHTMLLabel(pieces, OperatingSystem.Linux);
	}

	function _chordHTMLLabel(firstPart: string[], chordPart: string[]): IHTMLContentElement {
		return chordHTMLLabel(firstPart, chordPart, OperatingSystem.Linux);
	}

	test('resolveKeybinding Ctrl+A', () => {
		_assertResolveKeybinding(
			KeyMod.CtrlCmd | KeyCode.KEY_A,
			[{
				label: 'Ctrl+A',
				ariaLabel: 'Control+A',
				HTMLLabel: [_simpleHTMLLabel(['Ctrl', 'A'])],
				electronAccelerator: 'Ctrl+A',
				userSettingsLabel: 'ctrl+a',
				isChord: false,
				hasCtrlModifier: true,
				hasShiftModifier: false,
				hasAltModifier: false,
				hasMetaModifier: false,
				dispatchParts: ['ctrl+[KeyA]', null],
			}]
		);
	});

	test('resolveKeybinding Ctrl+Z', () => {
		_assertResolveKeybinding(
			KeyMod.CtrlCmd | KeyCode.KEY_Z,
			[{
				label: 'Ctrl+Z',
				ariaLabel: 'Control+Z',
				HTMLLabel: [_simpleHTMLLabel(['Ctrl', 'Z'])],
				electronAccelerator: 'Ctrl+Z',
				userSettingsLabel: 'ctrl+z',
				isChord: false,
				hasCtrlModifier: true,
				hasShiftModifier: false,
				hasAltModifier: false,
				hasMetaModifier: false,
				dispatchParts: ['ctrl+[KeyZ]', null],
			}]
		);
	});

	test('resolveKeyboardEvent Ctrl+[KeyZ]', () => {
		assertResolveKeyboardEvent(
			mapper,
			{
				ctrlKey: true,
				shiftKey: false,
				altKey: false,
				metaKey: false,
				keyCode: -1,
				code: 'KeyZ'
			},
			{
				label: 'Ctrl+Z',
				ariaLabel: 'Control+Z',
				HTMLLabel: [_simpleHTMLLabel(['Ctrl', 'Z'])],
				electronAccelerator: 'Ctrl+Z',
				userSettingsLabel: 'ctrl+z',
				isChord: false,
				hasCtrlModifier: true,
				hasShiftModifier: false,
				hasAltModifier: false,
				hasMetaModifier: false,
				dispatchParts: ['ctrl+[KeyZ]', null],
			}
		);
	});

	test('resolveKeybinding Ctrl+]', () => {
		_assertResolveKeybinding(
			KeyMod.CtrlCmd | KeyCode.US_CLOSE_SQUARE_BRACKET,
			[{
				label: 'Ctrl+]',
				ariaLabel: 'Control+]',
				HTMLLabel: [_simpleHTMLLabel(['Ctrl', ']'])],
				electronAccelerator: 'Ctrl+]',
				userSettingsLabel: 'ctrl+]',
				isChord: false,
				hasCtrlModifier: true,
				hasShiftModifier: false,
				hasAltModifier: false,
				hasMetaModifier: false,
				dispatchParts: ['ctrl+[BracketRight]', null],
			}]
		);
	});

	test('resolveKeyboardEvent Ctrl+[BracketRight]', () => {
		assertResolveKeyboardEvent(
			mapper,
			{
				ctrlKey: true,
				shiftKey: false,
				altKey: false,
				metaKey: false,
				keyCode: -1,
				code: 'BracketRight'
			},
			{
				label: 'Ctrl+]',
				ariaLabel: 'Control+]',
				HTMLLabel: [_simpleHTMLLabel(['Ctrl', ']'])],
				electronAccelerator: 'Ctrl+]',
				userSettingsLabel: 'ctrl+]',
				isChord: false,
				hasCtrlModifier: true,
				hasShiftModifier: false,
				hasAltModifier: false,
				hasMetaModifier: false,
				dispatchParts: ['ctrl+[BracketRight]', null],
			}
		);
	});

	test('resolveKeybinding Shift+]', () => {
		_assertResolveKeybinding(
			KeyMod.Shift | KeyCode.US_CLOSE_SQUARE_BRACKET,
			[{
				label: 'Shift+]',
				ariaLabel: 'Shift+]',
				HTMLLabel: [_simpleHTMLLabel(['Shift', ']'])],
				electronAccelerator: 'Shift+]',
				userSettingsLabel: 'shift+]',
				isChord: false,
				hasCtrlModifier: false,
				hasShiftModifier: true,
				hasAltModifier: false,
				hasMetaModifier: false,
				dispatchParts: ['shift+[BracketRight]', null],
			}]
		);
	});

	test('resolveKeybinding Ctrl+/', () => {
		_assertResolveKeybinding(
			KeyMod.CtrlCmd | KeyCode.US_SLASH,
			[{
				label: 'Ctrl+/',
				ariaLabel: 'Control+/',
				HTMLLabel: [_simpleHTMLLabel(['Ctrl', '/'])],
				electronAccelerator: 'Ctrl+/',
				userSettingsLabel: 'ctrl+/',
				isChord: false,
				hasCtrlModifier: true,
				hasShiftModifier: false,
				hasAltModifier: false,
				hasMetaModifier: false,
				dispatchParts: ['ctrl+[Slash]', null],
			}]
		);
	});

	test('resolveKeybinding Ctrl+Shift+/', () => {
		_assertResolveKeybinding(
			KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.US_SLASH,
			[{
				label: 'Ctrl+Shift+/',
				ariaLabel: 'Control+Shift+/',
				HTMLLabel: [_simpleHTMLLabel(['Ctrl', 'Shift', '/'])],
				electronAccelerator: 'Ctrl+Shift+/',
				userSettingsLabel: 'ctrl+shift+/',
				isChord: false,
				hasCtrlModifier: true,
				hasShiftModifier: true,
				hasAltModifier: false,
				hasMetaModifier: false,
				dispatchParts: ['ctrl+shift+[Slash]', null],
			}]
		);
	});

	test('resolveKeybinding Ctrl+K Ctrl+\\', () => {
		_assertResolveKeybinding(
			KeyChord(KeyMod.CtrlCmd | KeyCode.KEY_K, KeyMod.CtrlCmd | KeyCode.US_BACKSLASH),
			[{
				label: 'Ctrl+K Ctrl+\\',
				ariaLabel: 'Control+K Control+\\',
				HTMLLabel: [_chordHTMLLabel(['Ctrl', 'K'], ['Ctrl', '\\'])],
				electronAccelerator: null,
				userSettingsLabel: 'ctrl+k ctrl+\\',
				isChord: true,
				hasCtrlModifier: false,
				hasShiftModifier: false,
				hasAltModifier: false,
				hasMetaModifier: false,
				dispatchParts: ['ctrl+[KeyK]', 'ctrl+[Backslash]'],
			}]
		);
	});

	test('resolveKeybinding Ctrl+K Ctrl+=', () => {
		_assertResolveKeybinding(
			KeyChord(KeyMod.CtrlCmd | KeyCode.KEY_K, KeyMod.CtrlCmd | KeyCode.US_EQUAL),
			[{
				label: 'Ctrl+K Ctrl+=',
				ariaLabel: 'Control+K Control+=',
				HTMLLabel: [_chordHTMLLabel(['Ctrl', 'K'], ['Ctrl', '='])],
				electronAccelerator: null,
				userSettingsLabel: 'ctrl+k ctrl+=',
				isChord: true,
				hasCtrlModifier: false,
				hasShiftModifier: false,
				hasAltModifier: false,
				hasMetaModifier: false,
				dispatchParts: ['ctrl+[KeyK]', 'ctrl+[Equal]'],
			}]
		);
	});

	test('resolveKeybinding Ctrl+DownArrow', () => {
		_assertResolveKeybinding(
			KeyMod.CtrlCmd | KeyCode.DownArrow,
			[{
				label: 'Ctrl+DownArrow',
				ariaLabel: 'Control+DownArrow',
				HTMLLabel: [_simpleHTMLLabel(['Ctrl', 'DownArrow'])],
				electronAccelerator: 'Ctrl+Down',
				userSettingsLabel: 'ctrl+down',
				isChord: false,
				hasCtrlModifier: true,
				hasShiftModifier: false,
				hasAltModifier: false,
				hasMetaModifier: false,
				dispatchParts: ['ctrl+[ArrowDown]', null],
			}]
		);
	});

	test('resolveKeybinding Ctrl+NUMPAD_0', () => {
		_assertResolveKeybinding(
			KeyMod.CtrlCmd | KeyCode.NUMPAD_0,
			[{
				label: 'Ctrl+NumPad0',
				ariaLabel: 'Control+NumPad0',
				HTMLLabel: [_simpleHTMLLabel(['Ctrl', 'NumPad0'])],
				electronAccelerator: null,
				userSettingsLabel: 'ctrl+numpad0',
				isChord: false,
				hasCtrlModifier: true,
				hasShiftModifier: false,
				hasAltModifier: false,
				hasMetaModifier: false,
				dispatchParts: ['ctrl+[Numpad0]', null],
			}]
		);
	});

	test('resolveKeybinding Ctrl+Home', () => {
		_assertResolveKeybinding(
			KeyMod.CtrlCmd | KeyCode.Home,
			[{
				label: 'Ctrl+Home',
				ariaLabel: 'Control+Home',
				HTMLLabel: [_simpleHTMLLabel(['Ctrl', 'Home'])],
				electronAccelerator: 'Ctrl+Home',
				userSettingsLabel: 'ctrl+home',
				isChord: false,
				hasCtrlModifier: true,
				hasShiftModifier: false,
				hasAltModifier: false,
				hasMetaModifier: false,
				dispatchParts: ['ctrl+[Home]', null],
			}]
		);
	});

	test('resolveKeyboardEvent Ctrl+[Home]', () => {
		assertResolveKeyboardEvent(
			mapper,
			{
				ctrlKey: true,
				shiftKey: false,
				altKey: false,
				metaKey: false,
				keyCode: -1,
				code: 'Home'
			},
			{
				label: 'Ctrl+Home',
				ariaLabel: 'Control+Home',
				HTMLLabel: [_simpleHTMLLabel(['Ctrl', 'Home'])],
				electronAccelerator: 'Ctrl+Home',
				userSettingsLabel: 'ctrl+home',
				isChord: false,
				hasCtrlModifier: true,
				hasShiftModifier: false,
				hasAltModifier: false,
				hasMetaModifier: false,
				dispatchParts: ['ctrl+[Home]', null],
			}
		);
	});
});

function _assertKeybindingTranslation(mapper: MacLinuxKeyboardMapper, OS: OperatingSystem, kb: number, _expected: string | string[]): void {
	let expected: string[];
	if (typeof _expected === 'string') {
		expected = [_expected];
	} else if (Array.isArray(_expected)) {
		expected = _expected;
	} else {
		expected = [];
	}

	const runtimeKeybinding = createKeybinding(kb, OS);

	const keybindingLabel = new USLayoutResolvedKeybinding(runtimeKeybinding, OS).getUserSettingsLabel();

	const actualHardwareKeypresses = mapper.simpleKeybindingToHardwareKeypress(<SimpleKeybinding>runtimeKeybinding);
	if (actualHardwareKeypresses.length === 0) {
		assert.deepEqual([], expected, `simpleKeybindingToHardwareKeypress -- "${keybindingLabel}" -- actual: "[]" -- expected: "${expected}"`);
		return;
	}

	const actual = actualHardwareKeypresses
		.map(k => UserSettingsLabelProvider.toLabel(k, KeyboardEventCodeUtils.toString(k.code), null, null, OS));
	assert.deepEqual(actual, expected, `simpleKeybindingToHardwareKeypress -- "${keybindingLabel}" -- actual: "${actual}" -- expected: "${expected}"`);
}
