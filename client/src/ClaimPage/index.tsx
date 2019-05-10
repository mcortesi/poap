import classNames from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { getEvent, PoapEvent } from '../api';
import FooterPattern from '../images/footer-pattern.svg';
import FooterShadowDesktop from '../images/footer-shadow-desktop.svg';
import FooterShadow from '../images/footer-shadow.svg';
import HeaderShadowDesktopGreenImg from '../images/header-shadow-desktop-green.svg';
import HeaderShadowDesktopImg from '../images/header-shadow-desktop.svg';
import HeaderShadowGreenImg from '../images/header-shadow-green.svg';
import HeaderShadowImg from '../images/header-shadow.svg';
import { tryGetAccount, tryObtainBadge } from '../poap-eth';
import { useBodyClassName } from '../react-helpers';
import { Link } from 'react-router-dom';

type ClaimPageState = {
  event: null | PoapEvent;
  invalidEventFlag: boolean;
};

function useAsync<A>(fn: () => Promise<A>): [A | null, boolean, boolean] {
  const [working, setWorking] = useState(false);
  const [hasError, setError] = useState(false);
  const [value, setValue] = useState<A | null>(null);

  useEffect(() => {
    const aux = async () => {
      setError(false);
      setWorking(true);
      try {
        const value = await fn();
        setValue(value);
      } catch {
        setError(true);
      } finally {
        setWorking(false);
      }
    };
    aux();
  }, [fn]);

  return [value, working, hasError];
}

// interface ClaimState {}
// function claimReducer(state: ClaimState, action: ClaimAction): ClaimState {}

export const ClaimPage: React.FC<RouteComponentProps<{ event: string }>> = ({ match }) => {
  const [finished, setFinished] = useState(false);
  useBodyClassName(finished ? 'eventsapp green' : 'eventsapp');
  const [account, fetchingAccount, fetchAccountError] = useAsync(tryGetAccount);
  const getEventMemo = useCallback(() => getEvent(match.params.event), [match]);

  const [event, fetchingEvent, fetchEventError] = useAsync(getEventMemo);
  const obtainBadge = useCallback(async () => {
    await tryObtainBadge(event!, account!);
    setFinished(true);
  }, [event, account]);

  if (event == null || fetchEventError) {
    return (
      <>
        <div>Invalid Event</div>
        <ClaimFooter />
      </>
    );
  }
  if (fetchingEvent) {
    return (
      <>
        <div>Loading...</div>
        <ClaimFooter />
      </>
    );
  }

  return (
    <>
      <ClaimHeader event={event} />
      <main id="site-main" role="main" className={classNames('main-events', finished && 'green')}>
        <div className="image-main">
          <img alt="" src={finished ? HeaderShadowGreenImg : HeaderShadowImg} className="mobile" />
          <img
            alt=""
            src={finished ? HeaderShadowDesktopGreenImg : HeaderShadowDesktopImg}
            className="desktop"
          />
        </div>
        <div className="main-content">
          <div className="container">
            <div className="content-event" data-aos="fade-up" data-aos-delay="300">
              {fetchingAccount ? (
                <p>Checking Browser for Web3</p>
              ) : account == null ? (
                <p className="error">You need a Web3 enabled browser to get your badge here</p>
              ) : (
                <>
                  <h2>Wallet</h2>
                  <p className="wallet-number">{account}</p>
                  {finished ? (
                    <>
                      <h3>You’re all set!</h3>
                      <p>Your new badge will show up shortly on</p>
                      <Link to={`/scan/${account}`}>
                        <button type="button">POAPScan</button>
                      </Link>
                      <p>Smash that refresh button</p>
                    </>
                  ) : (
                    <button type="button" onClick={obtainBadge}>
                      <span>I am right here</span>
                      <br />
                      <span className="small-text">so give me by badge</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <ClaimFooter />
    </>
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
