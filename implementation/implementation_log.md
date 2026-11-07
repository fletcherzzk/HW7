1. First 5 minutes:
   I finished reading the spec, I feel like this is hard to achieve in 2 hours because interacting with different tool can be hard to set up and loading music is also complicated

2. 5-10 minutes: Reading the readme to see what has been completed:
   The readMe is missing some documentation on the code map and priority order. But I will left AI handle this

3. 10-20 minutes: I am trying to see what parts remaining now/
   It seems that I am not able to open my camera and I have fixed this

4. 20- 30 minute:
   I realized this is a highly CV based game.
   So far: 
     1. There is head and hand detection: not very accurate
        # A. It is very easy to get lost track of the hands
        # B. when moving very fast, this is delay
     2. independent falling targets for both hands: this works
     3. a simple auditorium and orchestra scene: this works
     4. the conductor character: 
       # can be improved
     5. a complete playable round with height-based accuracy and final    
        results: this works

5. 30 - 35 minutes :
   I am trying to find a target, now I have 3 candidates listed above, I will take a closer look at the structure to see what I should do.

   I think working on part hands tracking and minimizing delay should be the top priorities. I will try to figure out a path to work on this.  

6. Start working: 
   Since the models are not available to edit, the next key point is to figure out whether the problem comes from CV algorithm or the script for dealing with the data coming back from it.

   From the feedback of codex, I think I might be able to solve this problem, so I will be working on it.


7. Working log:
   I don't think there is problem with CV reliability, CV algorithm is correct.
   I notice that when the hands moves every quickly, it will first show up as not being tracked, and then go to the correct position, I will give this info to codex

   From codex's initial responses and follow up tests.
    1. I don't think waiting for the models' reponses. I don't think they need more than 240ms to respond.
    
   From the second experiment:
   I realized smoothing is not the issue as the problem still exists without smoothing.
   Also, I think that the face recognition is not the problem.
   However, when hands move fast, it actually does fail to detect.

   From the third experiment:
   I confirmed that the problem is with detection and I feel like the confidence score is a always bit too high, which may be the reason for this problem.

   
    


   
