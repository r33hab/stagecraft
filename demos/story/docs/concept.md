# Halde 8

Built with the stagecraft skill from `demos/BRIEFS.md`, brief 3.

**Concept.** The camera tells its own story. One object on one stage, and the scroll moves the camera
around it: the year it was made, its turret, its key, the bench, the rebuild, the first roll.

**Carrier.** The Halde 8 itself, rendered live from the provided model in the provided studio light.
It never leaves the screen; each chapter is a new shot of it.

**Direction.** Cinema: a pinned full-screen stage, a footage counter for a timecode (FT 00 to 25),
serif chapter titles in the lower third, mono labels pinned to the parts.

**Signature moment.** Taken apart: the lit camera comes apart in the studio, its 39 parts sliding off
along their own axes, outermost first, and the studio and the parts wipe into an exploded drawing on
paper (the model's creases and outline, the same object), the copy splitting its colour at the edge as
it crosses and numbered labels riding with the parts. Rebuilt puts it back together in the drawing,
then wipes it back to the light. After the last chapter the camera turns round on its stand, the view goes to the
eyepiece, the world darkens like an eyecup and the page opens out of its glass through the viewfinder's frame
lines; the viewfinder leaves with the stage as the specs come up.

**Intake defaults.** Story; a developer maintains it; Cinematic motion; Cinema from the shortlist;
mostly seen on a computer (desktop-first budgets). Stack: Astro, GSAP + ScrollTrigger for the pin
and the scrub, Lenis on fine pointers, three.js in a lazy chunk after the device check.

**Tiers.** High: 2k textures, soft shadows, up to 1.75x pixel ratio. Mid: 1k textures, 1x. Low,
reduced motion and software renderers: no canvas and no pin; six stacked chapters, each over a still
of its shot, same copy.

**Chapters.** 1958, The turret, Wind it, Taken apart, Rebuilt, Rolling; then the specs strip, "Join
the list", and the credits (Halde is fictional; the model and the light are CC0 from Poly Haven).
