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
