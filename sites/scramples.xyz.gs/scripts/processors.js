// This is "processors.js" file, evaluated in AudioWorkletGlobalScope upon
// audioWorklet.addModule() call in the main global scope.
class MyWorkletProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  process(inputs, outputs, parameters) {
    // The processor may have multiple inputs and outputs. Get the first input and
    // output.
    const input = inputs[0];
    const output = outputs[0];

    // Each input or output may have multiple channels. Get the first channel.
    const inputChannel0 = input[0];
    const outputChannel0 = output[0];

    // Get the parameter value array.
    const myParamValues = false; // parameters.myParam

    // if |myParam| has been a constant value during this render quantum, the
    // length of the array would be 1.

    if (!myParamValues) {

      for (let i = 0; i < input.length; ++i) {

        for (let j = 0; j < input[i].length; ++j) {
          output[i][j] = input[i][j]//inputChannel0[i] * myParamValues[0];
        }
      }
      return true;
    } else if (myParamValues.length === 1) {
      // Simple gain (multiplication) processing over a render quantum
      // (128 samples). This processor only supports the mono channel.
      for (let i = 0; i < inputChannel0.length; ++i) {
        outputChannel0[i] = inputChannel0[i] * myParamValues[0];
      }
    } else {
      for (let i = 0; i < inputChannel0.length; ++i) {
        outputChannel0[i] = inputChannel0[i] * myParamValues[i];
      }
    }

    // To keep this processor alive.
    return true;
  }
}

registerProcessor('my-worklet-processor', MyWorkletProcessor);