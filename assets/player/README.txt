HOW TO EDIT THE PLAYER'S ANIMATIONS
====================================

Every picture of the player in the game is one of the 48 PNG files in
this folder. There is no code involved in changing how the player
looks — just edit these images directly in any image editor
(Photoshop, GIMP, Krita, paint.net, even MS Paint if it supports
transparency) and save over the same file. Refresh the game in your
browser and your new art appears automatically.

FILE NAMING
-----------
Each file is named:   <action>_<direction>.png

Actions (6):  idle, walk, run, jump, fall, attack
Directions (8): N, NE, E, SE, S, SW, W, NW

Example: "attack_SE.png" is the picture shown when the player is
slashing while facing bottom-right.

HOW THESE ARE USED IN-GAME
---------------------------
- idle       -> shown when standing still, facing the last direction moved
- walk / run -> alternate back and forth while moving, to create a
                2-frame walk cycle (so both need to look like a
                natural mid-stride pair)
- jump / fall-> alternate back and forth while dashing (used for the
                dash animation's lunge/blur look)
- attack     -> shown briefly whenever the player slashes an enemy

RULES TO KEEP THINGS LOOKING RIGHT
-----------------------------------
1. Keep the background transparent (alpha channel). Any non-transparent
   background will show up as a solid box around the character in-game.
2. Keep the character roughly centered horizontally and standing on the
   bottom edge of the image (that's how the game lines the character up
   with its position on the ground). If you add extra empty space at the
   bottom, the character will look like it's floating.
3. You can resize a frame or change its proportions freely — the game
   scales every frame to the same in-game height automatically, so it
   doesn't need to be pixel-exact to the original.
4. Don't rename the files. The game looks for these exact 48 filenames
   every time it loads.

That's it — no JavaScript, no build step. Swap the pictures, refresh
the page, done.
