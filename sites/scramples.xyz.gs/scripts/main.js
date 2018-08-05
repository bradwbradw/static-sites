worklet.addModule('scripts/analyzer.js').then(() => {
  let oscillator = new OscillatorNode(context);
  let analyzer = new AudioWorkletNode(context, 'analyzer');
  oscillator.connect(analyzer).connect(context.destination);
  oscillator.start();
});