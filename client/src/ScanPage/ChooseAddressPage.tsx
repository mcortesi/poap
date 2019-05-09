import React, { useState } from 'react';
import { loginMetamask } from '../poap-eth';
import { useToggleState } from '../react-helpers';
import { resolveENS } from '../api';
import { getAddress } from 'ethers/utils';

type ChooseAddressPageProps = {
  onAccountDetails: (account: string) => void;
};
export const ChooseAddressPage: React.FC<ChooseAddressPageProps> = ({ onAccountDetails }) => {
  const [enterByHand, toggleEnterByHand] = useToggleState(false);
  return (
    <main id="site-main" role="main" className="app-content">
      <div className="container">
        <div className="content-event" data-aos="fade-up" data-aos-delay="300">
          <p>
            The <span>Proof of attendance protocol</span> (POAP) reminds you off the{' '}
            <span>cool places</span> you’ve been to.
          </p>
          {enterByHand ? (
            <AddressInput onAddress={onAccountDetails} />
          ) : (
            <>
              <p>Your browser is Web3 enabled</p>
              <LoginButton onAddress={onAccountDetails} />
              <p>
                or{' '}
                <a
                  href="/"
                  onClick={e => {
                    e.preventDefault();
                    toggleEnterByHand();
                  }}
                >
                  enter on address by hand
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

type LoginButtonProps = {
  onAddress: (account: string, provider: any) => void;
};

const LoginButton: React.FC<LoginButtonProps> = ({ onAddress: onLogin }) => {
  const doLogin = async () => {
    const loginData = await loginMetamask();
    onLogin(loginData.account, loginData.provider);
  };
  return (
    <button type="button" onClick={() => 'hola'}>
      <span>Login</span>
      <br />
      <span className="small-text">with Metamask</span>
    </button>
  );
};

type AddressInputProps = {
  onAddress: (address: string) => void;
};

const AddressInput: React.FC<AddressInputProps> = ({ onAddress }) => {
  const [address, setAddress] = useState('');
  const [ensError, setEnsError] = useState(false);
  const [working, setWorking] = useState(false);
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    setAddress(e.target.value);
    if (ensError) {
      setEnsError(false);
    }
  };
  const onSubmit: React.FormEventHandler = async e => {
    e.preventDefault();
    if (isValidAddress(address)) {
      onAddress(address);
    } else {
      setEnsError(false);
      setWorking(true);
      const ensResponse = await resolveENS(address);
      setWorking(false);
      console.log('finished', ensResponse);
      if (ensResponse.exists) {
        onAddress(ensResponse.address);
      } else {
        setEnsError(true);
      }
    }
  };
  return (
    <form className="login-form" onSubmit={onSubmit}>
      <input
        type="text"
        id="address"
        required
        placeholder="evanvanness.eth"
        onChange={handleChange}
      />
      {ensError && <span>Invalid ENS name</span>}
      <input
        type="submit"
        id="submit"
        value={working ? 'Working...' : 'Display Badges'}
        name="submit"
      />
    </form>
  );
};

function isValidAddress(str: string) {
  try {
    getAddress(str);
    return true;
  } catch (e) {
    // invalid Address. Try ENS
    return false;
  }
}
