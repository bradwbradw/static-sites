const audioContext = new AudioContext();

const bindingRateLimit = 300;

function audioNodesViewModel() {

  let Scramples = this;

  let lastGainNode;

  Scramples.sampleLengthString = ko.observable(3);
  Scramples.sampleLengthSeconds = ko.computed(() => {
    return Scramples.sampleLengthString() * 1
  });

  Scramples.roundedSampleLength = ko.computed(() => {
    console.log(Scramples.sampleLengthSeconds());
    return _.round(Scramples.sampleLengthSeconds(), 3);
  });


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
    console.log(offsetSeconds);
    if (Scramples.repeat()) {
      source.loop = true;
      source.loopStart = offsetSeconds;
      let length = Scramples.sampleLengthSeconds();
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


  let idCounter = 1;

  function Track(options) {
    var Track = this;
    _.defaults(options, {
      name: null,
      buffer: null,
      samples: [],
    });
    console.log(options);
    Track.id = idCounter++;
    Track.name = ko.observable(options.name);
    Track.buffer = ko.observable(options.buffer);
    Track.samples = ko.observableArray(options.samples).extend({rateLimit: bindingRateLimit});
    Track.error = ko.observable(null);
    Track.values = ko.pureComputed(() => {
      return {
        id: Track.id,
        name: Track.name(),
        buffer: Track.buffer(),
        samples: Track.samples(),
        error: Track.error()
      }
    });
  }

  audio_file.onchange = function () {
    console.log("reading " + _.size(this.files) + " new files");
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
            name: file.name
          });
          tracks.push(track);
          let index = _.findIndex(tracks(), {id: track.id});
          return convertToAudioBuffer(file)
            .then(buffer => {
              console.log('done converting audio data');
              let sampleCount = _.ceil(buffer.length / Scramples.pcmSamplesPerSample());
              let samples = _.range(0, sampleCount);
              _.each(samples, (val, i) => {
                let sample = new Sample({trackOffset: i * Scramples.pcmSamplesPerSample()});
                tracks()[index].samples.push(sample);
              });

              tracks()[index].buffer(buffer);
            })
            .catch(err => {
              console.log(err);
              tracks()[index].error("error decoding audio");
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
        console.log("1 fetched", file.name);
        return res.arrayBuffer()
      })
      .then(a => audioContext.decodeAudioData(a))


  };

  let db = new Dexie("tracks");
  db.version(1).stores({
    tracks: '',
    preferences: 'preferencesJson'
  });

  // save WIP .. not sure i can save audioBuffers

  Scramples.save = function () {

    return Promise.all(_.map(Scramples.tracks(), track => {

      return db.tracks.put(track.values(), track.id);
    }))
      .then(() => {

        return db.tracks.get(0);

      })
      .then(result => {

        console.log("result", result);
      })
      .catch(error => {

        console.error("tracks save error:", error);
      });


  }

  //load();

  // auto-loading ... wip
  function load() {
    db.tracks.each(t => {

      Scramples.tracks.push(new Track(t));
    })
  }
}

ko.applyBindings(new audioNodesViewModel());
