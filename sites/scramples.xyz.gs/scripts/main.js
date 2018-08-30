let AudioContext;

if (_.isFunction(window.AudioContext)) {
  AudioContext = window.AudioContext;

} else if (_.isFunction(webkitAudioContext)) {
  AudioContext = window.webkitAudioContext;
}
const audioContext = new AudioContext;
const bindingRateLimit = 50;

// webkit's decodeAudioData doesn't return a promise
// https://stackoverflow.com/questions/48597747/how-to-play-a-sound-file-safari-with-web-audio-api

audioContext.decodeAudioDataPromise = (audioData) => {
  return new Promise((resolve, reject) => {

    audioContext.decodeAudioData(
      audioData,
      audioBuffer => {
        resolve(audioBuffer);
      },
      error => {
        console.error(error);
        reject(error);
      }
    )
  })
};

function ScramplesViewModel() {

  let Scramples = this;

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
  Scramples.playingSample = ko.pureComputed(()=>{
    // ... return Scramples.tracks().filter()
  });

  let tracks = ko.observableArray([]).extend({rateLimit: bindingRateLimit});

  function Sample(options) {
    _.defaults(options, {
      trackOffset: null
    });

    var sample = {
      playing: ko.pureComputed(() => {
        return sample.source() != null
      }),
      track: options.track,
      source: ko.observable(null),
      play: () => {
        console.log("play ", sample);
        let track = sample.track;

        /*
        if (lastGainNode) {
          lastGainNode.gain.setValueAtTime(0, audioContext.currentTime);
        }
    */
        if (false && lastSample && lastSample.source()) {

          if (lastSample == sample) {
            console.log('same sample found');
            doPlay(lastSample);
            return;
            // seek to 0 insead of call stop()
          }
          lastSample.source().stop()
//      lastSample.gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        }


        sample.source(audioContext.createBufferSource());
        sample.gainNode = audioContext.createGain();
        sample.source().buffer = track.buffer();

        sample.source().connect(sample.gainNode);
        sample.gainNode.connect(audioContext.destination);
        // lastGainNode = gainNode;

        lastSample = sample;

        doPlay(sample);

        function doPlay(sample) {

          let offsetSeconds = sample.trackOffset() / audioContext.sampleRate;
          let source = sample.source();
          if (Scramples.repeat()) {
            source.loop = true;
            source.loopStart = offsetSeconds;
            source.loopEnd = offsetSeconds + Scramples.sampleLengthSeconds();
            source.start(0, offsetSeconds);
          } else {
            source.start(0, offsetSeconds, Scramples.sampleLengthSeconds());
          }
        }

        sample.source().onended = event => {

          console.log('ended!', event);
          sample.source(null);
        }

      },
      trackOffset: ko.observable(options.trackOffset),
      formattedTime: ko.pureComputed(() => {
        let offset = sample.trackOffset();
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
      })
    };

    _.extend(this, sample);
  }

  function newId() {
    let alltracks = Scramples.tracks();
    let maxTrack = _.maxBy(alltracks, "id");
    let max = _.get(maxTrack, "id", 0);
    return max + 1;
  }

  function Track(options) {

    _.defaults(options, {
      id: options.id ? options.id : newId(),
      name: null,
      buffer: null
    });


    if (!options.buffer && _.get(options, "pcmL")) {
      // initializing from saved PCM data
      // so convert to buffer
      options.buffer = convertPCMToAudioBuffer(options.pcmL, options.pcmR);
//      console.log("loaded saved pcm data!", options.buffer);
    }

    let sampleCount = _.ceil(options.buffer.length / Scramples.pcmSamplesPerSample());
    let samples = _.range(0, sampleCount);
    _.each(samples, (val, i) => {
      samples[i] = new Sample({
        trackOffset: i * Scramples.pcmSamplesPerSample(),
        track: this
      });
    });
    var Track = {

      id: options.id,
      name: ko.observable(options.name),
      buffer: ko.observable(options.buffer),
      error: ko.observable(null),
      samples: ko.observableArray(samples).extend({rateLimit: bindingRateLimit}),
      deleteTrack: function () {
        let track = this;

        db.tracks.delete(track.id);
        tracks.remove(track);

        // TODO remove from db too
//      Tracks.remove(self)
      }
    };


    console.log("new track", options);

    _.extend(this, Track);
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
    let buffer = track.buffer();
    return {
      id: track.id,
      name: track.name(),
      pcmL: buffer.getChannelData(0),
      pcmR: buffer.numberOfChannels > 1 ? track.buffer().getChannelData(1) : null,
      error: track.error()
    }
  };

  var lastTrackSaved;

  let makeTrackSaveFn = track => {
    return () => {

      lastTrackSaved = track;
      let toSave = convertToSaveable(track);
//      console.log("about to save: ", toSave);
      return db.tracks.put(toSave, track.id)
        .then((r) => {
//          console.log("should be saved now");
          return r;
        })
        .catch(error => {
          return Promise.reject(error);
        })


    }
  };

  Scramples.saving = ko.observable(false);
  Scramples.save = function () {
    Scramples.saving(true);
    enablePersistance().then(()=>{
    chainPromises(_.map(Scramples.tracks(), makeTrackSaveFn))
      .then(() => {
        Scramples.saving(false);
      })
      .catch((error) => {
        console.warn("tracks save error:", error);
        if (_.includes(error.message, "QuotaExceededError")) {
          alert(`storage usage quota exceeded while saving "${lastTrackSaved.name()}".  Won't try to save any more tracks`);

        } else {
          alert(`error [${error.name}] \n Trying to save ${lastTrackSaved.name()}\n more details:\n${error.message}`);
        }
        Scramples.saving(false);
      })
    });


  };

  load();

  enablePersistance = ()=> {
//    promptToInstall();
    if (_.isFunction(_.get(navigator, 'storage.persist'))) {
      return navigator.storage.persist()
        .then(isPersisted => {

          if (isPersisted) {
            console.log(":) Storage is successfully persisted.");
            showEstimatedQuota()
          } else {
            console.log(":( Storage is not persisted.");
//            console.log("Trying to persist..:");
            /* if (await persist()
           )
             {
               console.log(":) We successfully turned the storage to be persisted.");
             }
           else
             {
               console.log(":( Failed to make storage persisted");
             }*/
          }
        })
        .catch(err => {
          console.warn("could not persist storage: ", err);
        })

    } else {
      console.log("no persist available...")
      return Promise.resolve();
    }
  };

  async function showEstimatedQuota() {
    if (navigator.storage && navigator.storage.estimate) {
      const estimation = await navigator.storage.estimate();
      console.log(`Quota: ${estimation.quota}`);
      console.log(`Usage: ${estimation.usage}`);
    } else {
      console.error("StorageManager not found");
    }
  }


  function load() {
    db.tracks.each(t => {
//      console.log("loaded.. about to construct track from ", t);
      Scramples.tracks.push(new Track(t));
    });
  }

  function chainPromises(promises, rejectionOkay) {
    let p = Promise.resolve();
    _.each(promises, promise => {
      if (rejectionOkay) {
        p = p.then(promise)
          .catch(err => {
            console.error("error:", err);
            return new Promise(resolve => resolve());
          });
      } else {
        p = p.then(promise);
      }
    });
    return p;
  }
}

ko.applyBindings(new ScramplesViewModel());
