const bindingRateLimit = 50;


function ScramplesViewModel() {

  let Scramples = this;
  Scramples.chosenView = ko.observable('Tracks');
  Scramples.chooseView = (view) => {
    Scramples.chosenView(view)
  };
  Scramples.sampleLengthString = ko.observable("3");
  Scramples.sampleLengthSeconds = ko.computed(() => {
    return Scramples.sampleLengthString() * 1
  });
  Scramples.pcmSamplesPerSample = ko.computed(() => {
    return Scramples.sampleLengthSeconds() * audioContext.sampleRate;
  });
  Scramples.repeat = ko.observable(false);
  Scramples.playingSamples = ko.observableArray([]);
  Scramples.tracks = ko.observableArray([]).extend({rateLimit: bindingRateLimit});
  Scramples.keyboardShortcuts = ko.observable({});
  Scramples.focussed = ko.observable(false);


  function Sample(options) {
    _.defaults(options, {
      trackOffset: null
    });

    var sample = {
      restarting: false,
      track: options.track,
      source: ko.observable(null),
      bookmark: () => {
        if (sample.bookmarked()) {

        } else {
          Scramples.bookmarkedSamples.push(sample)
        }
      },
      bookmarked: ko.pureComputed(() => {
        return _.isObject(_.find(Scramples.bookmarkedSamples(), sample));
      }),
      stop: () => {
        if (sample.playing()) {
          sample.source().stop()
        }
      },
      playing: ko.observable(null),
      play: () => {

        Scramples.focussed(sample);
        Scramples.stopAll(sample);

        var makePlayPromise = () => {
          return new Promise((resolve) => {

            let track = sample.track;
            sample.source(audioContext.createBufferSource());
            sample.gainNode = audioContext.createGain();
            sample.source().buffer = track.buffer();

            sample.source().connect(sample.gainNode);
            sample.gainNode.connect(audioContext.destination);

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

            source.onended = resolve;
          });
        };

        if (sample.playing()) {
          sample.playing()
            .then(sample.play);
          sample.stop();
        } else {
          Scramples.playingSamples.push(sample);
          sample.playing(makePlayPromise());
          sample.playing()
            .then(() => {
              sample.playing(null);
              Scramples.playingSamples.remove(sample);
            })
        }
      },
      trackOffset: ko.observable(options.trackOffset),
      formattedTime: ko.pureComputed(() => {
        let offset = sample.trackOffset();
        if (_.isNumber(offset)) {

          let seconds = _.floor(offset / audioContext.sampleRate);
          let minutes = _.floor(seconds / 60);
          let remainder = seconds % 60;
          let secondsFormatted = _.padStart(remainder + '', 2, '0');
          return `${minutes}:${secondsFormatted}`;

        } else {
          return "...";
        }
      }),
      keyboardShortcut: ko.pureComputed(() => {
        var foundKey;
        _.each(Scramples.keyboardShortcuts(), (sampleToPlay, key) => {
          if (sampleToPlay == sample) {
            foundKey = key;
          }
        });
        return foundKey;
      }).extend({notify: 'always'})

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
        Scramples.tracks.remove(track);

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
              Scramples.tracks.push(track);
            })
            .catch(err => {
              console.log(err);
            })

        });

    });

    return p

  };

  _.extend(Scramples, {
    onKeyPress: key => {
      let sampleToPlay = _.get(Scramples.keyboardShortcuts(), key);
      if (_.isFunction(_.get(sampleToPlay, 'play'))) {
        sampleToPlay.play();
      } else if (Scramples.focussed() && !Scramples.focussed().keyboardShortcut()) {
        let newKeyboardShortcuts = _.set(Scramples.keyboardShortcuts(), key, Scramples.focussed());
        Scramples.keyboardShortcuts(newKeyboardShortcuts);
      }
    },
    onShiftKeyPress: key => {
      if (Scramples.focussed()) {
        let newKeyboardShortcuts = _.set(Scramples.keyboardShortcuts(), key, Scramples.focussed());
        Scramples.keyboardShortcuts(newKeyboardShortcuts);
      }
    },
    stopAll: otherThanSample => {

      _.each(Scramples.playingSamples(), s => {
        if (s !== otherThanSample) {
          s.stop();
        }
      });
    },
    clearScrambled: () => {
      Scramples.scrambledSamples.removeAll();
    },
    showScrambled: ko.pureComputed(() => {
      return _.size(Scramples.scrambledSamples()) > 0;
    }),
    scramble: () => {
      Scramples.scrambledSamples.removeAll();
      _.each(Scramples.tracks(), track => {
        Scramples.scrambledSamples(_.concat(Scramples.scrambledSamples(), track.samples()));
      });
      Scramples.scrambledSamples(_.shuffle(Scramples.scrambledSamples()));
    }
  });

  Scramples.scrambledSamples = ko.observableArray([]);
  Scramples.bookmarkedSamples = ko.observableArray([]);

  Scramples.saving = ko.observable(false);

  var lastTrackSaved;


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


  Scramples.save = function () {

    let makeTrackSaveFn = track => {
      return () => {

        lastTrackSaved = track;
        let toSave = convertToSaveable(track);
//      console.log("about to save: ", toSave);
        return db.tracks.put(toSave, track.id)
          .catch(error => {
            return Promise.reject(error);
          })

      }
    };

    Scramples.saving(true);
    setupDB();
    enablePersistance()
      .then(() => {

        //TODO: check to see if each track exists before trying to save (to prevent quotaExceeded)
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

  function load() {
    setupDB();
    db.tracks.each(t => {
//      console.log("loaded.. about to construct track from ", t);
      Scramples.tracks.push(new Track(t));
    });
  }

  load();

  _.each('abcdefghijklmnopqrstuvwxyz', (key) => {
    hotkeys(key, (event, handler) => {
      Scramples.onKeyPress(handler.key);
    });
    hotkeys('shift+' + key, (event, handler) => {
      Scramples.onShiftKeyPress(_.last(_.split(handler.key, '+')));
    });
  });

}

ko.applyBindings(new ScramplesViewModel());

