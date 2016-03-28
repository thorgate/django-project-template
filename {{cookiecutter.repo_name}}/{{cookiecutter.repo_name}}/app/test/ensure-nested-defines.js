import React, {Component} from 'react';

import Alt from 'alt';
import AltContainer from 'alt/AltContainer.js';
import AltIso from 'alt/utils/AltIso';
import { assert } from 'chai';


const alt = new Alt();

const UserActions = alt.generateActions('receivedUser', 'failed');

const UserSource = {
  fetchUser() {
    return {
      remote(state, id, name) {
        return new Promise((resolve, reject) => {
          setTimeout(() => resolve({ id, name }), 10)
        });
      },

      success: UserActions.receivedUser,
      error: UserActions.failed
    }
  }
};

class UserStore {
  constructor() {
    this.user = null;

    this.exportAsync(UserSource);
    this.bindActions(UserActions);
  }

  receivedUser(user) {
    this.user = user;
  }

  failed(e) {
    console.error('Failure', e);
  }
}

const userStore = alt.createStore(UserStore);

const NumberActions = alt.generateActions('receivedNumber', 'failed');

const NumberSource = {
  fetchNumber() {
    return {
      remote(state, id) {
        return new Promise((resolve, reject) => {
          setTimeout(() => resolve(id), 5)
        });
      },

      success: NumberActions.receivedNumber,
      error: NumberActions.failed
    }
  }
};

class NumberStore {
  constructor() {
    this.n = [];
    this.exportAsync(NumberSource);
    this.bindActions(NumberActions);
  }

  receivedNumber(n) {
    this.n = n
  };

  failed(e) {
    console.error(e);
  }
}

const numberStore = alt.createStore(NumberStore);

@AltIso.define((props) => {
  return numberStore.fetchNumber(props.id);
})
class NumbersView extends Component {
  render() {
    return (
      <AltContainer
        store={numberStore}
        render={(props) => {
          return <span>{props.n}</span>
        }} />
    );
  }
}

@AltIso.define((props) => {
  return userStore.fetchUser(props.id, props.name)
})
class User extends Component {
  static defaultProps = {
    user: {name: 'null', id: -1}
  };

  render() {
    return (
      <div>
        <AltContainer
          store={userStore}
          render={(props) => {
            return (
              <div>
                <h1>{props.user && props.user.name}</h1>
                <span>{props.user && props.user.id}</span>

                <NumbersView id={this.props.id + 1} />
              </div>
            )
          }}
        />
      </div>
    );
  }
}


class App extends Component {
  render() {
    return <User id={this.props.id} name={this.props.name} />
  }
}

export default {
  'AltIso nested': {
    'nested fetches work'(done) {
      AltIso.render(alt, App, { id: 1337, name: 'COMMA' }).then((markup) => {
        assert(markup.html);
        assert.match(markup.html, /COMMA/);
        assert.match(markup.html, /1337/);
        assert.match(markup.html, /1338/);
        done()
      })
    }
  }
}
