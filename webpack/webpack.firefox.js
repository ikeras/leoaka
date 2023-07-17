const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = merge(common, {
    mode: 'production',
    plugins: [
        new CopyPlugin({
            patterns: [
                { 
                    from: ".", 
                    to({ _, absoluteFilename }) {
                        if (absoluteFilename.includes("manifest-")) {
                            return "../manifest.json";
                        }
                        return "../";
                    },                    
                    context: "public",
                    filter: (resourcePath) => {
                        if (resourcePath.includes("manifest-")) {                    
                            return resourcePath.includes(`manifest-firefox.json`);
                        }

                        return true;
                    }
                },
            ],
        }),
    ],    
});