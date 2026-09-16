# new-vf-calc
Sound Voltex B50 Calculator using Exceed Gear VF by default, with a NABLA VF checkbox.

Exceed Gear truncates chart levels to whole numbers and uses a 1.05 ULTIMATE CHAIN
multiplier. NABLA uses decimal chart levels and a 1.06 ULTIMATE CHAIN multiplier.
Both modes count and display all MAXXIVE CLEAR lamps as EXCESSIVE CLEAR (1.02).
Switching modes immediately recalculates the B50 from all loaded scores.

To use the **Exclude charts added after 3/24/2025** checkbox, add the historical
database as `src/assets/20250324_music_db.xml`, beside `music_db.xml`.
Unchecked uses the current database; checked uses the historical database.
Changing databases clears results; calculate or upload maps.db again afterward.
Charts absent from the selected database or without a valid level are excluded.

Run `npm run deploy` to publish. The deployment precheck requires both XML files,
and Vite bundles them into `dist/assets` for the existing GitHub Pages deployment.

https://whiteou7.github.io/new-vf-calc/

Supported methods:
- Kamaitachi
- Unnamed SDVX Clone (USC) maps.db
