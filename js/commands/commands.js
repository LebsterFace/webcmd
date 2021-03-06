import {Command, CommandError, ExecutionError, INPUT_TYPE, STDIN, TYPE} from "./command.js";
import {init, print} from "../console/console.js";
import {formatSize, getCurrentFolder, listRecursive, navigateTo} from "../files/filesys.js";
import {CONSOLE_COLORS, setTheme, THEMES} from "../console/theme.js";
import {getNum} from "../utils.js";
import {getStringFromUint8Array, fromJSON} from "../files/files.js";
export const COMMANDS = {};

// Helper function to avoid duplication of name property
function addCommand(name, options) {
	COMMANDS[name] = new Command(name, options);
}

// Print all arguments
addCommand("echo", {
	code: (_, args) => args.join(" "),
	shouldPrint: true
});

// Change directory
addCommand("cd", {
	code: navigateTo
});

// Clear the screen and re-initalize with the startup message
addCommand("cls", {
	code: init
});

// conCATenate the contents of a file to standard out
addCommand("cat", {
	code: (stdin, args, {fsObj, flags}) => {
		let result = fsObj.contentString;
		if (flags.bytes !== null) {
			const bytes = getNum(flags.bytes, {whole: true, positive: true});
			result = result.substr(0, bytes); // Read only a certain number of bytes
		}

		if (flags.endings !== null) {
			result = result.replace(/\n/g, "$\n") + "$"; // Append $ to line endings
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

// Create or update the contents of a file
addCommand("touch", {
	code: (stdin, args, {fsObj}) => (fsObj.content = args.slice(1).join(" ")),
	aliases: ["new", "mkfile"],
	type: [TYPE.NEW_FILE]
});

// List the files and directories in a folder
addCommand("ls", {
	code: (stdin, args, {fsObj, flags}) => {
		if (flags.recursive) {
			// Return a string representation of the recursive listing of fsObj
			return fsObj.contents.map(x => listRecursive(x)).join("\n");
		} else {
			// Return an array of subfile/subfolder names
			return fsObj.contents.map(f => f.name);
		}
	},
	aliases: ["dir"], // From Windows
	type: [TYPE.OPERATE_ON_FOLDER],
	shouldPrint: true,
	flags: {
		recursive: ["r", "s"]
	}
});

// Space every letter in stdin apart with a space character
addCommand("spaceout", {
	code: text => text.split("").join(" ")
});

// Join an array passed from stdin with the arguments as the separator
addCommand("join", {
	code: (array, args) => array.join(args.join(" ")),
	input: [INPUT_TYPE.ARRAY],
	stdin: STDIN.SEPERATE,
	shouldPrint: true
});

// Make a directory at the specified path
addCommand("md", {
	code: name => name,
	aliases: ["mkdir"],
	type: [TYPE.NEW_FOLDER]
});

// Repeat stdin [n] times
addCommand("rep", {
	code: (stdin, [timesToRepeat, ...str]) => str.join(" ").repeat(timesToRepeat),
	aliases: ["repeat"],
	shouldPrint: true,
	stdin: STDIN.AFTER_ARGS
});

// Print the hexadecimal contents of a file
addCommand("hexdump", {
	code: (stdin, args, {fsObj, flags}) => {
		const rawBytes = fsObj.content,
			dump = Array.from(rawBytes).map(c => c.toString(16).padStart(2, "0")), // Get bytes
			stringContent = getStringFromUint8Array(rawBytes), // Get text
			charsPerRow = fsObj.isUnicode ? 8 : 32;

		let result = `${dump.length.toLocaleString("en-GB")} bytes (${formatSize(dump.length)})\n`; // Header

		for (let i = 0; i < dump.length; i += 32) {
			const row = dump.slice(i, i + 32); // Get 1 row
			row.splice(16, 0, " "); // Insert space at element #16
			result += i.toString(16).padStart(8, "0") + "| " + row.join(" ").padEnd(97, " "); // Append byte row
			if (flags.text) result += " |" + stringContent.substring(i, i + charsPerRow).padEnd(charsPerRow, " ") + "|"; // Append text section
			result += "\n";
		}

		return result;
	},
	shouldPrint: true,
	type: [TYPE.OPERATE_ON_FILE],
	flags: {
		text: ["t", "ch", "c"]
	}
});

// Print the binary contents of a file
addCommand("bindump", {
	code: (stdin, args, {fsObj}) => {
		// console.log(Array.from(fsObj.content).map(e => e.toString(2).padStart(8, "0")).join(" "));
		return "Currently being reworked...";
		// const rawDump = fsObj.content.split("").map(c => c.charCodeAt(0).toString(2).padStart(8, "0")); // Get bytes
		// let result = `${fsObj.content.length.toLocaleString("en-GB")} bytes (${formatSize(fsObj.content.length)})\n`; // Header
		// for (let i = 0; i < rawDump.length; i += 10) {
		// 	const row = rawDump.slice(i, i + 10); // Get 1 row
		// 	row.splice(5, 0, " "); // Insert space at element #5
		// 	result += i.toString(16).padStart(8, "0") + "| " + row.join(" ").padEnd(91, " "); // Append byte row
		// 	result += " |" + fsObj.content.substring(i, i + 10).padEnd(10, " ") + "|"; // Append text section
		// 	result += "\n";
		// }

		// return result;
	},
	shouldPrint: true,
	type: [TYPE.OPERATE_ON_FILE]
});

// Change the terminal colour to one of the colours defined in theme.js
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

// Set the terminal theme
addCommand("theme", {
	code: stdin => {
		if (stdin.toLowerCase() in THEMES) {
			setTheme(THEMES[stdin.toLowerCase()]);
		} else {
			throw new Error(`Unknown theme '${stdin}'`);
		}
	}
});

// Evaluate JavaScript code passed as arguments
// If the result of the evaluation is a function it will be called with standard in
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

// Update/Read a dynamic file's function
addCommand("evalfile", {
	code: (stdin, args, {fsObj}) => {
		if (args.length > 1) {
			const jscode = args.slice(1).join(" "),
				result = eval(jscode),
				func = typeof result === "function" ? result : x => (typeof result === "undefined" ? result : null);

			fsObj.content = func;
			return jscode;
		} else {
			if (typeof fsObj.rawBytes !== "function") throw new CommandError(`'${fsObj.name}' is not dynamic.`);
			return fsObj.rawBytes.toString();
		}
	},
	aliases: ["jsfile", "dynamicfile", "dynfile"],
	type: [TYPE.NEW_FILE],
	stdin: STDIN.SEPERATE,
	shouldPrint: true
});

// Map an array passed from stdin with a JavaScript function
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

// Filter an array passed from stdin with a JavaScript function
addCommand("filter", {
	code: (stdin, args) => stdin.filter(eval(args.join(" "))),
	aliases: [],
	stdin: STDIN.SEPERATE,
	input: [INPUT_TYPE.ARRAY],
	shouldPrint: true
});

// Reduce an array passed from stdin with a JavaScript function
addCommand("reduce", {
	code: (stdin, args, {flags}) => stdin.reduce(eval(args.join(" ")), eval(flags.initial)),
	aliases: [],
	flags: {initial: ["init", "i", "start", "starting", "s"]},
	stdin: STDIN.SEPERATE,
	input: [INPUT_TYPE.ARRAY],
	shouldPrint: true
});

// Reverse an array or string
addCommand("flip", {
	code: obj => {
		const reversed = [...obj].reverse();
		return Array.isArray(obj)  ? reversed : reversed.join("");
	},
	aliases: ["reverse"],
	stdin: STDIN.SEPERATE,
	input: [INPUT_TYPE.ARRAY, INPUT_TYPE.STRING],
	shouldPrint: true
});

// Take the first [n] elements from an array
addCommand("head", {
	code: (array, args) => array.slice(0, getNum(args.join(" "), {whole: true, positive: true})),
	aliases: ["first"],
	stdin: STDIN.SEPERATE,
	input: [INPUT_TYPE.ARRAY],
	shouldPrint: true
});

// Take the last [n] elements from an array
addCommand("tail", {
	code: (array, args) => array.slice(-getNum(args.join(" "), {whole: true, positive: true})),
	aliases: ["last"],
	stdin: STDIN.SEPERATE,
	input: [INPUT_TYPE.ARRAY],
	shouldPrint: true
});

// Get the elements at the provided index/indicies from an array
addCommand("grab", {
	code: (array, args) => {
		const result = [];
		for (const str of args) {
			const index = parseInt(str);
			if (isNaN(index)) throw new ExecutionError(`Invalid index '${str}'`);
			else if (index < 0 || index >= array.length) throw new ExecutionError("Array index out of bounds.");
			result.push(array[index]);
		}
		return result;
	},
	aliases: ["at", "index", "item", "items"],
	stdin: STDIN.SEPERATE,
	input: [INPUT_TYPE.ARRAY],
	shouldPrint: true
});

// Get the entries of an array
addCommand("entries", {
	code: arr => Array.from(arr.entries()),
	aliases: [],
	stdin: STDIN.OR_ARGS,
	input: [INPUT_TYPE.ARRAY],
	shouldPrint: true
});

// Delete a file / folder
addCommand("rm", {
	code: (stdin, args, {fsObj, flags}) => {
		const name = fsObj.name;
		if (flags.verbose) print(`Deleting ${name}...`);
		fsObj.delete();
		if (flags.verbose) print("Done!");
		return name;
	},
	aliases: ["del", "rd", "remove", "delete", "rmdir"],
	flags: {verbose: ["v", "vb"]},
	type: [TYPE.OPERERATE_ON_FS],
	stdin: STDIN.SEPERATE,
	shouldPrint: false
});

// Rename a file / folder
addCommand("rename", {
	code: (stdin, args, {fsObj}) => fsObj.setName(args.slice(1).join(" ")),
	aliases: ["rn", "name"],
	type: [TYPE.OPERERATE_ON_FS],
	stdin: STDIN.SEPERATE,
	shouldPrint: false
});

// Create command
addCommand("cmd", {
	code: (stdin, args, {flags}) => {
		const cmdName = args.shift(),
			     code = args.join(" ");

		const raw = eval(code),
			func = typeof raw === "function" ? raw : _ => raw,
			options = flags.options ? JSON.parse(flags.options) : {shouldPrint: true};

		options.code = func;
		addCommand(cmdName, options);
	},
	aliases: ["newcmd", "command"],
	flags: {options: ["o", "opt"]},
	shouldPrint: false
});
