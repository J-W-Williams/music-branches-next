# music-branches

Welcome to Music Branches!

For this project I didn't have to look too far around me to find an idea.  In addition to loving programming, I am also a composer and musician.   My desk is covered in sheet music and my phone is full of music ideas.

I'm constantly creating new audio files which I've been keeping track of using Mind Mapping software (FreeMind, which is written in Java).  I also generate a lot of printed material: music transcriptions and charts.  What if I could organize, keep track of, and possibly discover connections within all of this information in a custom app?

This is a MERN application: Mongo, Express, React and Node.  I'm using styled-components for styling, and one package to help with audio recording (see the full technical specs at the end of this document).  I went with a dark theme as it matches the other projects I've done recently.

In my proposal for this project, I outlined the minimum viable product for the app.  Here's what I did to address each of the points in the proposal:

# Features

## Users

The primary use case for this app is for me to organize my music projects.  But even if it's just me for now, I wanted to include a basic user/project structure.  In particular, I do have multiple music projects with different names on the go, so this structure will be immediately useful.  As a proof of concept I went with a simple user1/user2 login screen for now.

For the Projects, each user has their own Project list.  This is stored in Mongo whenever a new element (audio or image) is created, in new fields called 

```
user: userName
project: projectName
```
For simplicity's sake I organized the database as one bucket containing everything; through queries you can get a list of all projects by a certain user, and more specifically all data associated with a specific user/project combo.  

Once in the app, the current user is shown to the right of the header with a logout button.  

On the left of the header is a drop-down of the current user's projects.  This is populated on component load from the Mongo database.  Selecting a project will load the associated data.  This current project is stored in localStorage in case the page is refreshed (the current user is also stored in this way). 

You can add a new project from the header as well.

## Dashboard 
The Dashboard, accessible by clicking on the main "Music Branches" logo, gives a quick overview of:
- the number of audio clips associated with the current user/project
- the number of image files (sheet music) associated with the current user/project

These lists are links to the more detailed Audio clip view and Sheet music viewer pages.

Below the lists is the Tag Cloud.  This shows all of the unique tags across audio and image files.  Once I introduce a larger data set, this is where interesting discoveries might be made: clicking on a tag will display all of the audio / image files that have that tag.  So you never know what connections might be made.

For the audio clips, you have the essential audio controls: play, pause, stop, seek, volume, and download.
For the images, clicking on them lets you see them fullscreen, using a simple modal.

## Audio clip view
This is probably the most detailed Component in the project.  In a flexbox you can see all of the audio files associated with the project.  All of the audio controls are there, as well as a new Component:

The **Tag Manager**.  This component is used both here and in the Sheet Music viewer.  It uses a Child Component, **Tag** to render any tags associated with this audio element.  There is a text field to allow you to update the tag list.  Also, clicking on an individual tag will reveal a little 'x' button that deletes the tag.

I also included four buttons: oldest/newest and longest/shortest so you can sort the data collection in these ways.  At the bottom of each audio clip are three additional buttons: the delete button needs no introduction; for the Transcription and Chart buttons, see the *Stretch Goals* section below.

## Voice recorder with tagging / database entry 
This page is meant to replace my voice recorder app when I have new ideas.  Before recording, you can enter tags, hit record and get your idea down.  Once you click to stop the recording, I opted for an automatic upload:
- The file is uploaded to Cloudinary
- The data returned from this upload is then sent to MongoDB with the additional user/project data fields filled in.
- You also have the option to save the file locally if you want (more backups are always a good idea!)

## Sheet music viewer
On the sheet music page I combined the uploader / display aspects since there is a little less data we're working with compared to the audio page.
At the top you can select a file, add tags, and upload it.  It's stored similarly to the audio files with the file itself going to Cloudinary and the returned data going to MongoDB + user/project information stored.

Click on a piece of sheet music and you'll see it full screen.  As this project evolves I'm envisioning a performance mode to allow me to move away from paper music when performing.

The **Tag Manager** makes another appearance here -- same functionality as in the Audio clip view.  And predictably there's a delete button as well.

## Stretch Goals ###

This addresses the Minimum Viable Product goals for the project.  I had several stretch goals, and I did manage to get to one (or rather two) of them. As I began work on this, I had a feeling that interesting new ideas would emerge once I got things rolling.  And sure enough, I realized that one very useful and accessible feature would be:

