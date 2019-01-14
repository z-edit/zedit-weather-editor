/* global ngapp, xelib, modulePath */
//= require ./src/cloudLayerService.js
//= require ./src/recentService.js
//= require ./src/resourceService.js
//= require ./src/alphaInput.js
//= require ./src/colorSelector.js
//= require ./src/textureSelector.js
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