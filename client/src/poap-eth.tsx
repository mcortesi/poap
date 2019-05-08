// import { Wallet } from 'ethers/wallet';

declare global {
  interface Window {
    ethereum?: {
      isMetamask?: boolean;
      enable(): Promise<string[]>;
    };
  }
}

export function hasMetamask() {
  return typeof (window as any).ethereum !== 'undefined' && window.ethereum!.isMetamask;
}

export async function loginMetamask() {
  const ethereum = window.ethereum!;
  const accounts = await ethereum.enable();
  const account = accounts[0];

  return {
    provider: ethereum,
    account,
  };
}

// const POAP_ADDRESS = '0xBe0B0f08A599F07699E98A9D001084e97b9a900A';

// const PoapABI = [
//   'function tokenURI(uint256 tokenId) view returns (string memory)',
//   'function tokenURI(uint256 tokenId) view returns (string memory)',
// ];
// export function getTokens(address: string) {
//   const provider = getDefaultProvider();
//   const poapContract = new Contract()
