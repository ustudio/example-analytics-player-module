(() => {
  function reportConsumed(video_uid, destination_uid, percent) {
    /* In a real player module, this function would make an API request to report the percent
     * content consumed to some backend. For example purposes, we log to the console instead.
     */
    console.log('CONSUMED', video_uid, destination_uid, percent);
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

  /* Player modules must register themselves so that they can be initialized by the player
   * framework.
   */
  window.uStudio.uStudioCore.instance.registerModule({
    name: 'AnalyticsExample',
    initialize: (configuration, events, videos) => {
      // Initialize the unique progress tracking map for all videos in the playlist.
      for (const {id} of videos) {
        uniqueProgressByVideo.set(id, new Set());
      }

      // Player modules should subscribe to relevant player events during initialization.
      events.subscribe('analytics-event', onAnalyticsEvent);
    }
  });
})();
