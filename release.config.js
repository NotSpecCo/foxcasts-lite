module.exports = {
  branches: ['main', 'cicd'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    [
      '@semantic-release/exec',
      {
        publishCmd: 'zip -r Foxcasts_Lite_v${nextRelease.version}.zip build/*',
      },
    ],
    [
      '@semantic-release/github',
      {
        successComment: false,
        failComment: false,
        assets: [
          {
            path: 'Foxcasts_Lite_v${nextRelease.version}.zip',
            label: 'packaged file',
          },
        ],
      },
    ],
    '@semantic-release/git',
  ],
};
