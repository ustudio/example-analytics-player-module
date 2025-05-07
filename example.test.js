describe('AnalyticsExample player module', () => {
  beforeEach(() => {
    window.uStudio = {
      uStudioCore: {
        instance: {
          registerModule: jest.fn()
        }
      }
    };

    jest.spyOn(console, 'log').mockReturnValue();
  });

  afterEach(() => {
    jest.resetModules();
  });

  it('registers itself on load', () => {
    require('./example.js');

    expect(window.uStudio.uStudioCore.instance.registerModule).toHaveBeenCalledTimes(1);
    expect(window.uStudio.uStudioCore.instance.registerModule).toHaveBeenCalledWith({
      name: 'AnalyticsExample',
      initialize: expect.any(Function)
    });
  });

  describe('when registered', () => {
    let config;
    let events;
    let videos;

    beforeEach(() => {
      config = {
        module: 'configuration'
      };

      events = {
        subscribe: jest.fn()
      };

      videos = [
        {id: 'VIDEO-UID', duration: 1000},
        {id: 'OTHER-VIDEO', duration: 300}
      ];

      require('./example.js');
    });

    it('subscribes to events when initialized', () => {
      window.uStudio.uStudioCore.instance.registerModule.mock.calls[0][0].initialize(
        config, events, videos);

      expect(events.subscribe).toHaveBeenCalledTimes(3);
      expect(events.subscribe).toHaveBeenCalledWith('analytics-event', expect.any(Function));
      expect(events.subscribe).toHaveBeenCalledWith('Playlist.videoSelected', expect.any(Function));
      expect(events.subscribe).toHaveBeenCalledWith('Player.durationchange', expect.any(Function));
    });

    describe('when initialized', () => {
      beforeEach(() => {
        window.uStudio.uStudioCore.instance.registerModule.mock.calls[0][0].initialize(
          config, events, videos);
      });

      it('reports consumption when unique "progress" analytics-event is received', () => {
        events.subscribe.mock.calls[0][1]({
          event: 'progress',
          tags: {
            video_uid: 'VIDEO-UID',
            destination_uid: 'DESTINATION-UID',
            other: 'TAGS'
          },
          parameters: {
            progress: 42,
            other: 'PARAMETERS'
          }
        });

        expect(console.log).toHaveBeenCalledTimes(1);
        expect(console.log).toHaveBeenCalledWith(
          'Consumed 1% (10 seconds) of video VIDEO-UID on destination DESTINATION-UID');
      });

      it('reports time consumption based on updated video duration after its duration changes', () => {
        events.subscribe.mock.calls[1][1]({video: {id: 'VIDEO-UID'}});
        events.subscribe.mock.calls[2][1]({duration: 500});

        events.subscribe.mock.calls[0][1]({
          event: 'progress',
          tags: {
            video_uid: 'VIDEO-UID',
            destination_uid: 'DESTINATION-UID',
            other: 'TAGS'
          },
          parameters: {
            progress: 42,
            other: 'PARAMETERS'
          }
        });

        expect(console.log).toHaveBeenCalledTimes(1);
        expect(console.log).toHaveBeenCalledWith(
          'Consumed 1% (5 seconds) of video VIDEO-UID on destination DESTINATION-UID');
      });

      it('does not report consumption when other analytics-event event is received', () => {
        events.subscribe.mock.calls[0][1]({
          event: 'other',
          tags: {
            video_uid: 'VIDEO-UID',
            destination_uid: 'DESTINATION-UID',
            other: 'TAGS'
          },
          parameters: {
            progress: 42,
            other: 'PARAMETERS'
          }
        });

        expect(console.log).not.toHaveBeenCalled();
      });

      it('does not report consumption when progress is zero', () => {
        events.subscribe.mock.calls[0][1]({
          event: 'progress',
          tags: {
            video_uid: 'VIDEO-UID',
            destination_uid: 'DESTINATION-UID',
            other: 'TAGS'
          },
          parameters: {
            progress: 0,
            other: 'PARAMETERS'
          }
        });

        expect(console.log).not.toHaveBeenCalled();
      });

      it('does not report consumption when progress value has already been recorded', () => {
        events.subscribe.mock.calls[0][1]({
          event: 'progress',
          tags: {
            video_uid: 'VIDEO-UID',
            destination_uid: 'DESTINATION-UID',
            other: 'TAGS'
          },
          parameters: {
            progress: 42,
            other: 'PARAMETERS'
          }
        });
        console.log.mockClear();

        events.subscribe.mock.calls[0][1]({
          event: 'progress',
          tags: {
            video_uid: 'VIDEO-UID',
            destination_uid: 'DESTINATION-UID',
            other: 'TAGS'
          },
          parameters: {
            progress: 42,
            other: 'PARAMETERS'
          }
        });

        expect(console.log).not.toHaveBeenCalled();
      });

      it('reports consumption when progress value is unique', () => {
        events.subscribe.mock.calls[0][1]({
          event: 'progress',
          tags: {
            video_uid: 'VIDEO-UID',
            destination_uid: 'DESTINATION-UID',
            other: 'TAGS'
          },
          parameters: {
            progress: 42,
            other: 'PARAMETERS'
          }
        });
        console.log.mockClear();

        events.subscribe.mock.calls[0][1]({
          event: 'progress',
          tags: {
            video_uid: 'VIDEO-UID',
            destination_uid: 'DESTINATION-UID',
            other: 'TAGS'
          },
          parameters: {
            progress: 33,
            other: 'PARAMETERS'
          }
        });

        expect(console.log).toHaveBeenCalledTimes(1);
        expect(console.log).toHaveBeenCalledWith(
          'Consumed 2% (20 seconds) of video VIDEO-UID on destination DESTINATION-UID');
      });

      it('reports consumption when progress value is unique for different video', () => {
        events.subscribe.mock.calls[0][1]({
          event: 'progress',
          tags: {
            video_uid: 'VIDEO-UID',
            destination_uid: 'DESTINATION-UID',
            other: 'TAGS'
          },
          parameters: {
            progress: 42,
            other: 'PARAMETERS'
          }
        });
        console.log.mockClear();

        events.subscribe.mock.calls[0][1]({
          event: 'progress',
          tags: {
            video_uid: 'OTHER-VIDEO',
            destination_uid: 'DESTINATION-UID',
            other: 'TAGS'
          },
          parameters: {
            progress: 42,
            other: 'PARAMETERS'
          }
        });

        expect(console.log).toHaveBeenCalledTimes(1);
        expect(console.log).toHaveBeenCalledWith(
          'Consumed 1% (3 seconds) of video OTHER-VIDEO on destination DESTINATION-UID');
      });
    });
  });
});
