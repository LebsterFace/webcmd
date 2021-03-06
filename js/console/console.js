import {getCurrentFolder} from "../files/filesys.js";
import {setTheme, THEMES} from "./theme.js";
import {parseCommand} from "./parseCommand.js";
import {scrollToBottom} from "../index.js";
import {COMMANDS} from "../commands/commands.js";

const history = document.getElementById("history"),
	prefix = document.getElementById("prefix");

export function run(string) {
	string = string.replace(/\r/g, ""); // Remove CR if on windows

	printWithPrefix(string);
	if (/^[ \t\n]*$/.test(string)) return;

	const pipeChain = parseCommand(string.trim());

	let stdout = "",
		handler;

	const placeholders = arg => arg.replace(/\r(.+?)\r/g, (_, name) => eval(name));

	for (const {command, args, flags} of pipeChain) {
		handler = getHandler(command);

		if (handler === null) {
			error(`Unknown command '${command}'`);
			return;
		}

		stdout = handler.run(stdout, args.map(placeholders), flags);
	}

	if (handler.shouldPrint) {
		if (Array.isArray(stdout)) stdout = stdout.join(" ");
		print(stdout);
	}
}

export function getHandler(name) {
	name = name.toLowerCase();
	if (name in COMMANDS) return COMMANDS[name];
	for (const current in COMMANDS) if (COMMANDS[current].aliases.includes(name)) return COMMANDS[current];
	return null;
}

function padToPrefix(str) {
	const padding = " ".repeat(prefix.innerText.length);
	return str.replace(/\n/g, "\n" + padding);
}

function printWithPrefix(command) {
	print(prefix.innerText + padToPrefix(command));
}

export function clear() {
	history.innerHTML = "";
	return "";
}

export function error(message) {
	printJSON({
		text: message,
		color: "red"
	});
	return message;
}

export function print(text) {
	return printJSON({text});
}

export function printJSON(obj) {
	const spanElement = document.createElement("span"),
		textElement = document.createTextNode(obj.text);

	spanElement.appendChild(textElement);

	if (typeof obj.color === "string") {
		spanElement.style.color = obj.color;
	}

	if (typeof obj.background === "string") {
		spanElement.style.backgroundColor = obj.background;
	}

	if (typeof obj.noflush !== "boolean" || !obj.noflush) {
		spanElement.classList.add("line");
	}

	history.appendChild(spanElement);
	scrollToBottom();
	return obj.text;
}

export function updatePrompt() {
	prefix.innerText = getCurrentFolder().getPathString() + "$ ";
}

export function init() {
	clear();
	updatePrompt();
	print("WebCMD v2.51");
}

init();
setTheme(THEMES.default);
