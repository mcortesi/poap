import React, { useState } from 'react';
import { loginMetamask } from '../poap-eth';
import { ScanFooter, ScanHeader } from './ScanLayout';
import { RouteComponentProps, Route } from 'react-router';
import { useToggleState } from '../react-helpers';
import { TokenInfo, getTokensFor, getTokenInfo, resolveENS } from '../api';
import classNames from 'classnames';
import NoEventsImg from '../images/event-2019.svg';
import HeaderShadowImg from '../images/header-shadow.svg';
import HeaderShadowDesktopImg from '../images/header-shadow-desktop.svg';
import { Link } from 'react-router-dom';
import { getAddress } from 'ethers/utils';

export class ScanPage extends React.Component<RouteComponentProps> {
  showBadges = (address: string) => {
    console.log('here we are!');
    this.props.history.push(`${this.props.match.path}scan/${address}`);
  };

  render() {
    console.log(this.props.match.path);
    return (
      <>
        <ScanHeader />
        <Route
          exact
          path={this.props.match.path}
          render={() => <AddressForm onAccountDetails={this.showBadges} />}
        />
        <Route path={`${this.props.match.path}scan/:address`} component={AddressTokensPage} />
        <Route path={`${this.props.match.path}token/:tokenId`} component={TokenPage} />
        <ScanFooter />
      </>
    );
  }
}

type TokenPageState = {
  token: null | TokenInfo;
};

class TokenPage extends React.Component<RouteComponentProps<{ tokenId: string }>, TokenPageState> {
  state: TokenPageState = {
    token: null,
  };

  async componentDidMount() {
    if (this.props.location.state) {
      this.setState({ token: this.props.location.state });
    } else {
      const token = await getTokenInfo(this.props.match.params.tokenId);
      this.setState({ token });
    }
  }

  render() {
    if (this.state.token == null) {
      return (
        <div className="content-event" data-aos="fade-up" data-aos-delay="300">
          Loading...
        </div>
      );
    }

    const token = this.state.token;
    return (
      <>
        <div className="header-events">
          <div className="container">
            <h1>{token.event.name}</h1>
            <p>
              {token.event.city}, {token.event.country}
              <br />
              <b>{token.event.start_date}</b>
            </p>
            <div className="logo-event" data-aos="fade-up">
              <img src={token.event.image_url} alt="Event" />
            </div>
          </div>
        </div>
        <main id="site-main" role="main" className="main-events">
          <div className="image-main">
            <img src={HeaderShadowImg} alt="" className="mobile" />
            <img src={HeaderShadowDesktopImg} alt="" className="desktop" />
          </div>
          <div className="main-content">
            <div className="container">
              <div className="content-event" data-aos="fade-up" data-aos-delay="300">
                <h2>Owner</h2>
                <p className="wallet-number">{token.owner}</p>
                <h2>Brog on the interwebz</h2>
                <ul className="social-icons">
                  <li>
                    <a href="#">
                      <img src="assets/images/twitter.svg" alt="Twitter" />
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <img src="assets/images/telegram.svg" alt="Twitter" />
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <img src="assets/images/twitter.svg" alt="Twitter" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }
}

type AddressTokensPageState = {
  tokens: null | TokenInfo[];
};

class AddressTokensPage extends React.Component<
  RouteComponentProps<{ address: string }>,
  AddressTokensPageState
> {
  state: AddressTokensPageState = {
    tokens: null,
  };

  async componentDidMount() {
    const tokens = await getTokensFor(this.props.match.params.address);
    this.setState({ tokens });
  }

  getTokensByYear(): { year: number; tokens: TokenInfo[] }[] {
    if (this.state.tokens == null) {
      throw new Error('There are no tokens');
    }

    const tokensByYear: Map<number, TokenInfo[]> = new Map();
    for (const t of this.state.tokens) {
      if (tokensByYear.has(t.event.year)) {
        tokensByYear.get(t.event.year)!.push(t);
      } else {
        tokensByYear.set(t.event.year, [t]);
      }
    }

    const lastYear = Math.min(...this.state.tokens.map(t => t.event.year));
    const res: { year: number; tokens: TokenInfo[] }[] = [];
    for (let year = new Date().getFullYear(); year >= lastYear; year--) {
      res.push({
        year,
        tokens: tokensByYear.get(year) || [],
      });
    }
    return res;
  }

  renderTokens() {
    return (
      <>
        <p>These are the events you have attended in the past</p>
        {this.getTokensByYear().map(({ year, tokens }, i) => (
          <div key={year} className={classNames('event-year', tokens.length === 0 && 'empty-year')}>
            <h2>{year}</h2>
            {tokens.length > 0 ? (
              <div className="events-logos">
                {tokens.map(t => (
                  <Link
                    key={t.tokenId}
                    to={{
                      pathname: `/token/${t.tokenId}`,
                      state: t,
                    }}
                    className="event-circle"
                    data-aos="fade-up"
                  >
                    <img src={t.event.image_url} alt={t.event.name} />
                  </Link>
                ))}
              </div>
            ) : (
              <>
                <img src={NoEventsImg} alt="" />
                <p className="image-description">You’ve been a couch potato all of {year}</p>
              </>
            )}
          </div>
        ))}
      </>
    );
  }

  render() {
    return (
      <main id="site-main" role="main" className="app-content">
        <div className="container">
          <div className="content-event years" data-aos="fade-up" data-aos-delay="300">
            <h1>
              Hey <span>{this.props.match.params.address}!</span>
            </h1>
            {this.state.tokens == null ? (
              <div>Waiting for your tokens... Hang tight</div>
            ) : this.state.tokens.length === 0 ? (
              <div>Mmmm... You don't have any tokens...</div>
            ) : (
              this.renderTokens()
            )}
          </div>
        </div>
      </main>
    );
  }
}

type AddressFormProps = {
  onAccountDetails: (account: string) => void;
};

const AddressForm: React.FC<AddressFormProps> = ({ onAccountDetails }) => {
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
