import {Command, INPUT_TYPE, STDIN, TYPE} from "./command.js";
import {init} from "../console/console.js";
import {formatSize, listRecursive, navigateTo} from "../files/filesys.js";
import {CONSOLE_COLORS, setTheme, THEMES} from "../console/theme.js";
import {getNum} from "../utils.js";
export const COMMANDS = {};

function addCommand(name, options) {
	COMMANDS[name] = new Command(name, options);
}

addCommand("echo", {
	code: (_, args) => args.join(" "),
	shouldPrint: true
});

addCommand("cd", {
	code: navigateTo
});

addCommand("cls", {
	code: init
});

addCommand("cat", {
	code: (stdin, args, {fsObj, flags}) => {
		let result = fsObj.content;
		if (flags.bytes !== null) {
			const bytes = getNum(flags.bytes, {whole: true, positive: true});
			result = result.substr(0, bytes);
		}

		if (flags.endings !== null) {
			result = result.replace(/\n/g, "$\n") + "$";
		}

		return result;
	},

	aliases: ["type"],
	type: [TYPE.OPERATE_ON_FILE],
	shouldPrint: true,
	flags: {
		bytes: ["b", "len", "length"],
		endings: ["e", "endl"]
	}
});

addCommand("touch", {
	code: (stdin, args, {fsObj}) => (fsObj.content = args.slice(1).join(" ")),
	aliases: ["new", "mkfile"],
	type: [TYPE.NEW_FILE]
});

addCommand("ls", {
	code: (stdin, args, {fsObj, flags}) => {
		if (flags.recursive) {
			return fsObj.contents.map(x => listRecursive(x)).join("\n");
		} else {
			return fsObj.contents.map(f => f.name);
		}
	},

	aliases: ["dir"],
	type: [TYPE.OPERATE_ON_FOLDER],
	shouldPrint: true,
	flags: {
		recursive: ["r", "s"]
	}
});

addCommand("spaceout", {
	code: text => text.split("").join(" ")
});

addCommand("join", {
	code: (array, args) => array.join(args.join(" ")),
	input: [INPUT_TYPE.ARRAY],
	stdin: STDIN.SEPERATE,
	shouldPrint: true
});

addCommand("md", {
	code: name => name,
	aliases: ["md"],
	type: [TYPE.NEW_FOLDER]
});

addCommand("rep", {
	code: (stdin, [timesToRepeat, ...str]) => str.join(" ").repeat(timesToRepeat),
	aliases: ["repeat"],
	shouldPrint: true,
	stdin: STDIN.AFTER_ARGS
});

addCommand("hexdump", {
	code: (stdin, args, {fsObj}) => {
		const rawDump = fsObj.content.split("").map(c => c.charCodeAt(0).toString(16).padStart(2, "0")); // Get bytes
		let result = `${fsObj.content.length.toLocaleString("en-GB")} bytes (${formatSize(fsObj.content.length)})\n`; // Header
		for (let i = 0; i < rawDump.length; i += 32) {
			const row = rawDump.slice(i, i + 32); // Get 1 row
			row.splice(16, 0, " "); // Insert space at element #16
			result += i.toString(16).padStart(8, "0") + "| " + row.join(" ").padEnd(97, " "); // Append byte row
			result += " |" + fsObj.content.substring(i, i + 32).padEnd(32, " ") + "|"; // Append text section
			result += "\n";
		}

		return result;
	},
	shouldPrint: true,
	type: [TYPE.OPERATE_ON_FILE]
});

addCommand("bindump", {
	code: (stdin, args, {fsObj}) => {
		const rawDump = fsObj.content.split("").map(c => c.charCodeAt(0).toString(2).padStart(8, "0")); // Get bytes
		let result = `${fsObj.content.length.toLocaleString("en-GB")} bytes (${formatSize(fsObj.content.length)})\n`; // Header
		for (let i = 0; i < rawDump.length; i += 10) {
			const row = rawDump.slice(i, i + 10); // Get 1 row
			row.splice(5, 0, " "); // Insert space at element #5
			result += i.toString(16).padStart(8, "0") + "| " + row.join(" ").padEnd(91, " "); // Append byte row
			result += " |" + fsObj.content.substring(i, i + 10).padEnd(10, " ") + "|"; // Append text section
			result += "\n";
		}

		return result;
	},
	shouldPrint: true,
	type: [TYPE.OPERATE_ON_FILE]
});

addCommand("color", {
	code: stdin => {
		const wrongColor = c => {
			throw new Error(`'${c}' is not a valid color! Try 'help color'`);
		};
		if (stdin.length === 1 && stdin.toUpperCase() in CONSOLE_COLORS) {
			setTheme({textColor: CONSOLE_COLORS[stdin.toUpperCase()]});
		} else if (stdin.length === 2) {
			if (!(stdin[0].toUpperCase() in CONSOLE_COLORS)) wrongColor(stdin[0]);
			if (!(stdin[1].toUpperCase() in CONSOLE_COLORS)) wrongColor(stdin[1]);
			setTheme({textColor: CONSOLE_COLORS[stdin[1].toUpperCase()], backgroundColor: CONSOLE_COLORS[stdin[0].toUpperCase()]});
		} else {
			wrongColor(stdin);
		}
	}
});

addCommand("theme", {
	code: stdin => {
		if (stdin.toLowerCase() in THEMES) {
			setTheme(THEMES[stdin.toLowerCase()]);
		} else {
			throw new Error(`Unknown theme '${stdin}'`);
		}
	}
});

addCommand("eval", {
	code: (stdin, args) => {
		const result = eval(args.join(" "));
		return typeof result === "function" ? result(stdin) : result;
	},
	aliases: ["js", "javascript", "jscript"],
	stdin: STDIN.SEPERATE,
	input: [INPUT_TYPE.ARRAY, INPUT_TYPE.STRING],
	shouldPrint: true
});

addCommand("map", {
	code: (stdin, args) => {
		const result = eval(args.join(" "));
		return typeof result === "function" ? stdin.map(result) : stdin.map(el => result);
	},
	aliases: ["each"],
	stdin: STDIN.SEPERATE,
	input: [INPUT_TYPE.ARRAY],
	shouldPrint: true
});

addCommand("flip", {
	code: array => [...array].reverse(),
	aliases: ["reverse"],
	stdin: STDIN.SEPERATE,
	input: [INPUT_TYPE.ARRAY],
	shouldPrint: true
});

addCommand("head", {
	code: (array, args) => array.slice(0, getNum(args.join(" "), {whole: true, positive: true})),
	aliases: ["first"],
	stdin: STDIN.SEPERATE,
	input: [INPUT_TYPE.ARRAY],
	shouldPrint: true
});

addCommand("tail", {
	code: (array, args) => array.slice(-getNum(args.join(" "), {whole: true, positive: true})),
	aliases: ["last"],
	stdin: STDIN.SEPERATE,
	input: [INPUT_TYPE.ARRAY],
	shouldPrint: true
});
