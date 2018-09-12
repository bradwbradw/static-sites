let AudioContext;

if (_.isFunction(window.AudioContext)) {
  AudioContext = window.AudioContext;

} else if (_.isFunction(webkitAudioContext)) {
  AudioContext = window.webkitAudioContext;
}
const audioContext = new AudioContext;

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

var crop

// misc utilities

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


let enablePersistance = () => {
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
    console.log("no persist available...");
    return Promise.resolve();
  }
};

async function showEstimatedQuota() {
  if (navigator.storage && navigator.storage.estimate) {
    const estimation = await navigator.storage.estimate();
    let percent = _.round(100 * estimation.usage / estimation.quota, 2);

    console.log(`Quota: ${estimation.quota}. Usage: ${estimation.usage}. (%${percent})`);

  } else {
    console.error("StorageManager not found");
  }
}

let db;

function setupDB() {

  db = new Dexie("tracks");
  db.version(1).stores({
    tracks: '',
    preferences: 'preferencesJson'
  });
}


