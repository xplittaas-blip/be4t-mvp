# Fan Status & Web3 Integration

- [x] Update `fallbackSongs.json` via python script to use new Tier thresholds: 100, 500, 2500 tokens
- [x] Create `FanStatusPanel.jsx` component matching the requested design, using `calcAmount` + `userBalance` to show preview states
- [x] Refactor `SongDetail.jsx` right column to use `sticky top-8` layout (leveraged existing `.calculator-section` sticky rules)
- [x] Move Fan Status into the right column, below the Calculator and above the Invest button
- [x] Implement Thirdweb `prepareContractCall` and `useSendTransaction` logic in `SongDetail.jsx` for the `invest` button (Approve + Invest sequential)
- [x] Build and verify on demo mode
