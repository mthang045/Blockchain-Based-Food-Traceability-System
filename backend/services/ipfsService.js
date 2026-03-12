/**
 * IPFS Service - Upload files to IPFS using Pinata
 * Pinata provides a simple API for pinning files to IPFS
 */

const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

/**
 * Upload file buffer to IPFS via Pinata
 * @param {Buffer} fileBuffer - File buffer to upload
 * @param {string} fileName - Original filename
 * @param {Object} metadata - Optional metadata for the file
 * @returns {Promise<Object>} Object containing IPFS hash and details
 */
const uploadToIPFS = async (fileBuffer, fileName, metadata = {}) => {
  try {
    // Validate environment variables
    if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_API_KEY) {
      throw new Error('Pinata API credentials not configured in .env file');
    }

    // Validate input
    if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
      throw new Error('File buffer is required and must be a valid Buffer');
    }

    if (!fileName) {
      throw new Error('File name is required');
    }

    console.log('📤 Uploading file to IPFS via Pinata...');
    console.log('   File name:', fileName);
    console.log('   File size:', (fileBuffer.length / 1024).toFixed(2), 'KB');

    // Create form data
    const formData = new FormData();
    formData.append('file', fileBuffer, {
      filename: fileName,
      contentType: getContentType(fileName)
    });

    // Add metadata if provided
    const pinataMetadata = {
      name: fileName,
      keyvalues: {
        uploadedAt: new Date().toISOString(),
        ...metadata
      }
    };
    formData.append('pinataMetadata', JSON.stringify(pinataMetadata));

    // Pinata options (optional)
    const pinataOptions = {
      cidVersion: 1 // Use CIDv1 for better compatibility
    };
    formData.append('pinataOptions', JSON.stringify(pinataOptions));

    // Upload to Pinata
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          'pinata_api_key': process.env.PINATA_API_KEY,
          'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY
        }
      }
    );

    const ipfsHash = response.data.IpfsHash;
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

    console.log('✅ File uploaded to IPFS successfully');
    console.log('   IPFS Hash (CID):', ipfsHash);
    console.log('   IPFS URL:', ipfsUrl);

    return {
      success: true,
      ipfsHash: ipfsHash,
      ipfsUrl: ipfsUrl,
      fileName: fileName,
      fileSize: fileBuffer.length,
      timestamp: response.data.Timestamp,
      pinSize: response.data.PinSize,
      metadata: pinataMetadata
    };

  } catch (error) {
    console.error('❌ Error uploading to IPFS:', error.message);

    // Handle specific Pinata errors
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        throw new Error('Invalid Pinata API credentials. Check your API keys.');
      } else if (status === 403) {
        throw new Error('Pinata API access forbidden. Check your account limits.');
      } else if (status === 429) {
        throw new Error('Pinata rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`Pinata API error: ${data.error || error.message}`);
      }
    }

    throw new Error(`Failed to upload file to IPFS: ${error.message}`);
  }
};

/**
 * Upload JSON data to IPFS via Pinata
 * Useful for storing product metadata
 * @param {Object} jsonData - JSON object to upload
 * @param {string} name - Name for the JSON file
 * @returns {Promise<Object>} Object containing IPFS hash
 */
const uploadJSONToIPFS = async (jsonData, name = 'data.json') => {
  try {
    if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_API_KEY) {
      throw new Error('Pinata API credentials not configured');
    }

    console.log('📤 Uploading JSON to IPFS via Pinata...');
    console.log('   Name:', name);

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      {
        pinataContent: jsonData,
        pinataMetadata: {
          name: name,
          keyvalues: {
            uploadedAt: new Date().toISOString()
          }
        },
        pinataOptions: {
          cidVersion: 1
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': process.env.PINATA_API_KEY,
          'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY
        }
      }
    );

    const ipfsHash = response.data.IpfsHash;
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

    console.log('✅ JSON uploaded to IPFS successfully');
    console.log('   IPFS Hash (CID):', ipfsHash);

    return {
      success: true,
      ipfsHash: ipfsHash,
      ipfsUrl: ipfsUrl,
      timestamp: response.data.Timestamp
    };

  } catch (error) {
    console.error('❌ Error uploading JSON to IPFS:', error.message);
    throw new Error(`Failed to upload JSON to IPFS: ${error.message}`);
  }
};

