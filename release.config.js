module.exports = {
  branches: ['main', 'cicd'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    [
      '@semantic-release/exec',
      {
        publishCmd: 'zip -r Foxcasts_Lite.zip build/*',
      },
    ],
    [
      '@semantic-release/github',
      {
        successComment: false,
        failComment: false,
        assets: [
          {
            path: 'Foxcasts_Lite.zip',
            label: 'Foxcasts Lite',
          },
        ],
      },
    ],
    // '@semantic-release/git',
  ],
};
