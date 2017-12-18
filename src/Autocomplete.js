import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Paper from 'material-ui/Paper';
import List from 'material-ui/List';
import { MenuItem } from 'material-ui/Menu';
import TextField from 'material-ui/TextField';
import { CircularProgress } from 'material-ui/Progress';
import { isFunction } from 'lodash';

const keyCodes = {
  escape: 27,
  tab: 9,
  enter: 13,
  arrowUp: 38,
  arrowDown: 40,
};

const onChoice = nothing => nothing;

const onFoldTip = error => (error ? 'Элемент не выбран' : ' ');

const onSearchTip = (count, all, loading) => {
  if (loading) return 'Поиск...';
  if (!count) return 'Ничего не найдено';
  if (count === all) {
    return `Найдено: ${count}`;
  } else {
    return `Найдено: ${count} из ${all}`;
  }
};

const listStyles = {
  display: 'none',
  position: 'absolute',
  left: '0px',
  padding: '0px 0',
  overflow: 'auto',
  zIndex: 1,
};

const filterOptions = (options, value, uncontrolledOptions) => {
  if (uncontrolledOptions) return options;

  const query = value.trim().toLowerCase();

  return options.filter(o => o.toLowerCase().includes(query));
};

class AutocompleteItem extends React.PureComponent {
  handleClick = e => {
    e.stopPropagation();
    this.props.onClick(this.props.index);
  };
  render() {
    const { selected, children } = this.props;
    return (
      <MenuItem selected={selected} onClick={this.handleClick} button>
        {children}
      </MenuItem>
    );
  }
}

