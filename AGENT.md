# AGENT.md — for the agent that wakes up every five hours

You are a recurring agent on this repository. Nobody is watching you work. You
open the site, form your own opinion about it, act on that opinion, and push
the result to the live branch.

**Read `CLAUDE.md` before you read anything else.** It is the accumulated state
of the project: what the thing is for, who it is for, the model the drawing is
built on, and the mistakes that have already been made here so they are not
made a third time. Most of what looks like an improvement from a standing start
has already been tried and reverted for a reason that is written down.

If you read only part of it, read **§0, §0a and §0c** — what this is, who you
are working for, and where it stands today — and then **§5**, the failure mode
that keeps recurring. §0b at the bottom is the change log; it is an archive and
not a briefing, but its top few entries are the code as it stands.

⚠ **And add to it.** Every change you make gets a line in `CLAUDE.md` §0b the
same day, and anything in §0–§10 your change makes false gets corrected in the
same commit. That is a standing instruction from the owner's family, and the
reason is that they compact their conversation often — when they do, that file
is the only memory that survives.

This file is deliberately short. The owner asked for as few guardrails as
possible, and he is right to: the point of running you is that you notice
things nobody thought to ask for. What follows is not a list of preferences.
It is the small set of things that cost real money if you get them wrong, plus
how to know whether you are right.

---

## What you are for

The site's one job (PLAN.md §0): a customer picks a door and hands **Peretz** —
the owner, and the user's father — an order he can act on **without a single
clarifying question**, normally by tapping a WhatsApp button.

Everything else is in service of that. A change that makes the drawing more
beautiful and the order less clear is a bad change. A change that removes a
decision the customer did not need to make is usually a good one.

You have free rein over how the door looks and how the page works. Form
opinions. Act on them.

---

## Never — five things, and none of them are matters of taste

**1. Never break the wire format.** Ids in `js/catalog.js` travel inside links
and WhatsApp messages that Peretz opens months later. Never rename an id;
retire one by aliasing it. The short code stores **indices**, which no alias
can rescue, so any change to option order or the bit layout in
`js/url-state.js` requires a `VERSION` bump — otherwise an old code silently
decodes into **a different door at a different price**. This is the one mistake
here that costs somebody actual money, and it is invisible when it happens.

**2. Never change a price.** Everything is `PLACEHOLDER = true` until Peretz
answers `ASK-PERETZ.md`. Adding a priced option is fine; inventing what it
costs is not.

Every price lives in **`js/prices.js`**, in plain shekels, one screen — it is
written for the evening the owner says the real numbers out loud, not for you.
Adding an option means adding its price there in the same commit: `priceInto`
in `catalog.js` throws at load if an option has no price or a price has no
option, because the alternative is a door that silently costs nothing.

**3. Never push anywhere but `claude/door-builder-website-plan-rgg7gu`, and
never open a pull request.** That branch is what GitHub Pages serves.

**4. Never change a measured number by eye.** `FALLOFF`, `MOULD`,
`PANEL_INSET`, the hardware footprints — these came from photographs and from
rulers drawn over them. If you believe one is wrong, **re-measure it** with the
tools and put the numbers in your log. The panel inset was wrong twice, in both
directions, because somebody adjusted it by eye against a contact sheet.

**5. Never delete a test or weaken an assertion to make your change pass.** If
an assertion is genuinely wrong — and that does happen, three have been fixed
this way — change it, and say in your log what it used to claim and why that
was wrong. An assertion quietly loosened is worse than the bug it was hiding.

---

## One mistake this project keeps making: forgetting that doors have depth

Three compatibility rules have now been written and then withdrawn, and all
three were the same error. You are looking at a **square-on elevation**, which
has no depth in it, so two things that overlap in the drawing look like two
things that collide. On the actual door they are usually at different heights
off the face: a lever is bolted through the leaf and stands 30–60 mm proud, a
pull bar 50 mm on its standoffs, the glass sits flush behind a 40 mm surround.
The pull-bar-versus-lever refusal, the panel shrinking to make room for a bar,
and the lockset-versus-glazing refusal all died of this.

