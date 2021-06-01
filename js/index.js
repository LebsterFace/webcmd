import {printError, run} from "./console/console.js";
import {saveRoot} from "./files/filesys.js";

const input = document.getElementById("input");
const commandHistory = [];
let historyOffset = 0;

document.onkeydown = e => input.focus();

input.onkeydown = function(e) {
	expandInput();

	if (e.code === "Tab") {
		e.preventDefault();
		input.value += "\t";
	}

	// Shift-Enter will enter a regular newline
	if (e.code === "Enter" && !e.shiftKey && isCaretOnLineNo(-1)) {
		console.log("%c== [ Command Entered ] ==", "color:red");
		console.log(`%c${input.value}`, "color:#0F0;background:#000");
		console.time("Total"); // Debug
		e.preventDefault();

		try {
			run(input.value.replace(/\r/g, "")); // Remove CR if on windows
		} catch (er) {
			printError(er);
			console.error(er); // Debug!
		}

		// Don't push duplicate commands to history
		if (commandHistory[0] !== input.value) commandHistory.unshift(input.value);
		historyOffset = -1;
		input.value = "";
		console.timeEnd("Total"); // Debug
	}
	
	// Increment and decrement the History Offset
	else if (e.code === "ArrowUp" && isCaretOnLineNo(0)) {
		loadHistory(1);
		e.preventDefault();
	} else if (e.code === "ArrowDown" && isCaretOnLineNo(-1)) {
		loadHistory(-1);
		e.preventDefault();
	}

	expandInput();
};

input.onkeyup = expandInput;

function isCaretOnLineNo(n) {
	const totalLines = input.value.split("\n").length,
		currentLine = input.value.substr(0, input.selectionStart).split("\n").length - 1;

	while (n < 0) n = totalLines + n;
	return currentLine === n;
}

function setCaretToEndOfLineNo(n) {
	const lineOffsets = input.value.split("\n").reduce((acc, cv) => {
		acc.current += cv.length + 1; // +1 for newline character
		acc.history.push(acc.current);
		return acc;
	}, {history: [], current: -1}).history;

	while (n < 0) n = lineOffsets.length + n;
	input.setSelectionRange(lineOffsets[n], lineOffsets[n]);
}

function expandInput() {
	input.style.height = "inherit";

	// Compute the height of the input textarea
	const computed = window.getComputedStyle(input),
		paddingTop = parseInt(computed.getPropertyValue("padding-top")),
		paddingBottom = parseInt(computed.getPropertyValue("padding-bottom")),
		height = paddingTop + input.scrollHeight + paddingBottom;

	// Scale the input textarea
	input.style.height = height + "px";
	scrollToBottom();
}

/**
* Load the current History Offset command into the input textarea
*/
function loadHistory(change) {
	historyOffset += change;
	// Clamp value
	if (historyOffset < -1) {
		historyOffset = -1;
	} else if (historyOffset >= commandHistory.length) {
		historyOffset = commandHistory.length - 1;
	} else if (historyOffset === -1) {
		// -1 indicates the latest command
		// TODO: Retain non-entered text in the -1 offset
		input.value = "";
	} else {
		// Set the textarea content to the appropriate command from history
		input.value = commandHistory[historyOffset];
		setCaretToEndOfLineNo(change > 0 ? -1 : 0);
	}
}

/**
* Scroll to the bottom of the page
*/
export function scrollToBottom() {
	window.scrollTo(0, document.documentElement.scrollHeight);
}

window.onbeforeunload = saveRoot;
