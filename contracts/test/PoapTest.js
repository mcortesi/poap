const { TestHelper } = require('zos');
const { Contracts, ZWeb3 } = require('zos-lib');
const expect = require('chai').expect;

ZWeb3.initialize(web3.currentProvider);

const Poap = Contracts.getFromLocal('Poap');
// const ERC20 = Contracts.getFromNodeModules("openzeppelin-eth", "ERC20");

async function expectError(f) {
  fail = true;
  try {
    await f();
  } catch {
    fail = false;
  }
  if (fail) {
    expect.fail('Expecting async function to throw');
  }
}

contract('Poap', function() {
  let accounts;
  let owner;
  let admin;
  let proxy;
  let project;

  before(async function() {
    accounts = await web3.eth.getAccounts();
    owner = accounts[0];
    admin = accounts[9];
  });

  beforeEach(async function() {
    project = await TestHelper();
    proxy = await project.createProxy(Poap, {
      initMethod: 'initialize',
      initArgs: ['Poap', 'POAP', 'https://poap.xyz/', [accounts[9]]],
    });
  });

  describe('pause', function() {
    it('should start unpaused', async function() {
      expect(await proxy.methods.paused().call()).to.be.false;
    });

    it('should allow admin to pause it', async function() {
      await proxy.methods.pause().send({ from: admin });
      expect(await proxy.methods.paused().call()).to.be.true;
    });

    it('should NOT allow other users to pause it', async function() {
      await expectError(() => proxy.methods.pause().send({ from: accounts[1] }));
    });
  });

  describe('unpause', function() {
    beforeEach(async function() {
      await proxy.methods.pause().send({ from: admin });
    });

    it('should allow admin to unpause it', async function() {
      await proxy.methods.unpause().send({ from: admin });
      expect(await proxy.methods.paused().call()).to.be.false;
    });

    it('should NOT allow other users to unpause it', async function() {
      await expectError(() => proxy.methods.unpause().send({ from: accounts[1] }));
    });
  });

  describe('Roles', function() {
    it('should allow admin to add another admin', async function() {
      await proxy.methods.addAdmin(accounts[1]).send({ from: admin });
      expect(await proxy.methods.isAdmin(accounts[1]).call()).to.be.true;
    });
    it('should NOT allow other users to add another admin', async function() {
      await expectError(() => proxy.methods.addAdmin(accounts[2]).send({ from: accounts[1] }));
    });

    it('should allow admin to add an eventMinter', async function() {
      await proxy.methods.addEventMinter(55, accounts[1]).send({ from: admin });
      expect(await proxy.methods.isEventMinter(55, accounts[1]).call()).to.be.true;
      expect(await proxy.methods.isEventMinter(1, accounts[1]).call()).to.be.false;
    });

    it('should allow an eventMinter to add an eventMinter', async function() {
      await proxy.methods.addEventMinter(55, accounts[1]).send({ from: admin });
      await proxy.methods.addEventMinter(55, accounts[2]).send({ from: accounts[1] });

      expect(await proxy.methods.isEventMinter(55, accounts[2]).call()).to.be.true;
    });

    it('should NOT allow other users to add an eventMinter', async function() {
      await expectError(() =>
        proxy.methods.addEventMinter(55, accounts[2]).send({ from: accounts[1] })
      );
    });

    it("should allow an eventMinter to renounce it's role", async function() {
      await proxy.methods.addEventMinter(55, accounts[1]).send({ from: admin });
      await proxy.methods.renounceEventMinter(55).send({ from: accounts[1] });
      expect(await proxy.methods.isEventMinter(55, accounts[1]).call()).to.be.false;
    });

    it("should allow an admin to renounce it's role", async function() {
      await proxy.methods.renounceAdmin().send({ from: admin });
      expect(await proxy.methods.isAdmin(admin).call()).to.be.false;
    });

    describe('removeEventMinter', function() {
      beforeEach(async function() {
        await proxy.methods.addEventMinter(55, accounts[1]).send({ from: admin });
      });
      it('should allow admin to remove an eventMinter', async function() {
        await proxy.methods.removeEventMinter(55, accounts[1]).send({ from: admin });
        expect(await proxy.methods.isEventMinter(55, accounts[1]).call()).to.be.false;
      });

      it('should NOT allow other users to remove an eventMinter', async function() {
        await expectError(() =>
          proxy.methods.removeEventMinter(55, accounts[1]).send({ from: accounts[2] })
        );
      });
      it('should NOT allow other eventMinter to remove an eventMinter', async function() {
        await expectError(() =>
          proxy.methods.removeEventMinter(55, accounts[1]).send({ from: accounts[1] })
        );
      });
    });
  });

  describe.skip('mintToken', function() {
    it('should allow admin to mint tokens', async function() {
      console.log(await proxy.methods.balanceOf(accounts[1]).call());
      await proxy.methods.mintToken(55, 1, accounts[1]).send({ from: admin });

      console.log(await proxy.methods.balanceOf(accounts[1]).call());
      // expect((await proxy.methods.balanceOf(accounts[1]).call()).toNumber()).to.eq(1);
      // expect(await proxy.methods.ownerOf(10).call()).to.eq(accounts[1]);
    });
  });

  // mintToken:
  // Admin can mint token
  // EventMinter can mint token
  // Minted token has a valid URI
  // Can't mint same token twice
  // Can't mint when contract is paused

  // minttokenBatch
  // Admin can mint batch
  // EventMinter can mint batch
  // Minted tokens go from [tokenId, tokenId + len(address)]
  // Can't mint when contract is paused

  // Owner can burn it's own token

  // approve / transfer tests

  //   it('should create a proxy for the EVM package', async function () {
  //     const proxy = await this.project.createProxy(ERC20, { contractName: 'StandaloneERC20', packageName: 'openzeppelin-eth' });
  //     const result = await proxy.methods.totalSupply().call();
  //     result.should.eq('0');
  //   })
});
