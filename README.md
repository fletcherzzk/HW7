# in implementation folder, there are just dummy code, the changes are in HW7-main folder


1. The player can activate the camera. If access is denied or the camera is unavailable, the game displays a clear message
 # Requirement met

2. When the head and both hands are visible, the game identifies the left and right hands separately and displays an indicator for each : 
# Requirement met.

3. Raising or lowering a hand relative to the head raises or lowers the corresponding hand of the character. Each hand can move independently.
# Requirement partially met under static conditions

4. The player can select a local MP3 file and start a round using that audio. The round lasts for the duration of the song. Custom song loading is part of the full intended game.

5. During the song, points fall from the top toward marked landing positions at different heights. The left and right hands have separate, clearly labeled target sequences. Target timing is generated from the loaded music's rhythm. 
# Partially met,there are sequence, which works, but I haven't  checked whether the sequence mets the rhythm.

6. At a point's scheduled arrival time, the game compares its target height with the correct hand's height. If the hand is within the visible acceptable zone, the game records a hit and increases the score. Each target can award points only once. Otherwise, it records a miss.
# Met 


7. When the song ends, the game displays the score and the number of hits and misses. The player can restart the round or choose another song. 
# Met

8. If a hand is no longer detected, the game displays a warning and does not treat the tracking loss as a valid movement that earns points.
# Met 

9. Increasing the difficulty narrows the acceptable height zone. A hand position outside the displayed zone is a miss, even if it would have been accepted at an easier setting.
# Not sure, I have not check this


10. The game shows a concert auditorium with the orchestra in front of the conductor. The target lanes and hand indicators remain readable over the scene.
# Partially met, the designs and pictures of the scene can be made much better


11. Reaching the configured consecutive-miss threshold triggers an audible audience boo once for that streak. A successful hit resets the streak and allows a later streak to trigger another boo.
# Not Met, because I did not have time to work on that.

# Note: I have been focusing on the core tracking feature, which takes a lot of time, so I am not able to finish the ones that are not met.
