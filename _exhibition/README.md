# Exhibition Mode — local review

Feature branch: `feature/desktop-exhibition-mode`. Nothing has been pushed, merged or deployed.

## Preview

Build with the existing GitHub Pages dependencies (`bundle install`, then `bundle exec jekyll build`). Serve `_site` locally and open `http://localhost:4000/exhibition/` in a desktop browser at least 1024 CSS pixels wide, with a fine primary pointer and hover support. The current review server listens only on this computer's loopback interface.

The standard homepage stays the homepage. Its new discreet Exhibition Mode link appears only on eligible desktop devices. Preferences are remembered but never automatically redirect the standard homepage. Exit saves standard mode. Mobile, iPad/tablets, coarse-pointer and narrow-window visits to the exhibition return to the standard homepage. Touch-enabled Windows laptops with a fine primary pointer remain eligible.

## Review controls

Move the pointer to reveal the collection. Tab through the six links to illuminate them and reveal their labels. Sources opens a native dialog with trapped focus, Escape closes it and restores focus. Sound is off initially, explicitly enabled, and faded to 23% over two seconds; switching off fades for 1.5 seconds before suspension. The original seamless track is decoded once and looped with Web Audio. A remembered sound preference requires an explicit resume gesture on a later visit. Standard-page navigation fades audio over 160 ms before navigating; modified clicks retain ordinary browser behavior.

## Calibration

- `assets/js/exhibition-config.js`: beam/hotspot radius in pixels, incandescent Kelvin tint, ambient visibility, smoothing time in milliseconds, light depth, shadow enable/intensity/softness, and audio fades/volume.
- `_data/exhibition.yml`: six exact destinations, original filenames, museum credits, and per-object depth, softness and maximum displacement.
- `assets/css/exhibition.css`: object positions/scales and typography. Each image retains its original proportions and transparent margins.
- `assets/exhibition/wall.webp`: the supplied PDF wall, rendered in its original landscape orientation and composition. `wall.png` preserves the lossless rendered source. The PDF contains only the wall; no text or artifacts are baked into the texture.

Ambient visibility is 40%, following the revised user reference. Object shadows use 92% opacity, a closer simulated light, and reduced softness; heading and label text have no shadows. A single full-scene radial darkness overlay reveals the wall, lettering and original-color artifacts. Separate alpha silhouettes cast clamped shadows behind the objects. Pointer rendering uses requestAnimationFrame; geometry is cached and refreshed on ResizeObserver/resize/scroll/font completion. Reduced motion removes smoothing and atmospheric transitions and makes all destinations permanently legible. No global framework or rendering dependency is added.

## Assets and licensing

All original `explore-*.png` files are preserved unchanged. Browsers receive derived transparent WebP copies (about 633 KB total), with PNG fallbacks. No artifact is cropped, distorted or recolored. All exhibition typography uses Instrument Sans from Google Fonts (SIL Open Font License); standard-site typography is untouched.

Museum collection records were checked on 19 October 2026. Each states Public Domain. The exact source associations and verified collection titles appear in the source dialog and `_data/exhibition.yml`:

- Home: https://www.metmuseum.org/art/collection/search/544453
- Explore: https://www.metmuseum.org/art/collection/search/325089
- Articles: https://www.metmuseum.org/art/collection/search/477499
- Objects: https://www.metmuseum.org/art/collection/search/315802
- Kids: https://www.metmuseum.org/art/collection/search/252890
- About: https://www.metmuseum.org/art/collection/search/313626

Awestruck by isaiah658: https://opengameart.org/content/awestruck . The source identifies the recording as CC0 and a seamless loop. `awestruck.wav` is the original 48 kHz stereo PCM recording, about 55.38 seconds; musical content is unmodified. It loads only after a sound gesture.

## Future investigation

`featured_investigation.enabled` is false. No unpublished Marco Polo content appears in Exhibition Mode. `_includes/exhibition-featured.html` is a separate insertion point requiring an enabled flag, a published article path and approved banner media together. Full future banner artwork, animation and immersive section pages are intentionally unimplemented. All six links currently use standard destinations; `exhibition_path` is reserved metadata and is not activated.

## Scope

Only Exhibition Mode and its desktop entry are changed. Corrections.rtf and the replacement About text are deferred by the user's explicit instruction. The existing homepage already has its own Marco Polo coming-soon teaser; it is unchanged. Local build files and review notes are excluded from the published output by Jekyll's underscore-directory convention and .gitignore.

## Validation record

