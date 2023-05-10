const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');
const cron = require('node-cron');

// Set up GitHub credentials
const octokit = new Octokit({
  auth: {
    token: 'your-token'
  }
});

// Define nodes to export addrbook from
const nodes = [
  { name: 'Andromeda', rpcUrl: 'http://10.0.0.1:26657' },
  { name: 'Cascadia', rpcUrl: 'http://10.0.0.2:26657' },
  { name: 'Defund', rpcUrl: 'http://10.0.0.3:26657' },
  // Add more nodes here...
];

// Define addrbook directory path
const addrbookDir = path.join(__dirname, 'addrbooks');

// Check if addrbook directory exists, create it if it doesn't
if (!fs.existsSync(addrbookDir)) {
  fs.mkdirSync(addrbookDir);
}

// Schedule addrbook export and upload every 4 hours
cron.schedule('0 */4 * * *', () => {
  console.log('Exporting and uploading addrbooks...');
  
// Export addrbook for each node and upload to GitHub
nodes.forEach(node => {
  const addrbookFileName = `${node.name}-addrbook-${new Date().toISOString()}.json`;
  const addrbookFilePath = path.join(addrbookDir, addrbookFileName);

  // HTTP request to export addrbook
  fetch(`${node.rpcUrl}/dump_consensus_state`, { method: 'POST' })
    .then(response => response.json())
    .then(data => {
      fs.writeFileSync(addrbookFilePath, JSON.stringify(data.result.consensus_state.addr_book, null, 2));

      // Upload addrbook to GitHub
      const fileContent = fs.readFileSync(addrbookFilePath);

      octokit.repos.createOrUpdateFileContents({
        owner: 'Vladymirovich',
        repo: 'Utilities',
        path: `Addrbook/${addrbookFileName}`,
        message: `Add addrbook of ${node.name}`,
        content: fileContent.toString('base64'),
      }).then(() => {
        console.log(`Addrbook of ${node.name} uploaded to GitHub`);
      }).catch((error) => {
        console.error(`Error uploading addrbook of ${node.name} to GitHub: ${error.message}`);
      });
    }).catch((error) => {
      console.error(`Error exporting addrbook of ${node.name}: ${error.message}`);
    });
});
});

