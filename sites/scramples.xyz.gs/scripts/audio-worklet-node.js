// The code in the main global scope.
//if (_.isFunction(AudioWorkletNode)) {
if (USE_AUDIO_WORKLETS) {

  class MyWorkletNode extends AudioWorkletNode {
    constructor(context) {
      super(context, 'my-worklet-processor');
    }
  }
}
//}
