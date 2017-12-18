import React from 'react';
import { render } from 'react-dom';
import Autocomplete from './Autocomplete';
import AsyncAutocomplete from './AsyncAutocomplete';

let testValues = ['One', 'Two', 'Three', 'Four', 'Five'];
const testValues1 = testValues.map(q => 'Super long long long ' + q);
let testValues2 = testValues;
testValues2 = [...testValues2, ...testValues2.map(q => 'And ' + q)];
testValues2 = [...testValues2, ...testValues2.map(q => 'Again ' + q)];
testValues2 = [...testValues2, ...testValues2.map(q => 'And ' + q)];
testValues2 = [...testValues2, ...testValues2.map(q => 'Again ' + q)];
testValues2 = [...testValues2, ...testValues2.map(q => 'And ' + q)];
testValues2 = [...testValues2, ...testValues2.map(q => 'Again ' + q)];

const App = () => (
  <div style={{ margin: '10vmin 0 50vh 10vmin' }}>
    <h2>Autocomplete</h2>
    <p>items count: {testValues.length}</p>
    <Autocomplete
      options={testValues}
      label="autocomplete"
    />
    <br />
    <h2>Autocomplete</h2>
    <p>Long width, items count: {testValues1.length}</p>
    <Autocomplete
      options={testValues1}
      label="autocomplete"
      widthsEquals={false}
    />
    <br />
    <h2>Autocomplete</h2>
    <p>Stretched height, items count: {testValues2.length}</p>
    <Autocomplete
      options={testValues2}
      listMaxHeightStretching
      label="autocomplete"
    />
    <br />
    <h2>AsyncAutocomplete</h2>
    <p>Async, items count: {testValues2.length}</p>
    <AsyncAutocomplete
      options={testValues2}
      listMaxHeightStretching
      label="autocomplete"
    />
  </div>
);

render(<App />, document.getElementById('root'));
