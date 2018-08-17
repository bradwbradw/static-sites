const audioContext = new AudioContext();

const sampleLengthSeconds = 3;

const samplesPerChunk = sampleLengthSeconds * audioContext.sampleRate;

function audioNodesViewModel() {

  let Scramples = this;

  let lastGainNode;

  let readibleTime = numSamples => {
    debugger;
    let seconds = numSamples / audioContext.sampleRate;
    let minutes = seconds / 60;
    let remainder = seconds - minutes * 60;
    return `${minutes > 0 ? minutes + ":" : ""}${seconds}`
  };

  Scramples.playSample = (track, fromPosition) => {
    console.log(track, fromPosition);
    if (lastGainNode) {
      lastGainNode.gain.setValueAtTime(0, audioContext.currentTime);
      console.log("muting", audioContext.currentTime, lastGainNode);
    }

    var source = audioContext.createBufferSource();
    let gainNode = audioContext.createGain();
    source.buffer = track.buffer;

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    lastGainNode = gainNode;

    source.start(0, fromPosition / audioContext.sampleRate, sampleLengthSeconds);

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
          return convertToAudioBuffer(file)
            .then(buffer => {
              let sampleCount = _.ceil(buffer.length / samplesPerChunk);
              let sampleIndeces = _.range(0, sampleCount);
              _.each(sampleIndeces, (val, i) => {
                sampleIndeces[i] = val * samplesPerChunk;
              });
              let track = {
                name: file.name,
                buffer: buffer,
                sampleIndeces
              };
              console.log("new track", track);

              tracks.push(track);
            })

        });

    });

    return p

  };

  Scramples.tracks = tracks;

  var convertToAudioBuffer = file => {
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


  };

}

ko.applyBindings(new audioNodesViewModel());
