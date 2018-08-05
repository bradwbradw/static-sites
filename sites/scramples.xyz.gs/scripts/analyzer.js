
class Analyzer extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  process(inputs, outputs) {

    let input = inputs[0];
    let output = outputs[0];
    for (let channel = 0; channel < output.length; ++channel) {
      output[channel].set(input[channel]);
    }

    return true;
  }
}

registerProcessor('analyzer', Analyzer);
