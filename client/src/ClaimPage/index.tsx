import classNames from 'classnames';
import React, { useCallback, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { getEvent, PoapEvent, checkSigner } from '../api';
import { Loading } from '../components/Loading';
import FooterPattern from '../images/footer-pattern.svg';
import FooterShadowDesktop from '../images/footer-shadow-desktop.svg';
import FooterShadow from '../images/footer-shadow.svg';
import HeaderShadowDesktopGreenImg from '../images/header-shadow-desktop-green.svg';
import HeaderShadowDesktopImg from '../images/header-shadow-desktop.svg';
import HeaderShadowGreenImg from '../images/header-shadow-green.svg';
import HeaderShadowImg from '../images/header-shadow.svg';
import { tryGetAccount, tryObtainBadge, hasMetamask, isMetamaskLogged } from '../poap-eth';
import { useAsync, useBodyClassName } from '../react-helpers';

type ClaimPageState = {
  event: null | PoapEvent;
  invalidEventFlag: boolean;
};

export const LoadEvent: React.FC<{
  fancyId: string;
  render: (event: PoapEvent) => React.ReactElement;
}> = ({ fancyId, render }) => {
  const getEventMemo = useCallback(() => getEvent(fancyId), [fancyId]);
  const [event, fetchingEvent, fetchEventError] = useAsync(getEventMemo);

  if (event == null || fetchEventError) {
    return <ClaimFooter />;
  } else if (fetchingEvent) {
    return <Loading />;
  }
  return render(event);
};

export const CheckAccount: React.FC<{
  render: (address: string) => React.ReactElement;
}> = ({ render }) => {
  const [account, fetchingAccount, fetchAccountError] = useAsync(tryGetAccount);
  const metamaskLoggedOut = hasMetamask() && !isMetamaskLogged();
  if (fetchingAccount) {
    return <p>Checking Browser for Web3</p>;
  } else if (fetchAccountError) {
    return <p className="error">There was a problem obtaining your account</p>;
  } else if (metamaskLoggedOut) {
    return <p className="error">Metamask is Logged Out. Login and Refresh</p>;
  } else if (account == null) {
    return <p className="error">You need a Web3 enabled browser to get your badge here</p>;
  }

  return render(account);
};

export const ClaimPage: React.FC<RouteComponentProps<{ event: string }>> = ({ match }) => {
  return (
    <>
      <LoadEvent fancyId={match.params.event} render={event => <ClaimPageInner event={event} />} />
      <ClaimFooter />
    </>
  );
};

enum ClaimState {
  Iddle,
  Working,
  Finished,
  Failed,
  MetaMaskLoggedOut,
}

const ClaimPageInner: React.FC<{ event: PoapEvent }> = ({ event }) => {
  const hasSigner = event.signer != null && event.signer_ip != null;
  const checkLocation = useCallback(() => checkSigner(event.signer_ip, event.id), [event]);
  const [onLocation, checkingLocation] = useAsync(checkLocation);

  const [claimState, setClaimState] = useState(ClaimState.Iddle);
  const obtainBadge = useCallback(async (event: PoapEvent, account: string) => {
    setClaimState(ClaimState.Working);
    try {
      await tryObtainBadge(event, account);
      setClaimState(ClaimState.Finished);
    } catch (err) {
      console.log(err);
      setClaimState(ClaimState.Failed);
    }
  }, []);
  useBodyClassName(claimState ? 'eventsapp green' : 'eventsapp');

  return (
    <>
      <ClaimHeader event={event} />
      <main id="site-main" role="main" className={classNames('main-events', claimState && 'green')}>
        <div className="image-main">
          <ResponsiveImg
            mobile={claimState ? HeaderShadowGreenImg : HeaderShadowImg}
            desktop={claimState ? HeaderShadowDesktopGreenImg : HeaderShadowDesktopImg}
          />
        </div>
        <div className="main-content">
          <div className="container">
            <div className="content-event" data-aos="fade-up" data-aos-delay="300">
              <CheckAccount
                render={account => (
                  <>
                    <h2>Wallet</h2>
                    <p className="wallet-number">{account}</p>
                    {claimState === ClaimState.Iddle && (
                      <ClaimButton
                        hasSigner={hasSigner}
                        onLocation={onLocation}
                        checkingLocation={checkingLocation}
                        obtainBadge={() => obtainBadge(event, account)}
                      />
                    )}
                    {claimState === ClaimState.Working && <Loading />}
                    {claimState === ClaimState.Finished && (
                      <>
                        <h3>You’re all set!</h3>
                        <p>Your new badge will show up shortly on</p>
                        <Link to={`/scan/${account}`}>
                          <button className="btn">POAPScan</button>
                        </Link>
                        <p>Smash that refresh button</p>
                      </>
                    )}
                    {claimState === ClaimState.Failed && (
                      <p className="error">There was an error with your claim</p>
                    )}
                  </>
                )}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

const ResponsiveImg: React.FC<{ mobile: string; desktop: string }> = ({ mobile, desktop }) => (
  <>
    <img alt="" src={mobile} className="mobile" />
    <img alt="" src={desktop} className="desktop" />
  </>
);

type ClaimButtonProps = {
  obtainBadge: () => void;
  onLocation: null | boolean;
  checkingLocation: boolean;
  hasSigner: boolean;
};
const ClaimButton: React.FC<ClaimButtonProps> = ({
  obtainBadge,
  onLocation,
  checkingLocation,
  hasSigner,
}) => {
  if (!hasSigner) {
    return (
      <button className="btn" disabled>
        Venue is inactive
      </button>
    );
  } else if (checkingLocation) {
    return <button className="btn loading" disabled />;
  } else if (!onLocation) {
    return (
      <button className="btn" disabled>
        You're not on the venue!
      </button>
    );
  }

  return (
    <button className="btn" onClick={obtainBadge}>
      <span>I am right here</span>
      <br />
      <span className="small-text">so give me by badge</span>
    </button>
  );
};

const ClaimHeader: React.FC<{ event: PoapEvent }> = ({ event }) => (
  <header id="site-header" role="banner" className="header-events">
    <div className="container">
      <h1>{event.name}</h1>
      <div className="logo-event" data-aos="fade-up">
        <img src={event.image_url} alt="Event" />
      </div>
    </div>
  </header>
);

const ClaimFooter: React.FC = () => (
  <footer role="contentinfo" className="footer-events">
    <div className="image-footer">
      <img src={FooterShadow} className="mobile" alt="" />
      <img src={FooterShadowDesktop} className="desktop" alt="" />
    </div>
    <div className="footer-content">
      <div className="container">
        <img src={FooterPattern} alt="" className="decoration" />
        <p>
          Powered by <b>POAP</b>
        </p>
        <p>An EthDenver 2019 hack</p>
      </div>
    </div>
  </footer>
);

/**
 
1) Cargo... todavia no se si tengo web3 [ Detecting web3...]
2) Espero a ver si tengo web3 (3 segundos)
3) Si es Metmask => Pido enable() (en el claimer)
4) Si no es metamask => Pido first account y la uso
5) Si no tengo nada => muestro mensaje de error

post (3) y (4)


Estados:
  - CheckingWeb3
  - WalletReady
  - MintingToken
  - WalletMissing
 */
