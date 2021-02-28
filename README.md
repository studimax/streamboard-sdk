![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/studimax/streamboard-sdk/CodeQL)
[![npm](https://img.shields.io/npm/v/streamboard-sdk)](https://www.npmjs.com/package/streamboard-sdk)
# Stream Board SDK

This project is the **official** SDK for the Stream Board project.

The SDK is helpful to develop some plugins as easy as possible and as fast as possible.

# Installation

    $ npm install streamboard-sdk

And then you can extend your Plugin class with PluginAbstract
    
    import PluginAbstract from "streamboard-sdk";
    class SimplePlugin extends PluginAbstract {
        constructor(){
            super();
        }
    }

#### Done

Et voilà - we created a simple plugin. Don't forget that this project is in development.
