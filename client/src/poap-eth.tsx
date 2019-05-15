import { Signer } from 'ethers/abstract-signer';
import { Web3Provider } from 'ethers/providers';
import { claimToken, PoapEvent, requestProof } from './api';
import { getAddress } from 'ethers/utils';

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      enable(): Promise<string[]>;
      selectedAddress?: string;
    };
  }
}

export function hasMetamask() {
  return typeof (window as any).ethereum !== 'undefined' && window.ethereum!.isMetaMask;
}

export function hasCurrentProvider() {
  return (window as any).web3 && (window as any).web3.currentProvider;
}

export async function loginMetamask() {
  const ethereum = window.ethereum!;
  const accounts = await ethereum.enable();
  const account = getAddress(accounts[0]);

  return {
    provider: ethereum,
    account,
  };
}

export async function getWeb3Provider(): Promise<Web3Provider> {
  if (hasMetamask()) {
    return new Web3Provider((window as any).ethereum);
  } else if (hasCurrentProvider()) {
    return new Web3Provider((window as any).web3.currentProvider);
  } else {
    throw new Error('No Valid web3 provider found');
  }
}

export async function getUserWallet(): Promise<Signer> {
  const provider = await getWeb3Provider();
  const signer = provider.getSigner();
  return signer;
}

// const { userAgent: ua } = navigator;
// const isIOS = ua.includes('iPhone'); // “iPhone OS”
// const isAndroid = ua.includes('Android');

export function hasWeb3(): Promise<boolean> {
  return new Promise(resolve => {
    let aborted = false;
    function checkForWeb3() {
      if (!aborted) {
        const withMetamask = hasMetamask();
        const withCurrentProvider = hasCurrentProvider();
        if (withCurrentProvider || withMetamask) {
          return resolve(true);
        }
        setTimeout(checkForWeb3, 100);
      }
    }
    function abort() {
      aborted = true;
      resolve(false);
    }

    setTimeout(abort, 3000);
    switch (document.readyState) {
      case 'loading':
        document.addEventListener('load', checkForWeb3, false);
        break;
      default:
        checkForWeb3();
    }
  });
}

export function isMetamaskLogged() {
  return window.ethereum!.selectedAddress != null;
}

export async function tryGetAccount(): Promise<null | string> {
  let rawAddress = null;
  if (await hasWeb3()) {
    if (hasMetamask()) {
      const res = await loginMetamask();
      rawAddress = res.account;
    } else {
      const web3 = (window as any).web3;
      const currentProvider = (window as any).web3.currentProvider;
      if ('enable' in currentProvider) {
        rawAddress = (await currentProvider.enable())[0];
      } else if ('eth_accounts' in currentProvider) {
        rawAddress = (await currentProvider.eth_accounts())[0];
      } else if (web3.eth && web3.eth.accounts) {
        rawAddress = web3.eth.accounts[0];
      } else {
        console.error("Don't know how to get accounts");
        throw new Error("Don't know how to get accounts");
      }
    }
  }

  return rawAddress == null ? null : getAddress(rawAddress);
}

export async function tryObtainBadge(event: PoapEvent, claimer: string): Promise<any> {
  const claimProof = await requestProof(event.signer_ip, event.id, claimer);
  const signer = await getUserWallet();

  const claimerMsg = JSON.stringify([
    claimProof.claimId,
    claimProof.eventId,
    claimProof.claimer,
    claimProof.proof,
  ]);
  const claimerSignature = await signer.signMessage(claimerMsg);

  await claimToken({
    ...claimProof,
    claimerSignature,
  });
}
