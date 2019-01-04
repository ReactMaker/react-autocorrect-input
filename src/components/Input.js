import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const ACIContainer = styled.div`
  position: relative;
  & *{
    box-sizing: border-box;
  }
`;

const Input = styled.input`
  border: 1px solid #ccc;
  border-radius: 4px;
  line-height: 24px;
  height: 40px;
  padding: 6px 11px;
  font-size: 16px;
  width: 100%;
  &:focus{
    outline: none !important;
    box-shadow: 0 0 4px #ccc;
  }
`;

const MenuContainer = styled.div`
  position: absolute;
  left: 0;
  top: 40px;
  z-index: 1000;
  width: 100%;
`;

const MenuLi = styled.div`
  line-height: 24px;
  height: 40px;
  padding: 6px 11px;
  font-size: 16px;
  width: 100%;
  cursor: pointer;
  background: ${p => (p.active ? '#ccc' : 'white')};
  box-shadow: 0 0 1px #ccc;
  &:hover{
    background: lightgray;
  }
`;

const Style = {
  ACIContainer,
  Input,
  MenuContainer,
  MenuLi,
};

const initState = {
  suggest: [],
  selectedSuggest: '',
};

export default class ACInput extends React.Component {
  inputRef = React.createRef()

  state = initState

  onChange = (e) => {
    const { dataSource, onChange } = this.props;
    const { value, selectionStart } = e.target;
    // 1. get last keyword
    const lastWord = value.split(' ').pop().toLowerCase();
    if (!lastWord || selectionStart !== value.length) {
      this.setState(initState);
      onChange(value);
      return;
    }
    // 2. filter suggest
    const suggest = dataSource
      .map(keyword => keyword.toLowerCase())
      .filter(keyword => (keyword.indexOf(lastWord) === 0))
      .slice(0, 10);
    const selectedSuggest = suggest[0] || '';
    // 3. update suggest array
    this.setState({ suggest, selectedSuggest });
    onChange(value);
  }

  onKeyDown(e) {
    const { suggest, selectedSuggest } = this.state;
    if (e.which === 38) {
      const selectIndex = suggest.findIndex(keyword => keyword === selectedSuggest);
      if (selectIndex === 0) {
        // choose last suggest keyword
        this.setState({ selectedSuggest: suggest[suggest.length - 1] });
      } else {
        // choose next suggest
        this.setState({ selectedSuggest: suggest[selectIndex - 1] });
      }
      // when press up
      e.preventDefault();
    } else if (e.which === 40) {
      const selectIndex = suggest.findIndex(keyword => keyword === selectedSuggest);
      if (selectIndex === (suggest.length - 1)) {
        // choose last suggest keyword
        this.setState({ selectedSuggest: suggest[0] });
      } else {
        // choose next suggest
        this.setState({ selectedSuggest: suggest[selectIndex + 1] });
      }
      e.preventDefault();
    } else if ((e.which === 13) && (suggest.length > 0)) {
      this.onComplete(selectedSuggest);
    } else if (e.which === 32) {
      // when press space
      this.setState(initState);
    }
  }

  onClickSuggest = selectedSuggest => () => {
    this.onComplete(selectedSuggest);
    this.inputRef.current.focus();
  }

  onComplete = (selectedSuggest) => {
    const { value, onChange } = this.props;
    const arr = value.split(' ');
    arr.splice(arr.length - 1, 1, selectedSuggest);
    const newVal = arr.join(' ');
    onChange(newVal);
    this.setState(initState);
  }

  onBlur = () => {
    setTimeout(() => {
      this.setState({ suggest: [] });
    }, 300);
  }

  componentDidMount() {
    const ele = this.inputRef.current;
    // 1. add input event to prevent arrow up and down
    ele.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  componentWillUnmount() {
    const ele = this.inputRef.current;
    // 1. remove event;
    ele.removeEventListener('keydown', this.onKeyDown);
  }

  render() {
    const { value, style, className, menuClassName } = this.props;
    const { suggest, selectedSuggest } = this.state;
    const displaySuggest = suggest.length > 0;
    return (
      <Style.ACIContainer>
        <Style.Input
          value={value}
          onChange={this.onChange}
          ref={this.inputRef}
          onBlur={this.onBlur}
          style={style}
          className={className}
        />
        <Style.MenuContainer display={displaySuggest} className={menuClassName}>
          {
            suggest.map(keyword => (
              <Style.MenuLi
                key={keyword}
                onClick={this.onClickSuggest(keyword)}
                active={keyword === selectedSuggest}
              >
                {keyword}
              </Style.MenuLi>
            ))
          }
        </Style.MenuContainer>
      </Style.ACIContainer>
    );
  }
}

ACInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  dataSource: PropTypes.arrayOf(PropTypes.string),
  style: PropTypes.shape({}),
  className: PropTypes.string,
  menuClassName: PropTypes.string,
};

ACInput.defaultProps = {
  value: '',
  onChange: (value) => { },
  dataSource: [],
  style: {},
  className: '',
  menuClassName: '',
};
