import assert from "node:assert/strict";
import test from "node:test";

import {
  buildEpisodeRedirectLookup,
  resolveLegacyEpisodeRedirect
} from "./catalog.js";

const lookup = buildEpisodeRedirectLookup([
  { number: 12, slug: "12-unleashing-the-power-of-digital-health" },
  { number: 53, slug: "53-engineering-living-tissue-therapeutics" }
]);

test("redirects a legacy episode URL to its canonical page", () => {
  assert.equal(
    resolveLegacyEpisodeRedirect("/episode-53", "", lookup),
    "/episodes/53-engineering-living-tissue-therapeutics"
  );
});

test("accepts a trailing slash and preserves attribution parameters", () => {
  assert.equal(
    resolveLegacyEpisodeRedirect(
      "/episode-12/",
      "?trk=public_post_comment-text",
      lookup
    ),
    "/episodes/12-unleashing-the-power-of-digital-health?trk=public_post_comment-text"
  );
});

test("does not redirect unknown episode numbers or unrelated routes", () => {
  assert.equal(resolveLegacyEpisodeRedirect("/episode-999", "", lookup), null);
  assert.equal(resolveLegacyEpisodeRedirect("/episodes/53", "", lookup), null);
});
