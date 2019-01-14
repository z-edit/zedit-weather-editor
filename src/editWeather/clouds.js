ngapp.controller('editWeatherCloudsController', function($scope) {
    $scope.disabledLayers = [];
    $scope.cloudLayers = [];

    let loadLayers = function() {
        $scope.weather.getCloudLayers().forEach(layer => {
            let key = layer.disabled ? 'disabledLayers' : 'cloudLayers';
            $scope[key].push(layer);
        });
    };

    $scope.addLayer = function(item) {
        let index = $scope.disabledLayers.findIndex(layer => {
            return layer.index === item.index;
        });
        let layerToAdd = $scope.disabledLayers.splice(index, 1)[0];
        layerToAdd.disabled = false;
        $scope.cloudLayers.push(layerToAdd);
        $scope.cloudLayers.sortOnKey('index');
    };

    $scope.disableLayer = function(index) {
        let layerToAdd = $scope.cloudLayers.splice(index, 1)[0];
        layerToAdd.disabled = true;
        $scope.disabledLayers.push(layerToAdd);
    };

    // initialization
    loadLayers();
});