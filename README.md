# BuzzeRp Meter

A lightweight web page to visualize how "BuzzeRp" a Twitter account is using a semicircular gauge.

## What is "BuzzeRp"?

"BuzzeRp" is a person supporting the current Indonesian government, even when the government is in the wrong.

## Current Status

Implemented UI with HTML and CSS. The page includes:

- Gauge meter with a color dial (green → yellow → red)
- Center-aligned needle whose pivot is at the dial center
- Clean hub-less center (no white circle)
- Account input and a "Measure!" button (non-functional placeholder)
- Explanation textarea below the gauge

There is no JavaScript logic yet. The "Measure!" button does not compute or move the needle.

## Quick Start

1. Clone or download this repository.
2. Open `index.html` directly in your browser.

No build step or server is required.

## Files

- `index.html`: Markup for the page, including the gauge structure
- `styles.css`: Styling for layout, gauge dial, needle, and controls
- `README.md`: Project documentation

## Adjusting the Needle

The needle rotation is controlled via a CSS custom property on the needle element in `index.html`.

```html
<div class="gauge-needle" style="--needle-rotation: -90deg"></div>
```

- Range: `-90deg` (left) to `90deg` (right)
- Example: set to `0deg` to point straight up

If/when JavaScript is added, this property can be updated dynamically to reflect a computed score.

## Roadmap

- Add JavaScript to compute a score from the input handle
- Animate the needle motion and dampening
- Persist recent checks and explanations
- Add unit tests for score mapping and UI state

## License

MIT
