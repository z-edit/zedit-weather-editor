ngapp.directive('alphaInput', function() {
    return {
        restrict: 'E',
        scope: {
            color: '='
        },
        template: '<input type="text" ng-model="alphaText" />',
        link: function(scope, element) {
            element[0].title = 'Alpha';

            let thaw = () => {
                if (!scope.freeze) return;
                scope.freeze = false;
                return true;
            };

            scope.$watch('color', function() {
                if (thaw()) return;
                scope.freeze = true;
                scope.alphaText = scope.color.getAlpha();
            });

            scope.$watch('alphaText', function() {
                if (thaw()) return;
                scope.freeze = true;
                try {
                    scope.color.setAlpha(parseFloat(scope.alphaText));
                } catch(x) {}
            });
        }
    }
});