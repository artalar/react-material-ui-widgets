import * as React from 'react';
import { debounce } from 'lodash';

import Autocomplete from './Autocomplete';

const sleep = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

class AsyncAutocomplete extends React.Component {
  state = {
    loading: false,
    options: [],
  };

  fetchData = async value => {
    await sleep(1500);
    this.setState({ loading: false, options: this.props.options });
  };

  fetchData = debounce(this.fetchData, 400)

  handleChangeInput = e => {
    this.handleChoice(e.target.value);
  };

  handleChoice = input => {
    if (!input) {
      this.setState({ options: [] });
      return;
    }
    this.setState({ loading: true });
    this.fetchData(input);
  };

  render() {
    return (
      <Autocomplete
        {...this.props}
        loading={this.state.loading}
        onChange={this.handleChangeInput}
        onChoice={this.handleChoice}
      />
    );
  }
}

export default AsyncAutocomplete;
