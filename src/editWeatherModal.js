ngapp.controller('editWeatherModalController', function($scope, tabService, weatherService) {
    // initialization
    let node = $scope.modalOptions.nodes.last(),
        name = xelib.Name(node.handle);
    $scope.weather = new weatherService.Weather(node.handle);
    xelib.WithHandle(xelib.GetElementFile(node.handle), file => {
        $scope.path = `${xelib.Name(file)}\\${name}`;
    });

    $scope.tabs = [{
        label: 'Clouds',
        templateUrl: `${moduleUrl}/partials/editWeather/clouds.html`,
        controller: 'editWeatherCloudsController'
    }, {
        label: 'Colors',
        templateUrl: `${moduleUrl}/partials/editWeather/colors.html`
    }, {
        label: 'Directional Ambient Lighting Colors',
        templateUrl: `${moduleUrl}/partials/editWeather/dalc.html`
    }];

    tabService.buildFunctions($scope);

    // scope functions
    $scope.save = function() {
        $scope.weather.save();
        $scope.$emit('closeModal');
    };

    // event handlers
    $scope.$on('$destroy', $scope.weather.release);
});