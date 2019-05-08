import React, { useState } from 'react';
import { loginMetamask } from '../poap-eth';
import { ScanFooter, ScanHeader } from './ScanLayout';
import { RouteComponentProps, Route } from 'react-router';
import { useToggleState } from '../react-helpers';
import { TokenInfo, getTokensFor } from '../api';
import classNames from 'classnames';

export class ScanPage extends React.Component<RouteComponentProps> {
  showBadges = (address: string) => {
    this.props.history.push(`${this.props.match.path}tokens/${address}`);
  };

  render() {
    console.log(this.props.match.path);
    return (
      <>
        <ScanHeader />
        <main id="site-main" role="main" className="app-content">
          <div className="container">
            <Route
              exact
              path={this.props.match.path}
              render={() => <AddressForm onAccountDetails={this.showBadges} />}
            />
            <Route path={`${this.props.match.path}tokens/:address`} component={AddressTokensPage} />
          </div>
        </main>
        <ScanFooter />
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
          <div className="event-year">
            <h2>{year}</h2>
            <div className={classNames('events-logos', i === 0 && 'this-year')}>
              {tokens.length > 0 ? (
                <>
                  {tokens.map(t => (
                    <a href="#" className="event-circle" data-aos="fade-up">
                      <img src={t.event.image_url} alt={t.event.name} />
                    </a>
                  ))}
                </>
              ) : (
                <>
                  <img src="assets/images/event-2019.svg" alt="" />
                  <p className="image-description">You’ve been a couch potato all of 2019</p>
                </>
              )}
            </div>
          </div>
        ))}
      </>
    );
  }

  render() {
    return (
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
    );
  }
}

type AddressFormProps = {
  onAccountDetails: (account: string) => void;
};

const AddressForm: React.FC<AddressFormProps> = ({ onAccountDetails }) => {
  const [enterByHand, toggleEnterByHand] = useToggleState(false);

  return (
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
            or <a onClick={toggleEnterByHand}>enter on address by hand</a>
          </p>
        </>
      )}
    </div>
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
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = e => setAddress(e.target.value);
  const onSubmit: React.FormEventHandler = e => {
    e.preventDefault();
    onAddress(address);
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
      <input type="submit" id="submit" value="Display Badges" name="submit" />
    </form>
  );
};
