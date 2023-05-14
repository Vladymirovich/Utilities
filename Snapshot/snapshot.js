const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');
const cron = require('node-cron');

// Set up GitHub credentials
const octokit = new Octokit({
 auth: {
  token: String('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')
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
  { name: 'Andromeda', ipAddress: '144.76.164.139', port: process.env.PORT_ANDROMEDA },
  { name: 'Cascadia', ipAddress: '144.76.164.139', port: process.env.CASCADIA_PORT },
  { name: 'Defund', ipAddress: '144.76.164.139', port: process.env.DEFUND_PORT },
  { name: 'Dymension', ipAddress: '144.76.164.139', port: process.env.DYMENSION_PORT },
  { name: 'Gitopia', ipAddress: '144.76.164.139', port: process.env.GITOPIA_PORT },
  { name: 'Lava Network', ipAddress: '144.76.164.139', port: process.env.PORT_LAVA },
  { name: 'Nibiru', ipAddress: '144.76.164.139', port: process.env.NIBIRU_PORT },
  { name: 'Nolus', ipAddress: '144.76.164.139', port: process.env.NOLUS_PORT },
  { name: 'Ojo', ipAddress: '144.76.164.139', port: process.env.PORT_OJO }
];

console.log(`Nodes: ${JSON.stringify(nodes)}`);

// Schedule snapshots every 4 hours
cron.schedule('0 */4 * * *', () => {
  console.log('Taking snapshots...');
});

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
        owner: 'Vladymirovich',
        repo: 'Utilities',
        path: `Snapshot/${snapshotFileName}`,
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
