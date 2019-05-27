import React, { useState, useCallback } from 'react';
import { tryGetAccount, hasMetamask, isMetamaskLogged } from '../poap-eth';
import { useToggleState, useAsync } from '../react-helpers';
import { resolveENS } from '../api';
import { getAddress } from 'ethers/utils';
import classNames from 'classnames';
// import { Loading } from '../components/Loading';

enum AccountState {
  Checking,
  Present,
  NotPresent,
  Failed,
  MetamaskLoggedOut,
}

export const CheckAccount: React.FC<{
  render: (address: null | string, state: AccountState) => React.ReactElement;
}> = ({ render }) => {
  const [account, fetchingAccount, fetchAccountError] = useAsync(async () => {
    const account = await tryGetAccount();
    return account;
  });
  const metamaskLoggedOut = hasMetamask() && !isMetamaskLogged();

  let state = AccountState.Present;
  if (fetchingAccount) {
    state = AccountState.Checking;
  } else if (fetchAccountError) {
    state = AccountState.Failed;
  } else if (account == null) {
    state = AccountState.NotPresent;
  } else if (metamaskLoggedOut) {
    state = AccountState.MetamaskLoggedOut;
  }

  return render(account, state);
};

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
          {/* <CheckAccount
              render={(account, state) => {
                if (enterByHand)


              }} /> */}
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
                  enter an address by hand
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
  onAddress: (account: string) => void;
};

const LoginButton: React.FC<LoginButtonProps> = ({ onAddress }) => {
  const [gotAccount, setGotAccount] = useState<boolean | null>(null);
  const doLogin = useCallback(async () => {
    const account = await tryGetAccount();
    setGotAccount(account != null);
    if (account) {
      onAddress(account);
    }
  }, [onAddress]);
  return (
    <button className="btn" onClick={doLogin} disabled={gotAccount === false}>
      {gotAccount === false ? (
        <span>Can't Get Account</span>
      ) : (
        <span>Show me my Badges</span>
        // <>
        //   <span>Login</span>
        //   <br />
        //   <span className="small-text">with Metamask</span>
        // </>
      )}
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
      if (ensResponse.valid) {
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
        placeholder="matoken.eth"
        onChange={handleChange}
        className={classNames(ensError && 'error')}
      />
      {ensError && <p className="text-error">Invalid ENS name</p>}
      <input
        type="submit"
        id="submit"
        value={working ? '' : 'Display Badges'}
        disabled={working}
        className={classNames(working && 'loading')}
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
