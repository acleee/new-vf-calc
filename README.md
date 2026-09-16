# new-vf-calc
Sound Voltex B50 Calculator using Exceed Gear VF by default, with a NABLA VF checkbox.

Exceed Gear truncates chart levels to whole numbers and uses a 1.05 ULTIMATE CHAIN
multiplier. NABLA uses decimal chart levels and a 1.06 ULTIMATE CHAIN multiplier.
Both modes count and display all MAXXIVE CLEAR lamps as EXCESSIVE CLEAR (1.02).
Switching modes immediately recalculates the B50 from all loaded scores.

**Exclude charts added after 3/24/2025** filters out entries whose
`info/distribution_date` in the current `music_db.xml` is greater than `20250324`.
The cutoff date itself is included; missing or zero dates remain included.
This date is stored per song in the database and applies to all its charts.
The checkbox immediately recalculates the B50, total VF, and exports for both
Kamaitachi and maps.db, in either VF mode. No alternate XML or deployment changes
are required.

https://whiteou7.github.io/new-vf-calc/

Supported methods:
- Kamaitachi
- Unnamed SDVX Clone (USC) maps.db
