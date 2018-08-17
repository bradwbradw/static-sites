const audioContext = new AudioContext();

const sampleLengthSeconds = 3;

const samplesPerChunk = sampleLengthSeconds * audioContext.sampleRate;

function audioNodesViewModel() {

  let Scramples = this;

  let lastGainNode;


  Scramples.playSample = (track, sample) => {
    console.log(track, sample);
    if (lastGainNode) {
      lastGainNode.gain.setValueAtTime(0, audioContext.currentTime);
      console.log("muting", audioContext.currentTime, lastGainNode);
    }

    var source = audioContext.createBufferSource();
    let gainNode = audioContext.createGain();
    source.buffer = track.buffer();

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    lastGainNode = gainNode;

    source.start(0, sample.trackOffset() / audioContext.sampleRate, sampleLengthSeconds);

  };

  let tracks = ko.observableArray([]);

  function Sample(options) {
    _.defaults(options, {
      trackOffset: null
    });
    var Sample = this;
    Sample.trackOffset = ko.observable(options.trackOffset);

    Sample.formattedTime = ko.computed(() => {
      let offset = Sample.trackOffset();
      if (_.isNumber(offset)){

        let seconds = _.floor(offset / audioContext.sampleRate);
        let minutes = _.floor(seconds / 60);
        let remainder = seconds % 60;
        let secondsFormatted = _.padStart(remainder+'', 2, '0') + "🔊";
        if (minutes > 0){
          return `${minutes}:${secondsFormatted}`;
        } else {
          return secondsFormatted;
        }
      } else {
        return "...";
      }
    });
  }

  function Track(options) {
    var Track = this;
    _.defaults(options, {
      name: null,
      buffer: null,
      samples: []
    });
    Track.name = ko.observable(options.name);
    Track.buffer = ko.observable(options.buffer);
    Track.samples = ko.observableArray(options.samples)
  }

  audio_file.onchange = function () {
    console.log("reading " + _.size(this.files) + " new files")
    audioContext.resume();
    var files = this.files;
    let p = new Promise((resolve, reject) => {
      resolve();
    });
    _.each(files, (file, index) => {
      console.log("converting to audio buffer...", file);
      p = p.then(
        () => {
          let track = new Track({
            name:file.name
          });
          tracks.push(track);
          return convertToAudioBuffer(file)
            .then(buffer => {
              let sampleCount = _.ceil(buffer.length / samplesPerChunk);
              let samples = _.range(0, sampleCount);
              _.each(samples, (val, i) => {
                let sample = new Sample({trackOffset: i * samplesPerChunk});
                tracks()[index].samples.push(sample);
              });

              tracks()[index].buffer(buffer);
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