class Autocomplete extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.defaultValue || '',
      expanded: false,
      selectedIndex: 0,
      wasTouched: false,
    };

    this.inputRef = null;
    this.textFieldElement = null;
    // delete first 2 chars for correct selector
    this.inputId = `autocomplite-${Math.random()
      .toString()
      .slice(2)}`;
    this.listId = `${this.inputId}-list`;
    this.falseFocus = false;
  }
  static propTypes = {
    ...TextField.propTypes,
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
    uncontrolledOptions: PropTypes.bool,
    /**
     * Tip unnhide when field was touched and closed
     * @param {string} value
     */
    onChoice: PropTypes.func,
    loading: PropTypes.bool,
    requiredChoose: PropTypes.bool,
    choiceWhenClose: PropTypes.bool,
    listMaxHeight: PropTypes.number,
    listMaxHeightStretching: PropTypes.bool,
    // list width and TextField width is equal
    widthsEquals: PropTypes.bool,
    /**
     * Tip unnhide when field touched and open
     * @param {number} count
     * @param {number} all
     * @param {boolean} loading
     * @returns {string}
     */
    onSearchTip: PropTypes.func,
    /**
     * Tip unnhide when field was touched and closed
     * @param {boolean} error
     * @returns {string}
     */
    onFoldTip: PropTypes.func,
  };

  static defaultProps = {
    ...TextField.defaultProps,
    options: [],
    uncontrolledOptions: false,
    onChoice: onChoice,
    loading: false,
    requiredChoose: false,
    choiceWhenClose: true,
    listMaxHeight: 200,
    listMaxHeightStretching: false,
    widthsEquals: true,
    onSearchTip: onSearchTip,
    onFoldTip: onFoldTip,
    InputProps: null,
  };

  componentDidMount() {
    document.addEventListener('click', this.handleClose);
  }
  componentWillUnmount() {
    document.removeEventListener('click', this.handleClose);
  }

  validate = () => {
    this.setState({ wasTouched: true });
    return this.props.onFoldTip(this.isError(this.props.options, true));
  };

  handleSetInputRef = ref => {
    if (!ref) return;
    this.inputRef = ref;
    this.textFieldElement = ref.parentElement.parentElement;
    if (isFunction(this.props.inputRef)) this.props.inputRef(ref);
  };

  handleChangeSelection = e => {
    const { keyCode } = e;

    if (
      !this.state.expanded ||
      (keyCode !== keyCodes.arrowDown &&
        keyCode !== keyCodes.arrowUp &&
        keyCode !== keyCodes.enter &&
        keyCode !== keyCodes.escape &&
        keyCode !== keyCodes.tab)
    ) {
      if (isFunction(this.props.onKeyDown)) this.props.onKeyDown(e);
      return;
    }
    let selectedIndex = this.state.selectedIndex;

    const relativeOptions = filterOptions(
      this.props.options,
      this.state.value,
      this.props.uncontrolledOptions
    );

    if (keyCode === keyCodes.escape || keyCode === keyCodes.tab) {
      e.preventDefault();
      this.setState({ expanded: false, selectedIndex: 0 });
      if (this.props.choiceWhenClose && this.props.requiredChoose) {
        this.props.onChoice(
          this.props.options.some(o => o === this.state.value) ? this.state.value : null
        );
      }
      if (isFunction(this.props.onKeyDown)) this.props.onKeyDown(e);
      return;
    }

    if (keyCode === keyCodes.enter) {
      e.preventDefault();
      const value = relativeOptions[selectedIndex];
      this.setState({
        expanded: false,
        selectedIndex: 0,
        value,
      });
      this.props.onChoice(value);
      if (isFunction(this.props.onKeyDown)) this.props.onKeyDown(e);
      return;
    }

    if (keyCode === keyCodes.arrowUp) {
      e.preventDefault();
      selectedIndex = selectedIndex === 0 ? relativeOptions.length - 1 : selectedIndex - 1;
    }

    if (keyCode === keyCodes.arrowDown) {
      e.preventDefault();
      selectedIndex = selectedIndex < relativeOptions.length - 1 ? selectedIndex + 1 : 0;
    }
    // scroll to selected element
    const list = this.textFieldElement.querySelector(`#${this.listId}`);
    const selectedElem = list && list.children[0].children[selectedIndex];
    if (selectedElem) {
      const { bottom: bottomParent, top: topParent } = list.getBoundingClientRect();
      const { bottom, height } = selectedElem.getBoundingClientRect();

      if (bottom - height < topParent || bottom > bottomParent) selectedElem.scrollIntoView();
    }

    this.setState({ selectedIndex });

    if (isFunction(this.props.onKeyDown)) this.props.onKeyDown(e);
  };

  handleFocusInput = e => {
    if (this.props.disabled) return;

    if (this.falseFocus) {
      this.falseFocus = false;
      return;
    }
    this.setState({ expanded: true });
    if (this.props && this.props.onFocus) this.props.onFocus(e);
  };

  handleClickInput = e => {
    if (this.props.disabled) return;

    this.setState({
      expanded: true,
      wasTouched: true,
    });
    if (this.props.InputProps && isFunction(this.props.InputProps.onClick))
      this.props.InputProps.onClick(e);
  };

  handleClickItem = index => {
    this.falseFocus = true;
    this.inputRef.focus();

    const value = this.props.options[index];

    this.setState({
      value,
      expanded: false,
      selectedIndex: 0,
      wasTouched: true,
    });
    this.props.onChoice(value);
  };

  handleChangeInput = e => {
    const { target: { value } } = e;
    this.setState({
      value,
      expanded: true,
      wasTouched: true,
      selectedIndex: 0,
    });
    if (isFunction(this.props.onChange)) this.props.onChange(e);
  };

  handleClose = e => {
    if (e.target.dataset.muiAutocompliteId !== this.inputId && this.state.expanded === true) {
      this.setState({ expanded: false, selectedIndex: 0 });
      if (this.props.choiceWhenClose && this.props.requiredChoose) {
        this.props.onChoice(
          this.props.options.some(o => o === this.state.value) ? this.state.value : null
        );
      }
    }
  };

  isError = (options, wasTouched = this.state.wasTouched) => {
    const { expanded, value } = this.state;
    if (!this.props.requiredChoose || !wasTouched || expanded) return false;
    if (this.props.options.some(o => o === value)) return false;
    if (!options.length) return true;
    if (!options.some(o => o === value)) return true;
    return false;
  };

  getlistStyles = () => {
    if (!this.inputRef) return listStyles;

    const maxHeight = this.props.listMaxHeight - listStyles.padding[0] * 2;

    const { top, bottom, left } = this.textFieldElement.getBoundingClientRect();

    const windowHeight = window.innerHeight;
    let availebleHeight = windowHeight - bottom - 10;
    const heightAnough = availebleHeight > maxHeight;
    availebleHeight = heightAnough ? availebleHeight : top - 10;
    const position = heightAnough ? 'top' : 'bottom';
    return {
      ...listStyles,
      display: 'block',
      width: this.props.widthsEquals ? '100%' : 'initial',
      maxWidth: window.innerWidth - left - 10,
      maxHeight: this.props.listMaxHeightStretching ? `${availebleHeight}px` : `${maxHeight}px`,
      [position]: 'calc(100% + 5px)',
    };
  };

  render() {
    const { expanded, selectedIndex } = this.state;
    const {
      value = this.state.value,
      options: allOptions,
      uncontrolledOptions,
      onChange,
      onChoice,
      loading,
      requiredChoose,
      choiceWhenClose,
      listMaxHeight,
      listMaxHeightStretching,
      widthsEquals,
      onFoldTip,
      onSearchTip,
      defaultValue,
      ...otherProps
    } = this.props;

    const options = filterOptions(this.props.options, value, uncontrolledOptions);

    const listExist = this.textFieldElement && expanded && (!!options.length || loading);

    const error = this.isError(options);

    const query = value.trim().toLowerCase();

    return [
      <TextField
        key={this.inputId}
        value={value}
        helperText={
          expanded ? onSearchTip(options.length, allOptions.length, loading) : onFoldTip(error)
        }
        error={error}
        {...otherProps}
        InputProps={{
          ...this.props.InputProps,
          inputProps: {
            ...(this.props.InputProps && this.props.InputProps.inputProps),
            'data-mui-autocomplite-id': this.inputId,
          },
          onClick: this.handleClickInput,
          autoComplete: 'off',
        }}
        inputRef={this.handleSetInputRef}
        onFocus={this.handleFocusInput}
        onChange={this.handleChangeInput}
        onKeyDown={this.handleChangeSelection}
      />,
      listExist &&
      ReactDOM.createPortal(
        <Paper key={this.listId} id={this.listId} style={this.getlistStyles()}>
          <List>
            {loading ? (
              <div style={{ textAlign: 'center' }}>
                <CircularProgress />
              </div>
            ) : (
                this.props.options.reduce(
                  (acc, option, index) =>
                    option.toLowerCase().includes(query) || uncontrolledOptions
                      ? [
                        ...acc,
                        <AutocompleteItem
                          key={index}
                          index={index}
                          selected={selectedIndex === acc.length}
                          onClick={this.handleClickItem}
                        >
                          {option}
                        </AutocompleteItem>,
                      ]
                      : acc,
                  []
                )
              )}
          </List>
        </Paper>,
        this.textFieldElement
      ),
    ];
  }
}

export default Autocomplete;
