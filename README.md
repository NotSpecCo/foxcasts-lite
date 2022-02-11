# Foxcasts Lite

[![CircleCI](https://circleci.com/gh/garredow/foxcasts-lite/tree/main.svg?style=svg)](https://circleci.com/gh/garredow/foxcasts-lite/tree/main)

![Dashboard view](/promo/foxcasts_banner1.png?raw=true)

## Navigation

### Browser

All interaction is done using the keyboard.

- Arrows keys to navigate lists and tabs
- 1-9 are used as shortcuts in grids and lists
- Backspace to navigate back a screen
- Enter to perform the displayed action
- Shift+LeftArrow and Shift+RightArrow to trigger left and right nav bar actions

### On Device

- Use the d-pad to navigate lists and tabs
- 1-9 are used as shortcuts in grids and lists

## Running Locally

1. Clone and `npm start` the CORS proxy https://github.com/garredow/cors-testing
2. Clone and `npm start` Foxcasts Lite
3. Open Chrome to https://0.0.0.0:8080 to see app running
4. Optional: Create a custom emulated KaiOS device in Chrome Dev Tools. Settings: 

![Chrome Emulated Device](/promo/chrome_emulated_device.png?raw=true)

## How to Install

1. Install dependencies

```
npm install
```

2. Build the app

```
npm run build
```

3. Load the `build` folder as a packaged app using your Web IDE of choice (I like Waterfox Classic)

## How It's Made

Foxcasts Lite uses a few of my other projects.

### Foxcasts API

This API interacts with Podcast Index to retrieve information about podcasts and episodes. It also provides some functionality for getting podcast artwork and color palettes.

[Source](https://github.com/garredow/foxcasts-api)

### Foxcasts Core

This library contains all of the core business logic, database configuration, utility functions, and shared TypeScript models. This library is used across a couple different podcast web apps.

[Source](https://github.com/garredow/foxcasts-core)

### Mai UI

My UI component library made specifically for KaiOS devices. It provides a number of components, contexts, hooks, and helper utilities to make building apps for KaiOS quick and easy.

[Source](https://github.com/garredow/mai-ui)
