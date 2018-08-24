
let AudioContext;

if (_.isFunction(window.AudioContext)){
  AudioContext = window.AudioContext;

}  else if (_.isFunction(webkitAudioContext)){
  AudioContext = window.webkitAudioContext;
}
const audioContext = new AudioContext;
const bindingRateLimit = 300;

// webkit's decodeAudioData doesn't return a promise
// https://stackoverflow.com/questions/48597747/how-to-play-a-sound-file-safari-with-web-audio-api

audioContext.decodeAudioDataPromise= (audioData) => {
  return new Promise((resolve, reject) => {

    audioContext.decodeAudioData(
      audioData,
      audioBuffer => {
        resolve(audioBuffer);
      },
      error =>{
        console.error(error);
        reject(error);
      }
    )
  })
};

function ScramplesViewModel() {

  let Scramples = this;

  let lastGainNode;

  Scramples.sampleLengthString = ko.observable("3");
  Scramples.sampleLengthSeconds = ko.computed(() => {
    return Scramples.sampleLengthString() * 1
  });

  Scramples.roundedSampleLength = ko.computed(() => {
    return _.round(Scramples.sampleLengthSeconds(), 3);
  });

  Scramples.quantity = ko.observable("0");

  Scramples.pcmSamplesPerSample = ko.computed(() => {
    return Scramples.sampleLengthSeconds() * audioContext.sampleRate;
  });


  Scramples.repeat = ko.observable(false);

  Scramples.playSample = (track, sample) => {
//    console.log(track, sample);
    if (lastGainNode) {
      lastGainNode.gain.setValueAtTime(0, audioContext.currentTime);
//      console.log("muting", audioContext.currentTime, lastGainNode);
    }

    var source = audioContext.createBufferSource();
    let gainNode = audioContext.createGain();
    source.buffer = track.buffer();

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    lastGainNode = gainNode;

    let offsetSeconds = sample.trackOffset() / audioContext.sampleRate;
    if (Scramples.repeat()) {
      source.loop = true;
      source.loopStart = offsetSeconds;
      source.loopEnd = offsetSeconds + Scramples.sampleLengthSeconds();
      source.start(0, offsetSeconds);
    } else {
      source.start(0, offsetSeconds, Scramples.sampleLengthSeconds());
    }

  };

  let tracks = ko.observableArray([]).extend({rateLimit: bindingRateLimit});

  function Sample(options) {
    _.defaults(options, {
      trackOffset: null
    });
    var Sample = this;
    Sample.trackOffset = ko.observable(options.trackOffset);

    Sample.formattedTime = ko.pureComputed(() => {
      let offset = Sample.trackOffset();
      if (_.isNumber(offset)) {

        let seconds = _.floor(offset / audioContext.sampleRate);
        let minutes = _.floor(seconds / 60);
        let remainder = seconds % 60;
        let secondsFormatted = _.padStart(remainder + '', 2, '0') + "🔊";
        if (minutes > 0) {
          return `${minutes}:${secondsFormatted}`;
        } else {
          return secondsFormatted;
        }
      } else {
        return "...";
      }
    });
  }

  function newId() {
    let alltracks = Scramples.tracks();
    let maxTrack = _.maxBy(alltracks, "id");
    let max = _.get(maxTrack, "id", 0);
    return max + 1;
  }

  function Track(options) {

    var Track = this;
    _.defaults(options, {
      id: options.id ? options.id : newId(),
      name: null,
      buffer: null
    });


    if (!options.buffer && _.get(options, "pcmL")) {
      // initializing from saved PCM data
      // so convert to buffer
      options.buffer = convertPCMToAudioBuffer(options.pcmL, options.pcmR);
      console.log("loaded saved pcm data!", options.buffer);
    }
    let sampleCount = _.ceil(options.buffer.length / Scramples.pcmSamplesPerSample());
    let samples = _.range(0, sampleCount);
    _.each(samples, (val, i) => {
      samples[i] = new Sample({trackOffset: i * Scramples.pcmSamplesPerSample()});
    });

    Track.id = options.id;
    Track.name = ko.observable(options.name);
    Track.buffer = ko.observable(options.buffer);
    Track.samples = ko.observableArray(samples).extend({rateLimit: bindingRateLimit});
    Track.error = ko.observable(null);

    console.log("new track", options);
  }

  file_picker.onchange = function () {
    console.log("reading " + _.size(this.files) + " new files");
    audioContext.resume();
    var files = this.files;
    let p = new Promise((resolve) => {
      resolve();
    });
    _.each(files, (file) => {
      p = p.then(
        () => {
          return convertToAudioBuffer(file)
            .then(buffer => {
              let track = new Track({
                name: file.name,
                buffer: buffer
              });
              tracks.push(track);
            })
            .catch(err => {
              console.log(err);
            })

        });

    });

    return p

  };

  Scramples.tracks = tracks;

  var convertToAudioBuffer = file => {
    let url = URL.createObjectURL(file);
    return fetch(url)
      .then(res => {
        return res.arrayBuffer()
      })
      .then(a => {
        return audioContext.decodeAudioDataPromise(a);
      })

  };

  var convertPCMToAudioBuffer = (leftPCM, rightPCM) => {
    let buffer = audioContext.createBuffer(
      _.size(leftPCM) && _.size(rightPCM) ? 2 : 1, //number of channels
      _.size(leftPCM), // length
      audioContext.sampleRate // sample rate
    );

    let leftBuffer = buffer.getChannelData(0);

    _.each(leftBuffer, (sample, i) => {
      leftBuffer[i] = leftPCM[i];
    });

    if (buffer.numberOfChannels === 2) {
      let rightBuffer = buffer.getChannelData(1);

      _.each(rightBuffer, (sample, i) => {
        rightBuffer[i] = rightPCM[i];
      });
    }

    return buffer;
  };

  let db = new Dexie("tracks");
  db.version(1).stores({
    tracks: '',
    preferences: 'preferencesJson'
  });

  // save WIP .. not sure i can save audioBuffers

  let convertToSaveable = (track) => {

    return {
      id: track.id,
      name: track.name(),
      pcmL: track.buffer() ? track.buffer().getChannelData(0) : null,
      pcmR: track.buffer() ? track.buffer().getChannelData(1) : null,
      error: track.error()
    }
  };
  Scramples.save = function () {

    var lastTrack;
    return Promise.all(_.map(Scramples.tracks(), track => {
      lastTrack = track;
      let toSave = convertToSaveable(track);
      console.log("about to save: ",toSave);
      return db.tracks.put(toSave, track.id);
    }))
      .catch(error => {
        console.error("tracks save error:", error);
        if (_.includes(error.message, "QuotaExceededError")){
          alert(`ran out of local storage.  couldn't save ${lastTrack.name()}`);
        }
      })
  };

  load();

  function load() {
    db.tracks.each(t => {
      console.log("loaded.. about to construct track from ", t);
      Scramples.tracks.push(new Track(t));
    });
  }
}

ko.applyBindings(new ScramplesViewModel());
