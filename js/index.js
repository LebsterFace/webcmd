import {printError, run} from "./console/console.js";
		
const input = document.getElementById("input");
const commandHistory = [];
let historyOffset = 0;
		
document.onkeydown = e => input.focus();

input.onkeydown = function(e) {
	expandInput();

	// Shift-Enter will enter a regular newline
	if (e.code === "Enter" && !e.shiftKey) {
		console.time("Executing Command"); // Debug
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
		console.timeEnd("Executing Command"); // Debug
	}
			
	// Increment and decrement the History Offset
	else if (e.code === "ArrowUp") {
		historyOffset++;
		loadHistory();
		e.preventDefault();
	} else if (e.code === "ArrowDown") {
		historyOffset--;
		loadHistory();
		e.preventDefault();
	}

	expandInput();
};
		
input.onkeyup = expandInput;
		
/**
	* Expand the input textarea to fit its content
	*/
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
function loadHistory() {
	// Clamp value
	if (historyOffset < -1) {
		historyOffset = -1;
	} else if (historyOffset >= commandHistory.length) {
		historyOffset = commandHistory.length - 1;
	}
	// -1 indicates the latest command
	// TODO: Retain non-entered text in the -1 offset
	else if (historyOffset === -1) {
		input.value = "";
	}
			
	// Set the textarea content to the appropriate command from history
	else {
		input.value = commandHistory[historyOffset];
		input.setSelectionRange(input.value.length, input.value.length); // Used to make the caret move to the end of the command
	}
}
		
/**
	* Scroll to the bottom of the page
	*/
export function scrollToBottom() {
	window.scrollTo(0, document.documentElement.scrollHeight);
}
