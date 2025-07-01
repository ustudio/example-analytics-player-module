# Example Analytics Player Module

This custom player module serves as an example showing how to track completion
within an audio or video player. In this case, "completion" is intended to
represent a percentage of "unique progress percentage points" consumed by the
user. For example, if a user watches the first 3% of a video, then skips to the
end of the video and watches the last 4%, then the module will track that as a
completion percentage of 7%. Re-watching the same points in the video does not
increase the completion value.

The module works with both single video players as well as playlist players.
When used with a playlist player, the module keeps track of the completion
metrics for each video in the playlist, separately. If the user watches part
of the first video in a playlist, then switches to another video in the
playlist before returning to the first video, the module remembers which
progress points were already watched in the first video. Note, however, that
the completion metrics are held in memory and so the module forgets all
completion metrics when the page is closed or refreshed.

For example purposes, the module writes the completion metrics to the console
instead of sending them to a backend service.

The module file, `example.js`, is implemented in plain JavaScript and does not
require any transformation or other pre-processing in order to work on modern
web browsers. It can be uploaded as-is to the uStudio Platform API without any
custom configuration.

Please refer to the
[uStudio API Documentation](https://developer.ustudio.com/player_modules.html)
for further information about managing custom player modules.
