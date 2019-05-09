import React from 'react';
import { ScanFooter, ScanHeader } from './Layout';
import { RouteComponentProps, Route } from 'react-router';
import { ChooseAddressPage } from './ChooseAddressPage';
import { AddressTokensPage } from './AddressTokensPage';
import { TokenDetailPage } from './TokenDetailPage';

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
          render={() => <ChooseAddressPage onAccountDetails={this.showBadges} />}
        />
        <Route path={`${this.props.match.path}scan/:address`} component={AddressTokensPage} />
        <Route path={`${this.props.match.path}token/:tokenId`} component={TokenDetailPage} />
        <ScanFooter />
      </>
    );
  }
}
