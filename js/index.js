import {error, run} from "./console/console.js";

const input = document.getElementById("input");
const commandHistory = [];
let historyOffset = 0;

document.onkeydown = () => input.focus();
input.onkeydown = function(e) {
	if (e.code === "Enter" && !e.shiftKey) {
		console.time("Executing Command");
		scrollToBottom();
		e.preventDefault();

		try {
			run(input.value);
		} catch (er) {
			error(er);
			console.error(er);
		}

		if (commandHistory[0] !== input.value) commandHistory.unshift(input.value);
		historyOffset = -1;
		input.value = "";
		console.timeEnd("Executing Command");
	} else if (e.code === "ArrowUp") {
		historyOffset++;
		loadHistory();
		e.preventDefault();
	} else if (e.code === "ArrowDown") {
		historyOffset--;
		loadHistory();
		e.preventDefault();
	}

	autoExpand();
};

input.onkeyup = autoExpand;

function autoExpand() {
	input.style.height = "inherit";

	const computed = window.getComputedStyle(input),
		paddingTop = parseInt(computed.getPropertyValue("padding-top")),
		paddingBottom = parseInt(computed.getPropertyValue("padding-bottom")),
		height = paddingTop + input.scrollHeight + paddingBottom;

	input.style.height = height + "px";
	scrollToBottom();
}

function loadHistory() {
	if (historyOffset < -1) {
		historyOffset = -1;
	} else if (historyOffset >= commandHistory.length) {
		historyOffset = commandHistory.length - 1;
	} else if (historyOffset === -1) {
		input.value = "";
	} else {
		input.value = commandHistory[historyOffset];
		input.setSelectionRange(input.value.length, input.value.length);
	}
}

export function scrollToBottom() {
	window.scrollTo(0, document.documentElement.scrollHeight);
}
