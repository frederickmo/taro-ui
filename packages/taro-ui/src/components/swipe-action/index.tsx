import classNames from 'classnames'
import PropTypes, { InferProps } from 'prop-types'
import React from 'react'
import { Text, View, MovableArea, MovableView } from '@tarojs/components'
import { CommonEvent } from '@tarojs/components/types/common'
import {
  AtSwipeActionProps,
  AtSwipeActionState,
  SwipeActionOption
} from '../../../types/swipe-action'
import { uuid } from '../../common/utils'
import AtSwipeActionOptions from './options/index'

export default class AtSwipeAction extends React.Component<
  AtSwipeActionProps,
  AtSwipeActionState
> {
  public static defaultProps: AtSwipeActionProps
  public static propTypes: InferProps<AtSwipeActionProps>

  private maxOffsetSize: number
  private moveX: number
  private eleWidth: number

  public constructor(props: AtSwipeActionProps) {
    super(props)
    const { isOpened, maxDistance, areaWidth } = props
    this.maxOffsetSize = maxDistance
    this.state = {
      componentId: uuid(),
      offsetSize: 0,
      _isOpened: !!isOpened,
      needAnimation: false
    }
    this.moveX = 0
    this.eleWidth = areaWidth
  }

  public UNSAFE_componentWillReceiveProps(nextProps: AtSwipeActionProps): void {
    const { isOpened } = nextProps
    const { _isOpened } = this.state

    if (isOpened !== _isOpened) {
      this._reset(!!isOpened) // TODO: Check behavior
    }
  }

  private _reset(isOpened: boolean): void {
    if (isOpened) {
      this.setState({
        _isOpened: true,
        offsetSize: 0
      })
    } else {
      this.setState(
        {
          offsetSize: this.moveX
        },
        () => {
          this.setState({
            offsetSize: this.maxOffsetSize,
            _isOpened: false
          })
        }
      )
    }
  }

  private handleOpened = (event: CommonEvent): void => {
    const { onOpened } = this.props
    if (typeof onOpened === 'function') {
      onOpened(event)
    }
  }

  private handleClosed = (event: CommonEvent): void => {
    const { onClosed } = this.props
    if (typeof onClosed === 'function') {
      onClosed(event)
    }
  }

  private handleClick = (
    item: SwipeActionOption,
    index: number,
    event: CommonEvent
  ): void => {
    const { onClick, autoClose } = this.props

    if (typeof onClick === 'function') {
      onClick(item, index, event)
    }
    if (autoClose) {
      this._reset(false) // TODO: Check behavior
      this.handleClosed(event)
    }
  }

  onTouchEnd = e => {
    if (this.moveX === 0) {
      this._reset(true)
      this.handleOpened(e)
      return
    }
    if (this.moveX === this.maxOffsetSize) {
      this._reset(false)
      this.handleClosed(e)
      return
    }
    if (this.state._isOpened && this.moveX > 0) {
      this._reset(false)
      this.handleClosed(e)
      return
    }
    if (this.maxOffsetSize - this.moveX < this.maxOffsetSize * 0.4) {
      this._reset(false)
      this.handleClosed(e)
    } else {
      this._reset(true)
      this.handleOpened(e)
    }
  }

  onChange = e => {
    this.moveX = e.detail.x
  }

  componentDidMount(): void {
    this._reset(!!this.props.isOpened)
  }

  public render(): JSX.Element {
    const { componentId, offsetSize } = this.state
    const { options } = this.props
    const rootClass = classNames('at-swipe-action', this.props.className)

    return (
      <View
        id={`swipeAction-${componentId}`}
        className={rootClass}
        style={{
          width: `${this.eleWidth}px`
        }}
      >
        <MovableArea
          className='at-swipe-action__area'
          style={{
            width: `${this.eleWidth + this.maxOffsetSize}px`,
            transform: `translate(-${this.maxOffsetSize}px, 0)`
          }}
        >
          <MovableView
            className='at-swipe-action__content'
            direction='horizontal'
            damping={50}
            x={offsetSize}
            onTouchEnd={this.onTouchEnd}
            onChange={this.onChange}
            style={{
              width: `${this.eleWidth}px`
            }}
          >
            {this.props.children}
            {Array.isArray(options) && options.length > 0 ? (
              <AtSwipeActionOptions
                options={options}
                componentId={componentId}
                customStyle={{
                  transform: `translate(${this.maxOffsetSize}px, 0)`,
                  opacity: 1
                }}
              >
                {options.map((item, key) => (
                  <View
                    key={`${item.text}-${key}`}
                    style={item.style}
                    onClick={(e): void => this.handleClick(item, key, e)}
                    className={classNames(
                      'at-swipe-action__option',
                      item.className
                    )}
                  >
                    <Text className='option__text'>{item.text}</Text>
                  </View>
                ))}
              </AtSwipeActionOptions>
            ) : null}
          </MovableView>
        </MovableArea>
      </View>
    )
  }
}

AtSwipeAction.defaultProps = {
  options: [],
  isOpened: false,
  disabled: false,
  autoClose: false,
  maxDistance: 0,
  areaWidth: 0
}

AtSwipeAction.propTypes = {
  isOpened: PropTypes.bool,
  disabled: PropTypes.bool,
  autoClose: PropTypes.bool,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string,
      style: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
      className: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.string,
        PropTypes.array
      ])
    })
  ),

  onClick: PropTypes.func,
  onOpened: PropTypes.func,
  onClosed: PropTypes.func
}