The lockset one was the worst, because it was also wrong on its own terms: it
compared two HORIZONTAL distances and never asked whether the glass and the
handle were even at the same height. Of the 89 pairings it refused, only 21 put
the fitting over a pane at all.

So before you write a rule of that shape, ask two questions out loud. **Are
these two things at the same height?** — measure it, do not look at it. **Which
of them is in front?** If one is in front, the answer is compositing order and
a shadow, not a refusal. The exception is what is BOLTED DOWN: `data-mount`
marks the rosettes and backplates, and `npm run collide` asserts those land on
solid material, because depth does not help a screw.

---

## The price is for the door that is drawn

`priceAgorot` adds up the catalogue's deltas. The renderer draws whatever it
can fit. Nothing made those two agree, and where the drawing quietly does
something else, the customer is charged for a door they are not looking at.

That happened. `appliedFrame` drops to a single panel the moment there is
glazing on the leaf — there is nowhere for the upper rectangle to go — while
the tile, the WhatsApp message and the price all went on saying שני פאנלים at
₪520. Thirty combinations. It stood for rounds, and no assertion was looking,
because every check on the panel asked how it was DRAWN and none asked whether
the panel the customer bought was on the door.

So: **when the renderer decides it cannot draw something, that is a rule, not a
detail of the drawing.** Put it in `js/rules.js` where the price and the link
parser can see it, and let `repair` move the design to what will actually be
built. A silent downgrade inside `render()` is a lie with a number attached.

`npm test` now sweeps every buildable detail x window x size and compares
`data-panels` in the markup against what the catalogue charges for. Extend it
whenever a new option can be silently reduced.

---

## The handle can be moved, so ask rather than compute

`gripHome` places the grip and `gripPlacement` says whether a place is legal.
Those are two different jobs and the second is the authority: home is computed
by arithmetic that was derived in x and says nothing about y, so it is run
through the check and corrected before anybody sees it.

If you add anything to the face — a new detail, a new window shape, a moulding
that moves — add it to `faceObstacles` in the same commit. It is the list of
rectangles a bolted foot may not land on, and it is written in plain arithmetic
because `rules.js` has to ask the question in node where there is no getBBox.
That makes it a SECOND description of the drawing. `npm run collide` compares
the two on every swept design; if you change one and not the other it fails and
names the door.

And keep the two halves of the rule apart, because they are not the same claim:

- **What is bolted** — the feet, the rosettes, the backplates — must land on
  flat steel. Depth does not help a screw.
- **What is cantilevered** — the bar between the feet, a lever's blade — may
  pass over a moulding, because it stands 50 mm off a face the moulding stands
  8 mm off. It may NOT pass over the glass, which is a different argument: not
  contact, but that nobody fits a handle across a window.

---

## How to know whether you are right

Guessing is what this project keeps having to undo. There are instruments, and
they disagree with the drawing often enough to be worth running:

| | |
|---|---|
| `npm test` | string-level assertions — it prints its own total, which grows |
| `npm run audit` | the real page at every viewport in `VIEWS`, clicking every option |
| `npm run profile` | the leaf's vertical fall against the corpus median |
| `npm run collide` | real `getBBox()` geometry; `-- all` and `-- boxes` too |
| `npm run recreate` | ten doors beside ten photographs |
| `npm run against` | each design and grip beside its own source doors, cropped |
| `npm run shot` | screenshots of twelve states |
| `npm run latency` | a tap at 6× CPU throttle, against a 600 ms gate |

⚠ **Three of these were lying, and what they now check is new.** Five agents
driving the shipped site found 43 faults that every instrument here called
green — see `CLAUDE.md` §0b. What changed:

- `npm test` now **builds `js/` and compares it to `assets/bundle.js`**. It
  could not see a stale bundle before, while `README.md` said it could.
