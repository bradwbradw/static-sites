/*class SliceAudio extends AudioWorkletProcessor {
  constructor() {
    super();

    this.port.onmessage = (event) => {
      console.log("ready to slice (from worker)", event);
      slice(evt.data)
        .then((result) => {

          postMessage(result);
        })
    };
  }


//postMessage('Worker running');


}*/
let audioContext = new window.AudioContext();

function slice(audioContext, arrayBuffer) {

  audioContext.decodeAudioData(arrayBuffer)
    .then(audioBuffer => {

      const leftChannel = audioBuffer.getChannelData(0);
      const rightChannel = audioBuffer.getChannelData(1);

      let leftChunks = _.chunk(leftChannel, samplesPerChunk);
      let rightChunks = _.chunk(rightChannel, samplesPerChunk);

      let audioBuffers = [];
      _.each(leftChunks, (chunk, i) => {

        let leftChanPCMData = leftChunks[i];
        let rightChanPCMData = rightChunks[i];

        var audioBuffer = audioContext.createBuffer(2, leftChanPCMData.length, audioContext.sampleRate);

        _.each([0, 1], channel => {
          // This gives us the actual array that contains the data
          var channelPCM = audioBuffer.getChannelData(channel);
          _.each(channelPCM, (sample, i) => {
            channelPCM[i] = channel === 0 ? leftChanPCMData[i] : rightChanPCMData[i];
          });
        });

        audioBuffers.push(audioBuffer)
      });
      return audioBuffers;

    })

}