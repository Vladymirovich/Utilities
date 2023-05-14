const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { Octokit } = require("@octokit/core");
const cron = require('node-cron');

// Set up GitHub credentials
const octokit = new Octokit({
  auth: {
    username: ".......",
    password: "........"
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
  { name: 'Andromeda', ipAddress: '144.76.164.139', port: process.env.PORT_ANDROMEDA, dataPath: '/root/.andromedad/data' },
  { name: 'Cascadia', ipAddress: '144.76.164.139', port: process.env.CASCADIA_PORT, dataPath: '/root/.cascadia/data' },
  { name: 'Defund', ipAddress: '144.76.164.139', port: process.env.DEFUND_PORT, dataPath: '/root/.defund/data' },
  { name: 'Dymension', ipAddress: '144.76.164.139', port: process.env.DYMENSION_PORT, dataPath: '/root/.dymension/data' },
  { name: 'Gitopia', ipAddress: '144.76.164.139', port: process.env.GITOPIA_PORT, dataPath: '/root/.gitopia/data' },
  { name: 'Lava Network', ipAddress: '144.76.164.139', port: process.env.PORT_LAVA, dataPath: '/root/.lava/data' },
  { name: 'Nibiru', ipAddress: '144.76.164.139', port: process.env.NIBIRU_PORT, dataPath: '/root/.nibiru/data' },
  { name: 'Nolus', ipAddress: '144.76.164.139', port: process.env.NOLUS_PORT, dataPath: '/root/.nolus/data' },
  { name: 'Ojo', ipAddress: '144.76.164.139', port: process.env.PORT_OJO, dataPath: '/root/.ojo/data' }
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
  const snapshotCommand = `tar -zcvf ${snapshotFilePath} ${node.dataPath} --exclude=${node.dataPath}/cache`;

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
