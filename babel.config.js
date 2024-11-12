module.exports = function (api) {
    api.cache(true);
    const isWeb = true;
    return {
        presets: ["babel-preset-expo"],
        plugins: [
            ["@babel/plugin-proposal-decorators", { legacy: true }],
            ["@babel/plugin-proposal-class-properties", { loose: true }],
            [
                "@babel/plugin-transform-runtime",
                {
                    helpers: true,
                    regenerator: true,
                },
            ],
            // [
            //     "module-resolver",
            //     {
            //         alias: {
            //             "@nozbe/watermelondb/adapters/sqlite": isWeb
            //                 ? "@nozbe/watermelondb/adapters/lokijs"
            //                 : "@nozbe/watermelondb/adapters/sqlite",
            //         },
            //     },
            // ],
        ],
    };
};
