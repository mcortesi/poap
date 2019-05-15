import React from 'react';
import { RouteComponentProps } from 'react-router';
import { TokenInfo, getTokensFor } from '../api';
import classNames from 'classnames';
import NoEventsImg from '../images/event-2019.svg';
import { Link } from 'react-router-dom';
import { Loading } from '../components/Loading';
type AddressTokensPageState = {
  tokens: null | TokenInfo[];
  error: boolean;
};

export class AddressTokensPage extends React.Component<
  RouteComponentProps<{
    address: string;
  }>,
  AddressTokensPageState
> {
  state: AddressTokensPageState = {
    tokens: null,
    error: false,
  };

  async componentDidMount() {
    try {
      const tokens = await getTokensFor(this.props.match.params.address);
      this.setState({ tokens });
    } catch (err) {
      console.error(err);
      this.setState({ error: true });
    }
  }

  getTokensByYear(): {
    year: number;
    tokens: TokenInfo[];
  }[] {
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
    const res: {
      year: number;
      tokens: TokenInfo[];
    }[] = [];
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

            {this.state.error ? (
              <div className="bk-msg-error">
                There was an error.
                <br />
                Check the address and try again
              </div>
            ) : this.state.tokens == null ? (
              <>
                <Loading />
                <div style={{ textAlign: 'center' }}>Waiting for your tokens... Hang tight</div>
              </>
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
