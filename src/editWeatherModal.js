ngapp.controller('editWeatherModalController', function($scope, tabService) {
    // initialization
    let node = $scope.modalOptions.nodes.last();
    $scope.handle = node.handle;
    $scope.name = xelib.Name($scope.handle);
    xelib.WithHandle(xelib.GetElementFile($scope.handle), file => {
        $scope.filename = xelib.Name(file);
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
});