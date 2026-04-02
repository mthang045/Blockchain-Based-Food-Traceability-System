import apiClient from './api';

const getEthereumProvider = () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask is not available. Please install MetaMask to sign requests.');
  }

  return window.ethereum;
};

const ensureWalletConnected = async () => {
  const provider = getEthereumProvider();
  const accounts = await provider.request({ method: 'eth_requestAccounts' });

  if (!accounts || accounts.length === 0) {
    throw new Error('No wallet account connected in MetaMask.');
  }

  return accounts[0];
};

export const requestSignatureChallenge = async ({ method, path, walletAddress }) => {
  return await apiClient.post('/products/signature/challenge', {
    method,
    path,
    walletAddress,
  });
};

export const signChallenge = async (challengeMessage) => {
  const provider = getEthereumProvider();
  const account = await ensureWalletConnected();

  const signature = await provider.request({
    method: 'personal_sign',
    params: [challengeMessage, account],
  });

  return {
    signature,
    walletAddress: account,
  };
};

export const buildSignedHeaders = async ({ method, path }) => {
  const walletAddress = await ensureWalletConnected();
  const challengeResponse = await requestSignatureChallenge({ method, path, walletAddress });

  if (!challengeResponse?.success || !challengeResponse?.data) {
    throw new Error(challengeResponse?.message || 'Failed to get signature challenge from server.');
  }

  const { signature, walletAddress: signedWallet } = await signChallenge(challengeResponse.data.message);

  return {
    'x-wallet-address': signedWallet,
    'x-signature': signature,
    'x-signature-timestamp': String(challengeResponse.data.timestamp),
    'x-signature-nonce': challengeResponse.data.nonce,
  };
};

export default {
  requestSignatureChallenge,
  signChallenge,
  buildSignedHeaders,
};
