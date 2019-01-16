/* global ngapp, xelib, modulePath */
//= require ./src/classes/Weather.js
//= require ./src/classes/TES4Weather.js
//= require ./src/classes/FO3Weather.js
//= require ./src/classes/FNVWeather.js
//= require ./src/classes/TES5Weather.js
//= require ./src/classes/SSEWeather.js
//= require ./src/classes/FO4Weather.js
//= require ./src/weatherService.js
//= require ./src/alphaInput.js
//= require ./src/cloudSpeedInput.js
//= require ./src/editWeatherModal.js
//= require ./src/editWeather/clouds.js

ngapp.run(function(contextMenuFactory, nodeHelpers) {
    let {isRecordNode} = nodeHelpers,
        {treeViewItems} = contextMenuFactory;

    let isWeather = node => xelib.Signature(node.handle) === 'WTHR';

    treeViewItems.insertAfter(item => item.id === 'Open in new', {
        id: 'Edit weather',
        visible: (scope) => {
            let node = scope.selectedNodes.last();
            return node && isRecordNode(node) && isWeather(node);
        },
        build: (scope, items) => {
            items.push({
                label: 'Edit weather',
                hotkey: 'Ctrl+E',
                callback: () => scope.$emit('openModal', 'editWeather', {
                    nodes: scope.selectedNodes,
                    basePath: `${moduleUrl}/partials`
                })
            });
        }
    });
});