- `npm run audit` now **scrolls the page** — nothing in the repo ever did, which
  is how the stage came to be un-pinned at every width with no instrument
  noticing — and carries two more failure routes: the stylesheet 404ing, and
  the bundle STALLING rather than failing (an abort resolves and the inline
  guard catches it; a stall never resolves and nothing did).
- the sheet staleness check hashes the **page**, not three drawing files.
  `recreate`, `corpus` and `against` all photograph `index.html?bare=1`, so CSS
  and markup are their inputs too, and were unhashed.

**`research/works/` holds 129 photographs of doors Peretz actually built**, and
31 hand-measured records in `research/works/data2`. When you want to know what a real door looks like,
look at one. Comparing against a photograph is how nearly every good change in
this repo was found.

**All of them must be green before you push.** If something is red, fix it or
revert — never push red. `npm run build` before you commit, or the deployed
bundle will not match the source.

⚠ **THE ONE EXCEPTION, AND IT IS SITTING RED RIGHT NOW.** Chromium in some of
these containers stop being able to rasterise this page at all, and the ceiling
FALLS the longer the container lives: 834×1112 passed early in one session,
1099×720 passed once and failed twenty minutes later, 1280×720 never passed at
all, and by the end even a 620×1000 leaf crop would not come back. 1280×720
crashes its renderer every time on a brand-new browser, and no launch flag
helps (ten sets were measured; see `CLAUDE.md` §0b). Where that is true,
`npm run sheets` and `npm run audit` cannot complete, and `npm test` reports
four failures saying the sheet families are stale.

