const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');

// Set up GitHub credentials
const octokit = new Octokit({
  auth: {
    username: 'your-username',
    password: 'your-password',
    token: 'your-token'
  }
});

// Define snapshot directory path
const snapshotDir = path.join(__dirname, 'snapshots');

// Check if snapshot directory exists, create it if it doesn't
if (!fs.existsSync(snapshotDir)) {
  fs.mkdirSync(snapshotDir);
}

// Define nodes to take snapshots of
const nodes = [
  { name: 'Andromeda', ipAddress: '10.0.0.1' },
  { name: 'Cascadia', ipAddress: '10.0.0.2' },
  { name: 'Defund', ipAddress: '10.0.0.3' },
  { name: 'Dymension', ipAddress: '10.0.0.4' },
  { name: 'Gitopia', ipAddress: '10.0.0.5' },
  { name: 'Lava Network', ipAddress: '10.0.0.6' },
  { name: 'Nibiru', ipAddress: '10.0.0.7' },
  { name: 'Nolus', ipAddress: '10.0.0.8' },
  { name: 'Ojo', ipAddress: '10.0.0.9' }
];

// Loop through each node and take a snapshot
nodes.forEach(node => {
  const snapshotFileName = `${node.name}-snapshot-${new Date().toISOString()}.tar.gz`;
  const snapshotFilePath = path.join(snapshotDir, snapshotFileName);

  // Command to take a snapshot of the node
  const snapshotCommand = `tar -zcvf ${snapshotFilePath} /path/to/node/data --exclude=node/data/cache`;

  // Execute snapshot command
  exec(snapshotCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error taking snapshot of ${node.name}: ${error.message}`);
    } else {
      console.log(`Snapshot of ${node.name} taken and saved to ${snapshotFilePath}`);

      // Upload snapshot to GitHub
      const fileContent = fs.readFileSync(snapshotFilePath);

      octokit.repos.createOrUpdateFileContents({
        owner: 'your-github-username',
        repo: 'your-github-repo',
        path: `snapshots/${snapshotFileName}`,
        message: `Add snapshot of ${node.name}`,
        content: fileContent.toString('base64'),
      }).then(() => {
        console.log(`Snapshot of ${node.name} uploaded to GitHub`);
      }).catch((error) => {
        console.error(`Error uploading snapshot of ${node.name} to GitHub: ${error.message}`);
      });
    }
  });
});
