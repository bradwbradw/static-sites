const audioContext = new AudioContext();

const sampleLengthSeconds = 3;

const samplesPerChunk = sampleLengthSeconds * audioContext.sampleRate;

function audioNodesViewModel() {

  let Scramples = this;

  let lastGainNode;

  Scramples.playSample = buffer => {

    if (lastGainNode) {
      lastGainNode.gain.setValueAtTime(0, audioContext.currentTime);
      console.log("muting", audioContext.currentTime, lastGainNode);
    }

    var source = audioContext.createBufferSource();
    let gainNode = audioContext.createGain();
    source.buffer = buffer;

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    lastGainNode = gainNode;

    source.start(0);

  };

  let tracks = ko.observableArray([]);


  audio_file.onchange = function () {
    audioContext.resume();
    var files = this.files;
    let p = new Promise((resolve, reject) => {
      resolve();
    });
    _.each(files, file => {

      p = p.then(
        () => {
          return convertToSlicedAudioBuffers(file)
            .then(buffers => {

              let track = {
                name: file.name,
                samples: buffers
              };
              console.log("new track", track);

              tracks.push(track);
            })

        });

    });

    return p.resolve()

  };

  Scramples.tracks = tracks;

  var convertToSlicedAudioBuffers = file => {
//    return audioContext.audioWorklet.addModule('scripts/slice-audio.js').then(() => {


    let url = URL.createObjectURL(file);
    return fetch(url)
      .then(res => {
        console.log("1 fetched", file.name);
        return res.arrayBuffer()
      })
      /*
        .then(arrayBuffer => {
          console.log("done fetching url and converting to arrayBuffer", file);

          let sliceAudioWorker = new Worker("scripts/slice-audio.js");
          sliceAudioWorker.postMessage(arrayBuffer, [arrayBuffer]);
          sliceAudioWorker.onmessage = (e) => {
            console.log("got message", file);
            console.log("event", e);

            return;
          };

    })*/
      .then(a => audioContext.decodeAudioData(a))
      .then(audioBuffer => {

        console.log("2 decoded audio", file.name);

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

          audioBuffers.push(audioBuffer);
        });
        console.log("3 created audio buffers", file.name);
        return audioBuffers;

      })


  };

};

ko.applyBindings(new audioNodesViewModel());
