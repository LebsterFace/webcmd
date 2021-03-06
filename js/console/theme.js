export const THEMES = {
	// Default theme inspired by the Windows `cmd.exe`
	default: {
		backgroundColor: "#000",
		textColor: "#0f0",
		fontFamily: "DOS, monospace",
		fontSize: "18px"
	},
	// https://eugeny.github.io/terminus/
	terminus: {
		backgroundColor: "rgb(26, 36, 46)",
		textColor: "#fff",
		fontFamily: "Fira Code",
		fontSize: "14px"
	},
	// https://plsbuymydepression.com/things/terminal/
	"so_v_ette": {
		backgroundColor: "#0c0c0c",
		textColor: "rgb(118, 118, 118)",
		fontFamily: "Inconsolata, 'Courier New', Courier, monospace",
		fontSize: "1.125em"
	},
	// Bit outlandish but looks kind of nice?
	"papier": {
		backgroundColor: "#0a0a0a",
		textColor: "#dfdfdf",
		fontFamily: '"Times New Roman", Times, serif',
		fontSize: "2em"
	},
	// Why not?
	"fugly": {
		backgroundColor: "orange",
		textColor: "magenta",
		fontFamily: '"Comic Sans MS", cursive',
		fontSize: "1.5em",
	}
};

// The current theme has to be retained so that the `color` command can
// modify only the colours of the theme without touching the font
const CURRENT_THEME = Object.assign({}, THEMES.default);

export function setTheme({textColor, backgroundColor, fontFamily, fontSize}) {
	// Each param is optional
	if (textColor) CURRENT_THEME.textColor = textColor;
	if (backgroundColor) CURRENT_THEME.backgroundColor = backgroundColor;
	if (fontFamily) CURRENT_THEME.fontFamily = fontFamily;
	if (fontSize) CURRENT_THEME.fontSize = fontSize;

	// Apply the css
    document.getElementById("theme").innerHTML = `body {
        background-color: ${CURRENT_THEME.backgroundColor};
        color: ${CURRENT_THEME.textColor};
        font-family: ${CURRENT_THEME.fontFamily};
        font-size: ${CURRENT_THEME.fontSize};
    }

    ::selection {
        color: ${CURRENT_THEME.backgroundColor};
        background-color: ${CURRENT_THEME.textColor};
    }`;
}

// From Windows `cmd.exe`
export const CONSOLE_COLORS = {
	"0": "rgb(0,0,0)",
	"1": "rgb(0,0,128)",
	"2": "rgb(0,128,0)",
	"3": "rgb(0,128,128)",
	"4": "rgb(128,0,0)",
	"5": "rgb(128,0,128)",
	"6": "rgb(128,128,0)",
	"7": "rgb(192,192,192)",
	"8": "rgb(128,128,128)",
	"9": "rgb(0,0,255)",
	A: "rgb(0,255,0)",
	B: "rgb(0,255,255)",
	C: "rgb(255,0,0)",
	D: "rgb(255,0,255)",
	E: "rgb(255,255,0)",
	F: "rgb(255,255,255)"
};