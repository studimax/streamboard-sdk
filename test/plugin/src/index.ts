import StreamBoardSDK from "../../../src/index";

const sdk = new StreamBoardSDK();

console.log("plugin connected");
sdk.on("connected", context => {
    let i = 0;
    context.setText("...");
    context.setColor("#1452bc");
    context.onClick(() => {
        if (++i % 2 == 0) {
            context.setText("Hello");
            context.setColor("#14bc30");
        } else {
            context.setText("World");
            context.setColor("#cf0000");
        }
    });
});
