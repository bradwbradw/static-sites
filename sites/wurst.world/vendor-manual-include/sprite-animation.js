/*

https://github.com/tusharghate/angular-simple-sprite

The MIT License (MIT)

Copyright (c) 2015 Tushar Ghate

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 */
(function () {
    angular
        .module('simple-sprite', [])
        .directive('simpleSprite', simpleSprite);

    simpleSprite.$inject = ['$interval', '$window'];

    function simpleSprite($interval, $window) {
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                src: "@",
                frameWidth: "@",
                frameHeight: "@",
                frames: "@",
                framesPerRow: "@",
                repeat: "@",
                speed: "@",
            },

            link: function ($scope, element) {

                var src,
                    frameWidth,
                    frameHeight,
                    windowWidth,
                    frames,
                    framesPerRow = 0,
                    repeat = true,
                    speed = 100,
                    framesSeen = 0,
                    scale = 1,
                    offset = 0;

                // Keeps track of the current x and y positions of the sprite.
                var spritePosition = {
                    'x': 0,
                    'y': 0
                };

                function updateTransforms() {

                    var parentWidth = element.parent()[0].clientWidth;
                    var parentHeight = element.parent()[0].clientHeight;
                    if (parentWidth < frameWidth) {
                        offset = (parentWidth - frameWidth)/2;
                    } else{
                        offset = 0;
                    }

                    var widthDiff = parentWidth - frameWidth;
                    var heightDiff = parentHeight - frameHeight;

                    if(widthDiff < heightDiff){
                        scale = parentWidth / frameWidth;
                    } else {
                        scale = parentHeight / frameHeight;
                    }
                    console.log('parent width', parentWidth, 'frameWidthXscale', frameWidth*scale);
                    console.log("scale",scale, "offset", offset);
                    apply();
                }

                angular.element($window).bind('resize', updateTransforms);

                /**
                 * Initializes the sprite with default CSS styles and options passed in by
                 * the user. Starts the sprite animation.
                 */
                function init() {
                    src = $scope.src;
                    frameWidth = parseInt($scope.frameWidth, 10);
                    frameHeight = parseInt($scope.frameHeight, 10);
                    frames = parseInt($scope.frames, 10);
                    repeat = $scope.repeat === 'true';
                    speed = $scope.speed;
                    framesPerRow = $scope.framesPerRow;


                    element.css({
                        "display": "block",
                        "width": frameWidth + "px",
                        "height": frameHeight + "px",
                        "background": "url(" + src + ") repeat",
//                        "backgroundColor":"lightgreen",
                        "backgroundPosition": "0px 0px"
//                        "background-size":"200%"
                    });

                    updateTransforms();
                    animate();
                }

                var animationInterval = null;


                function apply(){

                    element.css({
                        "background-position": -spritePosition.x + offset + "px" + " " + spritePosition.y + "px",
                        "transform": "scale(" + scale + ")"
                    });

                }
                /**
                 * Animates the sprite.
                 */
                function animate() {
                    /**
                     * Returns whether the sprite animation has completed or not.
                     */
                    function isAnimationComplete() {
                        if (repeat === 'false' || !repeat) {
                            return framesSeen >= frames;
                        } else {
                            return false;
                        }
                    }

                    animationInterval = $interval(function () {

                        // Update the sprite frame
    apply();
                        framesSeen++;
                        // Determine if we should loop the animation, or stop, if the animation is complete
                        if (isAnimationComplete()) {
                            //$window.clearInterval(animationInterval);
                            $interval.cancel(animationInterval);

                        } else {
                            // Increment the X position
                            spritePosition.x += frameWidth;

                            // Check if we should move to the next row
                            if ((framesPerRow === 0 || framesPerRow) && spritePosition.x + frameWidth > frameWidth * framesPerRow) {
                                spritePosition.x = 0;
                                spritePosition.y -= frameHeight;
                            }
                        }
                    }, speed);
                }

                $scope.$on("$destroy", function () {
                    //$window.clearInterval(animationInterval);
                    $interval.cancel(animationInterval);
                });


                init();
            }
        };
    }
})(angular);