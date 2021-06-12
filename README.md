# Stream Board SDK

![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/studimax/streamboard-sdk/CodeQL)
[![npm](https://img.shields.io/npm/v/streamboard-sdk)](https://www.npmjs.com/package/streamboard-sdk)
[![Code Style: Google](https://img.shields.io/badge/code%20style-google-blueviolet.svg?logo=google&logoColor=white)](https://github.com/google/gts)
[![Code: TypeScript](https://img.shields.io/badge/made%20with-typescript-blue.svg?logo=typescript&logoColor=white)](https://github.com/microsoft/TypeScript)
[![Made By: StudiMax](https://img.shields.io/badge/made%20by-studimax-red.svg)](https://github.com/studimax)

This project is the **official** SDK for the Stream Board project.

The SDK is helpful to develop some plugins as easy as possible and as fast as possible.

## Installation

```bash
$ npm install streamboard-sdk
OR
$ yarn add streamboard-sdk
```

## Example

Then you can use the sdk like this example

```js
import StreamBoardSDK from "stremboard-sdk";

const sdk = new StreamBoardSDK();

sdk.setActionConfig('myaction', [
  { type: 'input_text', key: 'world', default: () => 'World' },
]);

sdk.onContext('myaction', context => {
  context.setText("Hello");
  context.setColor("#1452bc");

  context.onPressDown(async () => {
    const config = await context.getConfig();

    context.setText(`Hello ${config.world}`);
    context.setColor("#14bc30");
  });
});

sdk.ready();
```

### Package.json

The plugin need a valid package.json with this minimum configuration:

```json
{
  "name": "simple-plugin",
  "version": "1.0.0",
  "main": "src/index.ts",
  "icon": "assets/img/icon.png",
  "identifier": "ch.studimax.simple-plugin",
  "actions": {
    "myaction": {
      "name": "Test",
      "icon": "assets/img/actions/test.png"
    }
  },
  "engines": {
    "node": ">=14.16.0"
  }
}
```

### Context

The plugin is executed one time on the StreamBoard, so there is only one instance of the plugin. That's why we need to
use context. Context is an instance of a plugin's action declared in package.json.

#### setText(value:string)

```js
context.setText("text");
```

#### setImage(src:string)

src is an absolute URL.

```js
context.setImage("https://media.giphy.com/media/xT4uQl1oBYev1vaRos/giphy.gif");
```

#### setColor(color:string)

color is a valid CSS color.

```js
context.setColor("#ff0000");
```

### Context Events

#### onPressDown

Got this event when icon is pressed down.

```js
context.onPressDown(() => {
  console.log('press down');
})
```

#### onPressUp

Got this event when icon is pressed up. You can get the press duration with `pressDuration`

```js
context.onPressUp(({ pressDuration }) => {
  console.log('press up');
})
```

#### onStop

Got this event when the context is stopped.

```js
context.onStop(() => {
  console.log('stop');
})
```

#### onSettings

Got this event when the context's config changed.

```js
context.onSettings(config => {
  console.log(config);
})
```

### Get all contexts

```js
//get all contexts
const contexts = sdk.getAllContexts();

//get all contexts with action named "action"
const contexts = sdk.getAllContexts("action");
```

### onContext

onContext is executed when a new context is added on StreamBoard, the context instance and the config are returned.

```js
sdk.onContext((context, config) => {
  console.log(context);
})
```

## Done

Et voilà - we created a simple plugin. Don't forget that this project is in development.
