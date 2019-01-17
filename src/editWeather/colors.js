ngapp.controller('editWeatherColorsController', function($scope) {
    $scope.colorGroups = $scope.weather.getWeatherColors();
});