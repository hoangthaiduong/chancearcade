# ChanceArcade

A complete local-first Random + Arcade web app inspired by the provided SpinMaster visual reference.

## Run

Double-click **`index.html`**. No Node.js, npm, server, build step, backend, API key, or account is required.

## Included

- Random Number
- Random Choice
- Random Name with elimination mode
- Shuffle
- Random Color (HEX/RGB/HSL)
- Coin Flip
- Dice D4/D6/D8/D10/D12/D20
- High-quality Random Wheel with exact winner/pointer logic
- Slots
- Dice Gamble
- Coin Gamble
- Risk Wheel
- Card Draw (Higher/Lower, Red/Black, Lucky Card)
- Risk It All
- Local statistics and history
- Real settings for animation/effects/sound/haptic
- Reset Progress with confirmation
- Responsive desktop/tablet/mobile layout

## Storage

All persistence uses browser `localStorage` under the `chancearcade_v1` key.

## Architecture

The project intentionally uses classic `<script>` loading instead of JavaScript modules so essential functionality remains compatible with `file://` execution.

`js/` is split by responsibility: data, state/storage, effects, random utilities, games, UI helpers, and application routing/rendering.

## Visual upgrade + Coin Recovery

This version keeps the original SpinMaster-inspired layout while upgrading:
- polished button gradients, shine/press feedback, card depth and micro-interactions
- upgraded Random result reveal animations and Color preview animation
- ChanceArcade logo + SVG favicon
- persistent **0 Coins recovery**: when the balance reaches exactly 0, a 1-hour countdown starts; if the balance is still 0 when the timer expires, **+100 Virtual Coins** are added automatically. If the user gets Coins again before the timer expires, no +100 is added and the recovery timer is cleared. The countdown is stored in localStorage and survives refreshes.


### Latest interaction update
- Random Number, Choice, and Name now cycle through multiple random candidates before revealing the final result.
- Shuffle now animates several intermediate orders before settling on the final order.
- Coin Flip and Coin Gamble use gold for Heads (ngửa) and gray for Tails (sấp).
- Inner Random/Game pages include a Back button to return to their parent screen.
