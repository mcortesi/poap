import React from 'react';
import { RouteComponentProps } from 'react-router';
import { TokenInfo, getTokenInfo } from '../api';
import HeaderShadowImg from '../images/header-shadow.svg';
import HeaderShadowDesktopImg from '../images/header-shadow-desktop.svg';
type TokenPageState = {
  token: null | TokenInfo;
};

export class TokenDetailPage extends React.Component<
  RouteComponentProps<{
    tokenId: string;
  }>,
  TokenPageState
> {
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
