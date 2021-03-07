# WebCMD
A linux-style command prompt for the web. Built with vanilla JavaScript. [Try it online!](https://lebster.xyz/projects/webcmd)

## Features
 - [Full File System](#Full%20File%20System)
 - [Command Flags](#Command%20Flags)
 - [Custom Themes](#Custom%20Themes)
 - [Command Piping](#Command%20Piping)
 - [Dynamic Files](#Dynamic%20Files)
 - [Array Results](#Array%20Results)

### Full File System
WebCMD includes a full file system. You can create or delete files and directories, navigate via terminal commands and more!

### Command Flags
Terminal commands can have optional flags to specify extra parameters.

### Custom Themes
The appearance of the terminal can be changed to any of the wide variety of included themes. The foreground and background colors for each theme can also be changed via the `color` command.

### Command Piping
The result of one command can be piped as the input to another, allowing you to create chains of commands which all work together.

### Dynamic Files
Some files have their contents automatically re-generated upon reading (for example `~/dev/asciikb` is one KiB of random characters).

### Array Results
Commands can return multiple values in the form of an array. These values can then be mapped with a JavaScript function, or can be passed as input to another command via [piping](#Command%Piping).

## Future plans
 - Binary files
 - More files in the filesystem
 - Custom commands
 - Multiple terminals in one window
 - Data saved in LocalStorage
 - User-controllable sessions which save themes, custom commands + fs
 - Save command history, stdout + text in console in sessions
 - Windows style GUI?