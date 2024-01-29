#  IC 📽️
[![DeepSource](https://app.deepsource.com/gh/acowusu/segp.svg/?label=active+issues&show_trend=true&token=0kYCUSPcWEImKG2Bw9ObDPtx)](https://app.deepsource.com/gh/acowusu/segp/)

![logo](https://github.com/acowusu/segp/blob/main/desktop/build/windows11/Wide310x150Logo.scale-400.png?raw=true)

This project aims to develop an application that seamlessly converts large PDF reports into dynamic and informative videos. The key features of the generated videos will include:

* AI Audio Recital: Text from the report will be expertly narrated using AI-powered text-to-speech technology, ensuring a natural and engaging auditory experience.
* Captions: Subtitles will be automatically generated and synchronized with the audio, enhancing accessibility and comprehension for viewers.
* Visually Compelling: Relevant images and video footage will be intelligently selected and incorporated to visually reinforce key concepts and create a more captivating presentation.
* Customizable Video Effects: Users will have the ability to apply a variety of video effects and transitions to tailor the final output to their specific preferences or brand guidelines.
* Flexible Length and Topics: The application will empower users to create videos of varying lengths and focus on specific sections or topics within the report, catering to diverse communication needs.
* User-Friendly Editing: A user-friendly interface will enable seamless editing of the generated videos, allowing for adjustments to text, frames, and AI audio narration as needed.


## Table of Contents

1. [IC 📽️](#ic-%F0%9F%93%BD%EF%B8%8F)
   1. [Table of Contents](#table-of-contents)
   2. [Installation](#installation)
   3. [Development](#development)
   4. [How do I...](#how-do-i)
      1. [Add a new page?](#add-a-new-page)
      2. [Add a new component?](#add-a-new-component)
      3. [Add a new package?](#add-a-new-package)
      4. [Call backend functions?](#call-backend-functions)
      5. [Run code in worker thread?](#run-code-in-worker-thread)
   5. [Build](#build)
      1. [On Unix](#on-unix)
      2. [On macOS](#on-macos)
      3. [On Windows](#on-windows)
   6. [Features](#features)
   7. [Known Issues](#known-issues)
   8. [Best practices](#best-practices)
      1. [General](#general)
      2. [Tech Debt](#tech-debt)
   9. [Testing](#testing)
   10. [Contributing](#contributing)
   11. [License](#license)

## Installation

1. Clone the repository.
2. Install dependencies using `npm install`.

## Development

1. Run the application using `npm run dev`.
2. The app should launch automatically with HMR.
3. Make your changes.
4. See your changes live in the window!

##  How do I...

### Add a new page?

1. Create a new file in `src/pages`.
2. Add the page to `src/pages/index.tsx`. This is where you can decide where it is in the hierachy.

### Add a new component?

1. Create a new file in `src/components`.
2. Add the component to the file where you want to use it.

### Add a new package?

1. Front end packages: Run `npm install <package-name>`.
2. Back end packages: Run `npm install <package-name> --save-dev`.

### Call backend functions?

1. Write the function in the `electron` folder.
2. Export the function in `electron/routes.ts`.
3. Use the function in the front end using `window.api.<function-name>`.

Note: Do not run long running tasks in the main process or renderer process as it will freeze the UI. Instead, run them in the worker thread.

### Run code in worker thread?

1. Write a wrapper  function in the `electron` folder. this should setup the worker thread and call the function you want to run.
2. link the wrapper function in `electron/routes.ts`.
3. Write the actual function in the `electron/worker` folder. 


## Build

1. Run `npm run build`.
2. The built application will be in the `release` folder.

Note: The build process is **stricter** than the development process. If you have any type errors in your code, the build will fail.

Note: You may have to install node-gyp globally for the build to work. 


``` bash
npm install -g node-gyp
```

Depending on your operating system, you will need to install:

### On Unix

   * [A supported version of Python](https://devguide.python.org/versions/)
   * `make`
   * A proper C/C++ compiler toolchain, like [GCC](https://gcc.gnu.org)

### On macOS

   * [A supported version of Python](https://devguide.python.org/versions/)
   * `Xcode Command Line Tools` which will install `clang`, `clang++`, and `make`.
     * Install the `Xcode Command Line Tools` standalone by running `xcode-select --install`. -- OR --
     * Alternatively, if you already have the [full Xcode installed](https://developer.apple.com/xcode/download/), you can install the Command Line Tools under the menu `Xcode -> Open Developer Tool -> More Developer Tools...`.


### On Windows

Install the current [version of Python](https://devguide.python.org/versions/) from the
[Microsoft Store](https://apps.microsoft.com/store/search?publisher=Python+Software+Foundation).

Install tools and configuration manually:
   * Install Visual C++ Build Environment: [Visual Studio Build Tools](https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=BuildTools)
   (using "Visual C++ build tools" if using a version older than VS2019, otherwise use "Desktop development with C++" workload) or [Visual Studio Community](https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=Community)
   (using the "Desktop development with C++" workload)

   If the above steps didn't work for you, please visit [Microsoft's Node.js Guidelines for Windows](https://github.com/Microsoft/nodejs-guidelines/blob/master/windows-environment.md#compiling-native-addon-modules) for additional tips.

   To target native ARM64 Node.js on Windows on ARM, add the components "Visual C++ compilers and libraries for ARM64" and "Visual C++ ATL for ARM64".

   To use the native ARM64 C++ compiler on Windows on ARM, ensure that you have Visual Studio 2022 [17.4 or later](https://devblogs.microsoft.com/visualstudio/arm64-visual-studio-is-officially-here/) installed.

## Features

- Light/Dark Mode: Users can toggle between them.
- Responsive design:Adapts to window size.


## Known Issues

Sometimes when edditing the main process code HMR fails to garbage collect correctly leaving old processes running in the background. This can be fixed by running:

``` powershell
Stop-Process -Name Electron  -Force
```
There is an equivalent command for bash/zsh.

## Best practices


### General

*  Use `const` and `let` instead of `var`.
*  Use `===` and `!==` instead of `==` and `!=`.
*  Use arrow functions `() => {}` instead of `function() {}`.
*  Use promises `new Promise((resolve, reject) => {})` instead of callbacks `function(resolve, reject) {}`.
*  

### Tech Debt

*  Use existing components found in `src/components/ui` rather than creating new ones.
*  If you are creating a new component, check if it doesn't already exist on [Shadcn/ui](https://ui.shadcn.com/)
*  If you are using a new package, check that its recently been maintained and has a large user base. You can see both of these on [npmjs.com](https://www.npmjs.com/).
*  



## Testing

Install jest packages using `npm install --save-dev jest-electron`.
Use `npm run tests` to run tests. Add any new tests you write to the `__tests__` folder.

## Contributing

Contributions are welcome! Please follow these guidelines:

- Create a new branch.
- Make your changes.
- Check that the code still builds.
- Submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
