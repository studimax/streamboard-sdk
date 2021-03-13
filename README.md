![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/studimax/streamboard-sdk/CodeQL)
[![npm](https://img.shields.io/npm/v/streamboard-sdk)](https://www.npmjs.com/package/streamboard-sdk)
# Stream Board SDK

This project is the **official** SDK for the Stream Board project.

The SDK is helpful to develop some plugins as easy as possible and as fast as possible.

# Installation

    $ npm install streamboard-sdk

And then you can use the sdk like this example

    import StreamBoardSDK from "stremboard-sdk";
    
    const sdk = new StreamBoardSDK();

    sdk.onConnexion(context => {
        context.setText("Hello");
        context.setColor("#1452bc");
        context.onClick(() => {
            context.setText("World");
            context.setColor("#14bc30");
        });
    });


#### Done

Et voilà - we created a simple plugin. Don't forget that this project is in development.
