# new-vf-calc
Sound Voltex B50 Calculator using Exceed Gear VF by default, with a NABLA VF checkbox.

Exceed Gear truncates chart levels to whole numbers and uses a 1.05 ULTIMATE CHAIN
multiplier. NABLA uses decimal chart levels and a 1.06 ULTIMATE CHAIN multiplier.
Both modes count and display all MAXXIVE CLEAR lamps as EXCESSIVE CLEAR (1.02).
Switching modes immediately recalculates the B50 from all loaded scores.

**Exclude charts added after 3/24/2025** switches to the bundled
`src/assets/20250324_music_db.xml`. Its levels are whole numbers (19 means level 19),
while the current `music_db.xml` stores tenths (197 means level 19.7).
The parser uses the correct scale for each database. With the old database selected,
both VF modes use its whole-number levels; it contains no decimal chart constants.
Changing databases clears results; calculate or upload maps.db again afterward.
Charts missing from the selected database or with no valid level are excluded.
Both XML files are imported by Vite and included by the existing `npm run deploy`.

https://whiteou7.github.io/new-vf-calc/

Supported methods:
- Kamaitachi
- Unnamed SDVX Clone (USC) maps.db
