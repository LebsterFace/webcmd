# WebCMD
A linux-inspired command prompt for the web. Built with vanilla JavaScript. [Try it online!](https://lebster.xyz/projects/webcmd)

## Features
 - [Full File System](#full-file-system)
 - [Command Flags](#command-flags)
 - [Custom Themes](#custom-themes)
 - [Command Piping](#command-piping)
 - [Dynamic Files](#dynamic-files)
 - [Array Results](#array-results)

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
 - [x] Binary files
 - [x] Custom commands
 - [ ] More files in the filesystem
 - [ ] Multiple terminals in one window
 - [x] Data saved in LocalStorage
 - [ ] User-controllable sessions which save themes, custom commands + fs
 - [ ] Save command history, stdout + text in console in sessions
 - [ ] Windows style GUI?