### Transcription Mode ###
This mode brings together two of the stretch goals I wrote about in the proposal:
1) Integration of custom music notation software - I create my sheet music and charts using JavaScript / jQuery apps that I wrote (before diving into React here in the course). It would be great to integrate these editors into the project.

2) Other emerging ideas - I know myself, and when I get started and things are rolling, I’m certain that unexpected ideas, some of them even easy to implement, will probably come up. I’d like to keep the door open to inspiration.

In the **Transcription** and **Chart** components, accessible by clicking the buttons at the bottom of individual audio clips, this idea began when I wondered: how complex would it be to integrate two existing tools I'd written in JavaScript / jQuery before getting into React?  I use these tools regularly to generate my sheet music and custom music charts specific to my performance technology.

Some quick research revealed that I could do this relatively quickly, by hosting my two apps on Netlify, and displaying them within an iframe in my React components.  So I have my transcription and charting tools working here as a proof of concept.

## What I would do immediately if/when I have more time

- **Refactor the server**: 
When I launched into this, I should have started with one or more handler file(s). In the sprint to get all of my features working I went with the "It's working, I'll get there" approach.  Now it's later and I'm writing this README.

- **Auth0**: 
I spent an hour or two looking at setting up Auth0 and it all seemed pretty straightforward, but I again opted for pertinent app functionality at this juncture.  It'd be great to get that integrated.

- **Material UI / React Spring**: 
Oh UI and animation libraries... I'll get to you one day!  Speaking of which:

- **Skeleton loaders**: 
The audio clip page takes a while to load via async calls to Mongo and Cloudinary.  Late at night I was looking at creating custom Skeleton Loaders, [as described here](https://morioh.com/a/6d228216a060/skeleton-loading-pages-with-react).


## Technology used
I set up the project with Vite.
It's using 
```
react 18.2.0
react-audio-voice-recorder: 2.1.2
react-router-dom: 6.15.0
styled-components: 6.0.7
```

## Conclusion
I really enjoyed this project and look forward to developing it further.  Thanks for reading my README!


## Update July 2025 ##

Since completing the project in November 2023, I had the opportunity to reopen it in early June 2025 and work on some new features.

### Reviving the project ###
First off, since last working on it, when I started it up again, my Cloudinary account was still up and running, Netlify (where the Transcription and Chart tools are hosted) was also still working fine. I was getting some issues with MongoDB however: my cluster had paused. And actually I needed to upgrade from 8.03 to a more recent version of the database as I couldn't just restart the cluster. I found a workaround involving temporarily creating a paid cluster, transferring data to it, then moving the data back to a new free tier cluster. To simplify things I just created a new cluster and recreated the database structure manually. With that fixed I was able to proceed.

### Auth0 basic integration ###
I took the time to get Auth0 integrated with an eye towards deployment. First I set up basic, app-wide Auth0 authentication and customized the login box a little bit.

### Docker integration ###
I was excited to containerize my application in preparation for deployment. Locally I first set up separate containers for the frontend and the backend, and created a docker-compose.yml file to build and run the containers. Got them building and running nicely locally.

### Deployment to Render ###
Next, I began researching a reliable server with Docker support and a free tier, I chose Render as my deployment platform. First I deployed the backend, adding the .env variables to the Render dashboard, and got it running. To make sure it was working, I temporarily connected my locally-running frontend container to the backend and got that running smoothly. Next came the frontend deployment and configuration to have them communicating nicely. The Render free tier spins down your Web Services after a little while, so that was something to keep in mind while testing. Got it all up and running.

### Auth0 JWT authorization for /api routes ###
Finally, I added JWT authorization for each of the /api routes using a utility that I called authFetch. This allowed for just changing the fetch commands to authFetch throughout the code rather than adding lines to handle the token authorization to each fetch call.

### What's next ###
- I'd like to do a frontend UI pass
- Integrating Selenium/Java testing into the project
- I've seen a few bugs I'd like to fix, for example: the loading spinner doesn't disappear on the Sheet Music screen if there are no sheet music elements for a given user/project combination
- I'd like to make the Auth0 username displayed more user-friendly (right now it displays the unique Auth0 username string).
- And of course get to the rest of the items in the "What I would do immediately if/when I have more time" section!