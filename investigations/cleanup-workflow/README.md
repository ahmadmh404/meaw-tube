# Clean Up Workflow Investigations

## 1. `full_cleanup` mystery

### Problem

The case of `full_cleanup` happens only once in the `Manual Deletion` of rht video from the `studio/videos/${id}`.

The **thumbnailKey** may take the value of null, and the existing code has an `if` condition for **thumbnailKey** to be able to delete the **uploadthing** file.

After that, I am deleting the video asset frm **Mux** by hitting `https://api.mux.com/video/v1/assets/${deleted.id}`.

So, the question was, is it safe to delete the video if it doesn't have thumbnail ?

### Going about the Issue

After an accurate search on **Google** for `when the event **video.asset.ready** fails, is it going to be available in my app ?`.

And guess what! The answer was no, it's not available because when **Mux**'s `video.asset.ready` event fails it means **Mux** failed encode or decode the uploaded video and there is no playback id which **must** be checked before any deletion, generation.

### Discovery

So, we are free to continue working as if the the deletion and thumbnail and video happens if the thumbnailKey exists.

### Warnings

But, there is somewhat of a chance that some videos fail and still stored inside **Mux** without a thumbnail of watching ability.

Meaning, later we have to setup a cron job to handle deleting filed uploads in **Mux**

### Conclusion

Finally, we can proceed implementing the **cleanup_workflow** inside the app.