- GitHub Pages/Jekyll 3.10 build passed with the repository's existing Gemfile.
- Chrome: initial darkness, scene-wide revelation, image loading, keyboard illumination, sources/Escape/focus restoration, audio toggles with no runtime errors, Articles navigation, Exit and persisted standard preference.
- Safari: shared lighting and texture, six navigation links, audio playback confirmed by the browser audio indicator, sound-off and source dialog.
- Layout checked at 1202 × 729 and 1024 × 600; the compact laptop view has no document scrolling. A 390 × 844 view redirects to the standard site and hides its exhibition entry.
- Eligibility assertions covered ordinary desktop, touch Windows laptop, iPad, Android tablet, mobile and unsuitable pointer/viewport. Built output checks confirmed all six destinations, inactive featured content, asset presence and byte-for-byte preservation of source PNGs.
- Firefox could not be tested: a fresh official Firefox download requires accepting Mozilla's Terms of Use before browsing. No terms were accepted.
- Reduced-motion rendering is implemented; no operating-system accessibility preference was changed during testing.

The supplied wall texture replaces the provisional texture. The flashlight now uses a slightly yellower 2900 K tint with a stronger, restrained warm overlay. Final aesthetic calibration remains subject to user review. Nothing has been deployed.

## October 19 interaction revision

- Narrow desktop windows no longer reveal every navigation label. Below 681px, objects alternate down a scrolling wall with room for handwritten notes; full desktop retains four objects above two.
- Notes use The Met's exact object titles and recorded dates, with summarized geography/culture. For the Greek stele, the overview provides no findspot; the label says so rather than inventing one. Original records remain linked in Sources.
- Notes reveal letters in a handwritten Caveat face. Placement scores available positions against object and heading bounds. Keyboard focus also reveals notes; Escape dismisses; reduced motion shows complete text immediately.
- The optional writing sound is original synthesized, band-limited noise, played only while Sound On is active. No added sound recording/license dependency.
- A persistent same-origin page frame keeps the same Web Audio context alive during internal navigation, while standard pages retain their own scripts, styles, forms and scrolling. Browser URLs/history track selected pages. Modified clicks, downloads and external links retain native navigation behavior.
- The sound control stays fixed at bottom right throughout the exhibition browsing session. On a full reload or a new tab, browsers may require selecting Resume; external sites cannot retain this site's soundtrack.
- Validated exhibition → Articles → article → exhibition; browser Back; bottom-right control persistence; 600px compact layout; no browser console errors; Jekyll build and whitespace checks pass.

## Resumed wayfinding revision

Permanent handwritten page names and curved arrows sit inside the scene, below the flashlight darkness layer. Hover/focus shows the exact navigation destination beside the object and animated museum information in a side writing space beside the central heading. Compact layouts retain pencil arrows and use the opposite writing margin. Home, Explore, Articles, Objects and About are enlarged; Kids moves inward; landing-page Exit and Sound flank Articles. No hover enlargement. Verified all six destination strings, compact arrow visibility and no horizontal overflow, browser console, build, and whitespace checks.

## Annotation and control cleanup

Removed the clipped top rail and styled the independent controls as small rounded boxes. Arrowheads use a compact open V. Unrevealed handwritten glyphs stay fully transparent to eliminate premature specks. Notes search the side margins against sampled opaque image silhouettes with a clearance margin; navigation prompts use the visible silhouette rather than PNG padding. The wall uses overflow:clip so keyboard focus cannot pan oversized objects internally. Objects moved upward with its indicator; About and Explore enlarged. All six notes reported zero silhouette collisions at 1440×900; compact 600px check showed zero collision and no horizontal overflow. Build and browser error checks pass.

## Launch behavior

A fresh desktop homepage visit plays the existing intro and then opens /exhibition/. Standard destinations and Exit leave Exhibition Mode, stop music/writing audio, and mark the current tab's visit as standard, preventing a homepage redirect loop. The regular site does not load the audio module or show a sound button. Phones/tablets retain the existing homepage flow. Re-entering via Exhibition Mode clears the standard-visit flag. Browser sound requires an explicit gesture. The former cross-page audio frame is removed.

## Launch transition and soundtrack optimization

The desktop entry path hides standard homepage content before first paint and throughout the intro fade, preventing a homepage flash before the exhibition redirect. An optimized 128 kbps AAC file (about 874 KB versus 10 MB WAV) preloads and decodes with OfflineAudioContext while the exhibition is open. Real-time playback still requires a visitor gesture; the original WAV remains the compatibility fallback. Verified predecode readiness before selecting Sound On, immediate playback with an empty preparation status, no console errors, and automatic intro completion into the exhibition.

## Single-document intro transition

The root desktop entry now redirects before homepage paint, and the existing intro is included inside the exhibition document. Its fade reveals the exhibition wall in the same document, eliminating the post-intro navigation handoff. Standard exit visits and mobile/tablet entry retain their previous behavior. The sound control stays hidden while the intro plays, and the optimized soundtrack prepares behind it.
