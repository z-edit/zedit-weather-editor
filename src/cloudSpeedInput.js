ngapp.directive('cloudSpeedInput', function() {
    return {
        restrict: 'E',
        scope: {
            speed: '='
        },
        template: '<input type="text" ng-model="speedText" />',
        link: function(scope, element) {
            let inputElement = element[0].firstElementChild,
                skip = false;

            let notFocused = function() {
                return document.activeElement !== inputElement;
            };

            let onWheel = function(e) {
                if (e.deltaY === 0 || notFocused()) return;
                e.preventDefault();
                let offset = e.deltaY < 0 ? 1 : -1;
                try {
                    let f = parseFloat(scope.speedText) * 200 + offset;
                    f = Math.max(Math.min(f, 200), -200);
                    scope.$applyAsync(() => {
                        scope.speedText = (Math.round(f) / 200.0).toFixed(3);
                    });
                } catch (x) {}
            };

            element[0].addEventListener('wheel', onWheel);

            scope.$watch('speed', function() {
                if (skip) return skip = false;
                scope.speedText = scope.speed.toFixed(3);
            });

            scope.$watch('speedText', function() {
                try {
                    scope.speed = parseFloat(scope.speedText);
                    skip = true;
                } catch(x) {}
            });

            scope.$on('$destroy', function() {
                element[0].removeEventListener('wheel', onWheel);
            })
        }
    }
});