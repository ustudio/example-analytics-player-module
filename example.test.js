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

    beforeEach(() => {
      config = {
        /* The example player module does not use its configuration but, in a real module, the
         * configuration could be used to pass backend API endpoint URLs and other settings that
         * might change from one destination to another.
         */
        module: 'configuration'
      };

      events = {
        subscribe: jest.fn()
      };

      videos = [
        {id: 'VIDEO-UID'},
        {id: 'OTHER-VIDEO'}
      ];

      require('./example.js');
    });

    it('subscribes to events when initialized', () => {
      window.uStudio.uStudioCore.instance.registerModule.mock.calls[0][0].initialize(
        config, events, videos);

      expect(events.subscribe).toHaveBeenCalledTimes(1);
      expect(events.subscribe).toHaveBeenCalledWith('analytics-event', expect.any(Function));
    });

    describe('when initialized', () => {
      beforeEach(() => {
        window.uStudio.uStudioCore.instance.registerModule.mock.calls[0][0].initialize(
          config, events, videos);
      });

      it('reports consumed when unique "progress" analytics-event is received', () => {
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
        expect(console.log).toHaveBeenCalledWith('CONSUMED', 'VIDEO-UID', 'DESTINATION-UID', 1);
      });

      it('does not report consumed when other analytics-event event is received', () => {
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

      it('does not report consumed when progress is zero', () => {
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

      it('does not report consumed when progress value has already been recorded', () => {
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

      it('reports consumed when progress value is unique', () => {
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
        expect(console.log).toHaveBeenCalledWith('CONSUMED', 'VIDEO-UID', 'DESTINATION-UID', 2);
      });

      it('reports consumed when progress value is unique for different video', () => {
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
        expect(console.log).toHaveBeenCalledWith('CONSUMED', 'OTHER-VIDEO', 'DESTINATION-UID', 1);
      });
    });
  });
});
