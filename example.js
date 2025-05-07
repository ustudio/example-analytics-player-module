(() => {
  const videoDurations = new Map();

  function reportConsumed(video_uid, destination_uid, percent) {
    const seconds = videoDurations.get(video_uid) * percent / 100;
    /* In a real player module, this function would make an API request to report the percent
     * content consumed to some backend. For example purposes, we log to the console instead.
     */
    console.log(
      `Consumed ${percent}% (${seconds} seconds) of video ${video_uid} on`
      + ` destination ${destination_uid}`);
  }

  const uniqueProgressByVideo = new Map();

  function onAnalyticsEvent({event, tags, parameters}) {
    const {video_uid, destination_uid} = tags;
    const {progress} = parameters;

    if (event !== 'progress' || progress === 0) {
      // Ignore non-progress events and 0% progress events.
      return;
    }

    const uniqueProgress = uniqueProgressByVideo.get(video_uid);

    if (uniqueProgress.has(progress)) {
      /* Ignore progress percentages that have already been consumed to avoid double reporting when
       * users seek back or replay content.
       */
      return;
    }

    uniqueProgress.add(progress);

    // Report the total content consumed to the backend.
    reportConsumed(video_uid, destination_uid, uniqueProgress.size);
  }

  let currentVideo;

  function onVideoSelected({video}) {
    // The player sends this event whenever the selected video changes.
    currentVideo = video.id;
  }

  function onDurationChange({duration}) {
    // The player sends this event after it calculates a more precise video duration.
    videoDurations.set(currentVideo, duration);
  }

  /* Player modules must register themselves so that they can be initialized by the player
   * framework.
   */
  window.uStudio.uStudioCore.instance.registerModule({
    name: 'AnalyticsExample',
    initialize: (configuration, events, videos) => {
      for (const {id, duration} of videos) {
        uniqueProgressByVideo.set(id, new Set());
        videoDurations.set(id, duration);
      }

      // Player modules should subscribe to relevant player events during initialization.
      events.subscribe('analytics-event', onAnalyticsEvent);
      events.subscribe('Playlist.videoSelected', onVideoSelected);
      events.subscribe('Player.durationchange', onDurationChange);
    }
  });
})();