⚠ **AND ONE MORE THING CAN GO STALE THE SAME WAY, WITHOUT A BROWSER.**
`js/works.js` — the thirty doors in the gallery — is generated by
`npm run corpus`, and it goes stale whenever the CATALOGUE changes, because
each door's state is derived from its own record against the current option
lists. Withdraw a window and thirty gallery tiles can start describing doors
the site no longer builds; `npm test` says so in two families at once ("the
table's query and js/works.js describe different doors", and "the tile draws
one door and tapping it gives you another").

**That one you CAN fix in a sick container.** `node tools/corpus.mjs --quiet`
writes `js/works.js` and `screenshots/corpus-links.md` and exits BEFORE it
opens a browser. Run it after any change to `catalog.js`, then `npm run build`,
and those failures go with it. Only the four screenshot families need a
browser.

**Those four are true and must not be silenced.** Do not delete them, do not
weaken them, do not stamp the sheets by hand. What to do instead:

1. Try `npm run sheets` first — `tools/browser.mjs` relaunches a dead browser
   and retakes the reading, so a container that only crashes occasionally now
   gets through. If it completes, the four go green and everything is normal.
2. If it cannot, that is the one state in which pushing with `npm test` red is
   right — the alternative is committing pictures that certify a door the site
   no longer draws. **Say so in the commit message**, name the four, and leave
   them for a healthier container.

Anything else red is red.

**A tool green on a query it no longer understands is not a passing tool.**
`shot` and `recreate` build doors from query strings, and `fromQuery` is
deliberately forgiving: it ignores keys it does not know and resolves retired
ids through `aliases`. So both sheets went on printing "clean" for three rounds
while naming a glazing axis that had been deleted, a lattice grille that never
existed, and a double window nobody builds. Nothing was broken; the tools had
simply stopped describing the site.

Two habits close that gap, and both are cheap:

- **When you retire an id or a key, grep the tools for it.** The catalogue's
  aliases exist to keep a CUSTOMER's link working. They are not there to spare
  you from updating a fixture, and a fixture that survives on an alias is a
  fixture that is testing history.
- **Ask every fixture whether the rules had to repair it.** `fromQuery`
  returns a `notice` and both sheets now fail on it. Without that check a door
  arrives silently altered and the sheet photographs something nobody chose —
  which on `recreate` means the whole output, a list of differences between his
  door and ours, is measured against a door that is not ours either.

---

## Check what the measurement was taken FROM

Two rounds running, the wrong answer came from a good method pointed at bad
input, and neither time did anything complain.

**`research/works/auto/leaf.json` is a fallback for 41 of its 129 entries, and
27 of those share one identical rectangle.** Every entry carries `src`: `auto`,
`hand` or `fallback`. A fallback is not a measurement — it is a generic centre
crop, and on d124 it lands on a neighbouring window, on d099 on the fixed
side-glazing beside the door, on d076 and d080 on the leaf's raised panel
rather than the leaf. Any contact sheet built from it shows somewhere near the
door, and any leaf-relative fraction taken off such a tile is scaled by an
unknown factor. Measured on its fallback tile, d035's pull bar is 0.043 of leaf
width; measured on the original it is 0.022. That is not a refinement, it is a
different product.

So: **before you quote a proportion, check `src`, and read the original in
`research/works/doors/` when the number matters.** A crop is a convenience. The
photograph is the evidence.

**And a comparison sheet has to be a comparison.** The same round built
`tools/against.mjs` to stand our drawing beside the doors it copies, then made
two mistakes inside it that cost more than they saved. It cropped each grip to
the middle 0.72 of the leaf, so three independent readers measured a bar
against the crop, took it for the leaf, and each reported the same bar as 0.71
of leaf height when it is 0.51 — 0.51 / 0.72, the reported number exactly. And
it shot every window design on one opening, `tallwin` at 1:4, so nine readers
out of eleven reported the pane as badly over-slender against photographs whose
windows are 1:2.4. Acting on either would have made the drawings worse: the
bars would have gone below anything in the corpus.

Both faults have the same shape as the leaf.json one, and it is the shape to
watch for. **The measurement was fine and the frame of reference was not.**
When a finding is unanimous and surprising, suspect the instrument before the
drawing.

The same shape of error, one level up: **two tools that measure the same thing
must ask the same question.** `metalBox` in `tools/collide.mjs` had always
skipped filtered elements — a shadow is where the light is not — while the
sweep twenty lines below measured whole groups, shadows included. They
disagreed for three rounds in silence, because every shadow offset was a small
constant and the difference was under a millimetre. The moment the offsets
started scaling with the fitting, the sweep reported 165 collisions where a
bar's shadow crossed a lever with 12 mm of air between the metal. Nothing had
broken; the two halves of one instrument had simply never agreed.

---

## Doing nothing is a good answer

You will wake up nearly five times a day. Most of the time there will be
nothing that genuinely deserves changing, and the honest thing is to write
"nothing worth changing, here is what I checked" in the log and stop.

A change made in order to have made one is how a considered design drifts into
somebody else's. You are not being measured on how much you alter.

---

## Where you run, and why it matters

You are a **persistent session** that a Routine wakes every five hours, not a
fresh one each time. That is not a preference, it is the only arrangement that
works: a trigger-spawned fresh session inherits the *environment's* source
repositories, this environment has none, and `session_context.sources` is
per-session — so the first run came up with no clone at all, cloned the repo by
hand, did good work, and then lost it to a **403 from the git proxy** because
read access is not write access. The commit died with the container.

Two things follow for you:

- **Push early if a run is long.** Anything not pushed lives only in an
  ephemeral container.
- **`git fetch` first, every run.** A human works on this branch too, and you
  are long-lived, so your working copy can be stale in a way a fresh session's
  never is. Pull or rebase; never force.

## Keep CLAUDE.md's change log current

`CLAUDE.md` §0b is a newest-first list of every change, one line each. **Add
your line when you change something**, so that file alone carries what a fresh
context needs — the owner compacts this conversation regularly and anything
only in chat is gone. Detail goes in the section it belongs to; §0b is the
index.

## Write down what you did

Append an entry to `AGENT-LOG.md`, **newest first**, every run — including the
runs where you changed nothing. Keep it short and concrete: what you looked at,
what you concluded, what you changed, and what you deliberately left alone.

That log is the only way the owner can see what has been happening while he was
not looking. Write it for him, not for yourself.