/**
 * Retrieve file from IPFS via Pinata gateway
 * @param {string} ipfsHash - IPFS hash (CID) of the file
 * @returns {Promise<Buffer>} File buffer
 */
const retrieveFromIPFS = async (ipfsHash) => {
  try {
    if (!ipfsHash) {
      throw new Error('IPFS hash is required');
    }

    console.log('📥 Retrieving file from IPFS...');
    console.log('   IPFS Hash:', ipfsHash);

    const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000 // 30 seconds timeout
    });

    console.log('✅ File retrieved from IPFS successfully');
    console.log('   Size:', (response.data.length / 1024).toFixed(2), 'KB');

    return Buffer.from(response.data);

  } catch (error) {
    console.error('❌ Error retrieving from IPFS:', error.message);
    throw new Error(`Failed to retrieve file from IPFS: ${error.message}`);
  }
};

/**
 * Check if file is pinned on Pinata
 * @param {string} ipfsHash - IPFS hash to check
 * @returns {Promise<Object>} Pin status information
 */
const checkPinStatus = async (ipfsHash) => {
  try {
    if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_API_KEY) {
      throw new Error('Pinata API credentials not configured');
    }

    const response = await axios.get(
      `https://api.pinata.cloud/data/pinList?hashContains=${ipfsHash}`,
      {
        headers: {
          'pinata_api_key': process.env.PINATA_API_KEY,
          'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY
        }
      }
    );

    const isPinned = response.data.count > 0;

    if (isPinned) {
      const pinInfo = response.data.rows[0];
      return {
        success: true,
        isPinned: true,
        ipfsHash: pinInfo.ipfs_pin_hash,
        name: pinInfo.metadata?.name,
        size: pinInfo.size,
        timestamp: pinInfo.date_pinned
      };
    } else {
      return {
        success: true,
        isPinned: false,
        message: 'File not found or not pinned'
      };
    }

  } catch (error) {
    console.error('❌ Error checking pin status:', error.message);
    throw new Error(`Failed to check pin status: ${error.message}`);
  }
};

/**
 * Unpin file from Pinata (delete)
 * @param {string} ipfsHash - IPFS hash to unpin
 * @returns {Promise<Object>} Unpin result
 */
const unpinFromIPFS = async (ipfsHash) => {
  try {
    if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_API_KEY) {
      throw new Error('Pinata API credentials not configured');
    }

    console.log('🗑️  Unpinning file from Pinata...');
    console.log('   IPFS Hash:', ipfsHash);

    await axios.delete(
      `https://api.pinata.cloud/pinning/unpin/${ipfsHash}`,
      {
        headers: {
          'pinata_api_key': process.env.PINATA_API_KEY,
          'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY
        }
      }
    );

    console.log('✅ File unpinned successfully');

    return {
      success: true,
      message: 'File unpinned from IPFS',
      ipfsHash: ipfsHash
    };

  } catch (error) {
    console.error('❌ Error unpinning from IPFS:', error.message);
    throw new Error(`Failed to unpin file from IPFS: ${error.message}`);
  }
};

/**
 * Get content type based on file extension
 * @param {string} fileName - File name with extension
 * @returns {string} Content type
 */
const getContentType = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  const contentTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'pdf': 'application/pdf',
    'json': 'application/json',
    'txt': 'text/plain'
  };
  return contentTypes[extension] || 'application/octet-stream';
};

/**
 * Test Pinata connection
 * @returns {Promise<Object>} Connection test result
 */
const testPinataConnection = async () => {
  try {
    if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_API_KEY) {
      return {
        success: false,
        message: 'Pinata API credentials not configured in .env file'
      };
    }

    console.log('🔍 Testing Pinata connection...');

    const response = await axios.get(
      'https://api.pinata.cloud/data/testAuthentication',
      {
        headers: {
          'pinata_api_key': process.env.PINATA_API_KEY,
          'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY
        }
      }
    );

    console.log('✅ Pinata connection successful');
    console.log('   Message:', response.data.message);

    return {
      success: true,
      message: response.data.message,
      authenticated: true
    };

  } catch (error) {
    console.error('❌ Pinata connection failed:', error.message);
    return {
      success: false,
      message: 'Failed to connect to Pinata',
      error: error.message
    };
  }
};

module.exports = {
  uploadToIPFS,
  uploadJSONToIPFS,
  retrieveFromIPFS,
  checkPinStatus,
  unpinFromIPFS,
  testPinataConnection
};
