import React from 'react'
import ReactDOM from 'react-dom'
import Immutable, { is } from 'immutable'
import { connect } from 'dva/mobile'
import { spring, Motion } from 'react-motion'
import { Select } from 'antd'
import WheelIndicator from 'wheel-indicator'
import withClientRect from '#/HOC/withClientRect'
import { trimString } from '#/utils'
import { formatPrice, CLUSTER_SPACING, ASSET_HEIGHT, COMPRESS_ASSET_HEIGHT, ASSET_WIDTH, COLORS, INACTIVE_COLORS } from '#/models/assetBrowser'
import styles from './index.scss'

const { Option } = Select

class ImmutableComponent extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    nextProps = nextProps || {}
    nextState = nextState || {}
    const thisProps = this.props || {}, thisState = this.state || {};
    if (Object.keys(thisProps).length !== Object.keys(nextProps).length ||
        Object.keys(thisState).length !== Object.keys(nextState).length) {
      return true;
    }

    for (const key in nextProps) {
      if (!is(thisProps[key], nextProps[key])) {
        return true;
      }
    }

    for (const key in nextState) {
      if (thisState[key] !== nextState[key] || !is(thisState[key], nextState[key])) {
        return true;
      }
    }
    return false;
  }
}

@connect(({assetBrowser}) => ({
  columns: assetBrowser.get('columns'),
  width: assetBrowser.getIn(['viewBox', 'width']),
  filters: assetBrowser.get('filters')
}))
class ChartHeader extends ImmutableComponent {
  static translation = {
    'func': '按功能分组',
    'type': '按类型',
    'dept': '按科室',
    'supplier': '按品牌',
    'price': '按价值',
    'yoi': '按时间'
  }

  toggleFilter = dimension => e => {
    if (e === undefined) {
      return this.props.dispatch({
        type: 'assetBrowser/filters/remove',
        payload: {
          dimension
        }
      })
    }
    const [ value, displayName ] = JSON.parse(e)
    this.props.dispatch({
      type: 'assetBrowser/filters/toggle',
      payload: {
        dimension,
        key: value,
        displayName: displayName
      }
    })
  }

  getCurrentFilter(column) {
    const dimension = column.get('dimension')
    return this.props.filters.find(filter => filter.get('dimension') === dimension)
  }

  // getCurrentFilterKey(column) {
  //   const filter = this.getCurrentFilter(column)
  //   if (filter) return filter.get('key')
  //   else return undefined
  // }

  getActiveFilterValue(column) {
    const filter = this.getCurrentFilter(column)
    if (filter) return JSON.stringify([filter.get('key'), filter.get('displayName')])
    return undefined
  }

  calcCurrentWidth(column) {
    function getBlength(str) {
      for (var i = str.length, n = 0; i--;) {
        n += str.charCodeAt(i) > 255 ? 2 : 1.5;
      }
      return n;
    }
    const currentFilter = this.getCurrentFilter(column)
    const text = currentFilter ? currentFilter.get('displayName') : ChartHeader.translation[column.get('dimension')]
    return getBlength(text) / 2 * 15 + 28
  }

  render() {
    const { columns, filters } = this.props
    return (
      <div className={styles['chart-header']}>
        {
          columns.map((column, index) => (
            <Select
              className={styles['select']}
              key={column.get('dimension')}
              dropdownMatchSelectWidth={false}
              style={{
                transform: `translate(-50%, -50%)`,
                position: 'absolute',
                left: column.get('left'),
                bottom: 0,
                color: COLORS[index],
                cursor: 'pointer',
                width: this.calcCurrentWidth(column)
              }}
              showSearch
              allowClear
              placeholder={ChartHeader.translation[column.get('dimension')]}
              optionFilterProp="children"
              onChange={this.toggleFilter(column.get('dimension'))}
              value={this.getActiveFilterValue(column)}
              filterOption={(input, option) => option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
              {
                column.get('clusters').sort(index === 3 ? sortFilter : () => -1).map(cluster => (
                  <Option key={cluster.get('key')} value={JSON.stringify([cluster.get('key'), cluster.get('displayName')])}>{cluster.get('displayName')}</Option>
                ))
              }
            </Select>
          ))
        }
      </div>
    )
  }
}

function sortFilter(a, b) {
  // sort options for the last column
  // it ain't pretty, i know.
  const magicWord = '未知年份'
  let _a = a.get('key')
  let _b = b.get('key')
  if (_a === magicWord) {
    return 1
  }
  if (_b === magicWord) {
    return -1
  }
  return _a > _b ? -1 : 1;
}

@connect(({ assetBrowser }) => ({ compress: assetBrowser.get('compressMode') }))
class Asset extends ImmutableComponent {
  onClick = () => {
    this.props.dispatch({
      type: 'assetBrowser/asset/clicked',
      payload: this.props.asset.get('id')
    })
  }

  onMouseEnter = (e) => {
    this.props.dispatch({
      type: 'assetBrowser/asset/hover/set',
      payload: this.props.asset.get('id')
    })
    const keys = ['name', 'func', 'type', 'dept', 'supplier', 'price', 'yoi']
    const reference = ReactDOM.findDOMNode(this)
    const clientRect = reference.getBoundingClientRect()
    const style = {
      pointerEvents: 'none',
      position: 'fixed',
      minWidth: 100,
      // top: clientRect.top,
      // left: clientRect.left,
      background: '#d8d8d8',
      border: '1px solid #5d87d4',
      borderRadius: 3,
      padding: '12px 7px',
      // transform: `translate(${clientRect.width + 10}px, ${clientRect.height / 2}px)`
    }

    if (clientRect.top > window.innerHeight * 0.6) {
      style.bottom = window.innerHeight - clientRect.bottom + clientRect.height / 2 + 'px'
    } else {
      style.top = clientRect.top + clientRect.height / 2 + 'px'
    }

    if (clientRect.left > window.innerWidth * 0.6) {
      style.right = window.innerWidth - clientRect.right + clientRect.width + 10 + 'px'
    } else {
      style.left = clientRect.left + clientRect.width + 10 + 'px'
    }
    this.el = this.el || ReactDOM.render((
      <div style={style}>
        {keys.map((key, index) => (
          <p style={{color: ['#848484'].concat(COLORS)[index]}} key={key}>
            {
              key === 'price' ? formatPrice(this.props.asset.get(key), 1) : this.props.asset.get(key)
            }
          </p>
        ))}
      </div>
    ), document.createElement('div'))
    document.body.appendChild(this.el)
  }

  onMouseLeave = () => {
    this.props.dispatch({
      type: 'assetBrowser/asset/hover/set',
      payload: null
    })
    document.body.removeChild(this.el)
  }

  render() {
    const { asset, columnIndex, index, compress } = this.props
    return (
      <rect
        onMouseEnter={!compress && this.onMouseEnter}
        onMouseLeave={!compress && this.onMouseLeave}
        onClick={!compress && this.onClick}
        style={{
          fill: asset.get('active') ? COLORS[columnIndex] : null,
          cursor: compress ? undefined : 'pointer',
          stroke: '#eaeaea',
          strokeWidth: 1,
        }}
        width={ASSET_WIDTH}
        height={compress ? COMPRESS_ASSET_HEIGHT : ASSET_HEIGHT}
        x={0}
        y={(compress ? 0 : index) * ASSET_HEIGHT}
      />
    )
  }
}

class Assets extends ImmutableComponent {
  render() {
    const { assets, columnIndex } = this.props
    return (
      <g>
        {
          assets.map((asset, index) => (
            <Asset
              key={asset.get('id')}
              index={index}
              columnIndex={columnIndex}
              asset={asset}
            />
          ))
        }
      </g>
    )
  }
}

@connect(({ assetBrowser }) => ({ compress: assetBrowser.get('compressMode') }))
class Cluster extends ImmutableComponent {
  calcTextY(columnOffset, clusterTop, clusterHeight, viewBoxYRange) {
    if (clusterTop + clusterHeight + columnOffset - 20 < viewBoxYRange[0]) {
      if (Math.abs(columnOffset) < 10 && clusterTop < 10) {
        return 0
      }
      return clusterHeight - 40
    } else if (clusterTop + columnOffset > viewBoxYRange[0]) {
      return 0
    } else {
      return viewBoxYRange[0] - clusterTop - columnOffset
    }
  }

  toggleFilter = () => {
    const { dimension, cluster } = this.props
    this.props.dispatch({
      type: 'assetBrowser/filters/toggle',
      payload: {
        dimension,
        key: cluster.get('key'),
        displayName: cluster.get('displayName')
      }
    })
  }

  render() {
    const { cluster, columnIndex, columnOffset, viewBoxOffsetY, viewBoxHeight, dimension, compress } = this.props
    let top = cluster.get('top')
    let topCompress = cluster.get('top_compress')
    const textY = this.calcTextY(columnOffset, top, cluster.get('children').size * ASSET_HEIGHT, [viewBoxOffsetY, viewBoxOffsetY + viewBoxHeight])
    let assets = cluster.get('children')
    return (
      <g
        transform={`translate(0, ${compress ? topCompress : top})`}
        fill={cluster.get('assetActive') ? INACTIVE_COLORS[columnIndex] : COLORS[columnIndex]}
        >
        <text
          style={{
            cursor: 'pointer',
            fill: COLORS[columnIndex]
          }}
          onClick={this.toggleFilter}
          textAnchor="end"
          x="0"
          y={textY}
          dx="-0.5em"
          dy="0.8em"
          >
          {trimString(cluster.get('displayName'), 20)}
        </text>
        <text
          style={{
            cursor: 'pointer',
            fill: COLORS[columnIndex]
          }}
          onClick={this.toggleFilter}
          textAnchor="end"
          x="0"
          y={textY}
          dx="-0.5em"
          dy="2em"
          >
          {cluster.get('children').size}台
        </text>
        <Assets
          assets={assets}
          columnIndex={columnIndex}
        />
      </g>
    )
  }
}

class Column extends ImmutableComponent {
  render() {
    const { column, viewBoxWidth, viewBoxHeight, viewBoxOffsetY, index } = this.props
    const clusters = column.get('clusters')
    return (
      <Motion
        defaultStyle={{
          offset: 0
        }}
        style={{
          offset: spring(column.get('offset'))
        }}>
        {
          style => (
            <g transform={`translate(${column.get('left') - ASSET_WIDTH / 2}, ${style.offset})`}>
              {
                clusters.map(cluster => (
                  <Cluster
                    key={cluster.get('key')}
                    cluster={cluster}
                    dimension={column.get('dimension')}
                    columnOffset={style.offset}
                    columnIndex={index}
                    viewBoxOffsetY={viewBoxOffsetY}
                    viewBoxHeight={viewBoxHeight}
                  />
                ))
              }
            </g>
          )
        }
      </Motion>
    )
  }
}

@connect(({assetBrowser}) => ({
  hoveredAssetId: assetBrowser.get('hoveredAssetId'),
  activeAssetId: assetBrowser.get('activeAssetId'),
  columns: assetBrowser.get('columns'),
  viewBoxHeight: assetBrowser.getIn(['viewBox', 'height']),
  compress: assetBrowser.get('compressMode')
}))
class Lines extends ImmutableComponent {
  onHover = id => e => this.props.dispatch({
    type: 'assetBrowser/asset/hover/set',
    payload: id
  })

  onLeave = e => this.props.dispatch({
    type: 'assetBrowser/asset/hover/set',
    payload: null
  })

  render() {
    const { viewBoxOffsetY, viewBoxHeight, hoveredAssetId, activeAssetId, columns, compress } = this.props
    if (compress) {
      return null
    }
    const viewBoxTop = viewBoxOffsetY
    const viewBoxBottom = viewBoxOffsetY + viewBoxHeight
    if (viewBoxHeight === 0) return null
    if (columns.size === 0) return null

    const columnsWithClustersInViewBox = columns.map(column => column.update('clusters', clusters => {
      const columnOffset = column.get('offset')
      return clusters.filter(cluster => {
        const top = columnOffset + compress ? cluster.get('top_compress') : cluster.get('top')
        const bottom = top + compress ? COMPRESS_ASSET_HEIGHT : cluster.get('children').size * ASSET_HEIGHT
        return (top <= viewBoxBottom) && (bottom >= viewBoxTop)
      })
    }))
    const visibleAssetsInColumns = columnsWithClustersInViewBox.map(
      column => column
      .get('clusters')
      .flatMap(cluster => cluster
        .get('children')
        .map((asset, index) => asset.set('top', column.get('offset') + compress ? (cluster.get('top_compress') + 10) : (cluster.get('top') + index * ASSET_HEIGHT)))
        .filter(asset => {
          const top = asset.get('top')
          const bottom = top + ASSET_HEIGHT
          return (top >= viewBoxTop) && (bottom <= viewBoxBottom)
        })
      )
    )

    const connectableAssets = visibleAssetsInColumns.map(
      assets => assets
      .filter(
        asset => visibleAssetsInColumns
        .every(
          assets => assets
          .find(testAsset => testAsset.get('id') === asset.get('id'))
        )
      )
      // .filter(asset => activeAssetId ? asset.get('id') === activeAssetId : true)
      .sort((a, b) => {
        if (a.get('id') === b.get('id')) return 0
        return a.get('id') > b.get('id') ? 1 : -1
      })
    )

    const firstColumn = connectableAssets.get(0)
    const lines = firstColumn.zipWith(
      (...array) => Immutable.List(array),
      ...connectableAssets.slice(1, connectableAssets.size).toArray()
    )

    return (
      <g>
        {
          lines.flatMap(line => line.reduce((prev, cur, index, line) => {
            if (index === 0) return prev
            return prev.push(Immutable.List([line.get(index - 1), cur]))
          }, Immutable.List([])).map((pair, index) => (
            <Motion
              // key={pair.getIn([0, 'id']) + index}
              key={pair.getIn([0, 'id']) + '-' + index}
              defaultStyle={{
                x0: columns.getIn([index, 'left']) + ASSET_WIDTH / 2,
                y0: pair.getIn([0, 'top']) + ASSET_HEIGHT / 2,
                x1: columns.getIn([index + 1, 'left']) - ASSET_WIDTH / 2,
                y1: pair.getIn([1, 'top']) + ASSET_HEIGHT / 2,
                opacity: 0
              }}
              style={{
                x0: columns.getIn([index, 'left']) + ASSET_WIDTH / 2,
                y0: spring(pair.getIn([0, 'top']) + ASSET_HEIGHT / 2),
                x1: columns.getIn([index + 1, 'left']) - ASSET_WIDTH / 2,
                y1: spring(pair.getIn([1, 'top']) + ASSET_HEIGHT / 2),
                opacity: spring(0.4)
              }}
              >
              {
                style => (
                  <path
                    onMouseEnter={this.onHover(pair.getIn([0, 'id']))}
                    onMouseLeave={this.onLeave}
                    opacity={style.opacity}
                    stroke={(hoveredAssetId === pair.getIn([0, 'id']) || pair.getIn([0, 'active'])) ? '#5d87d4' : '#bcbcbc'}
                    strokeWidth={pair.getIn[0, 'active'] ? 4 : 2}
                    fill="none"
                    d={`M ${style.x0}, ${style.y0} C ${(style.x0 + style.x1) / 2}, ${style.y0} ${(style.x0 + style.x1) / 2}, ${style.y1} ${style.x1} ${style.y1}`}
                  />
                )
              }
            </Motion>
          )))
        }
      </g>
    )
  }
}


@connect(({ assetBrowser}) => ({assetBrowser}))
class ChartBody extends ImmutableComponent {
  updateViewBox = () => {
    const clientRect = ReactDOM.findDOMNode(this).getBoundingClientRect()
    this.props.dispatch({
      type: 'assetBrowser/viewBox/update',
      payload: {
        width: clientRect.width,
        height: clientRect.height,
        left: clientRect.left,
        right: clientRect.right,
        top: clientRect.top,
        bottom: clientRect.bottom
      }
    })
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateViewBox)
    this.updateViewBox()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateViewBox)
  }

  render() {
    const { assetBrowser } = this.props
    const width = assetBrowser.getIn(['viewBox', 'width'])
    const height = assetBrowser.getIn(['viewBox', 'height'])
    const pageIndex = assetBrowser.get('pageIndex')
    const dimensions = assetBrowser.get('dimensions')
    // const assets = assetBrowser.get('assets')
    const filters = assetBrowser.get('filters')
    const activeAssetId = assetBrowser.get('activeAssetId')
    // const hoveredAssetId = assetBrowser.get('hoveredAssetId')
    const columns = assetBrowser.get('columns')

    return (
      <Motion
        defaultStyle={{
          viewBoxOffsetY: 0
        }}
        style={{
          viewBoxOffsetY: spring(pageIndex * height)
        }}>
        {
          style => (
            <svg
              className={styles['chart-body']}
              viewBox={`0 ${style.viewBoxOffsetY} ${width} ${style.viewBoxOffsetY + height}`}
              preserveAspectRatio="xMinYMin slice">
              <Lines
                viewBoxOffsetY={style.viewBoxOffsetY}
              />
              {
                columns.map((column, index) => (
                  <Column
                    key={column.get('dimension')}
                    column={column}
                    viewBoxWidth={width}
                    viewBoxHeight={height}
                    viewBoxOffsetY={style.viewBoxOffsetY}
                    index={index}
                  />
                ))
              }
            </svg>
          )
        }
      </Motion>
    )
  }
}

@connect(({assetBrowser}) => ({
  activeAssetId: assetBrowser.get('activeAssetId'),
  pageIndex: assetBrowser.get('pageIndex'),
  maxPage: assetBrowser.get('maxPage'),
  maxPageCompress: assetBrowser.get('maxPageCompress'),
  compress: assetBrowser.get('compressMode')
}))
class Pagination extends ImmutableComponent {
  diffPage = diff => e => {
    if (this.props.activeAssetId) {
      this.props.dispatch({
        type: 'assetBrowser/active/clear'
      })
      setTimeout(() => this.props.dispatch({
        type: 'assetBrowser/page/change',
        payload: diff
      }), 500)
    } else {
      this.props.dispatch({
        type: 'assetBrowser/page/change',
        payload: diff
      })
    }
  }

  render() {
    const { pageIndex, maxPage } = this.props
    return (
      <div className={styles['pagination']}>
        <div
          className={styles['arrow-up']}
          onClick={this.diffPage(-1)}
        />
        <div className={styles['content']}>
          <span>{pageIndex + 1}</span>
          /
          <span>{maxPage}</span>
        </div>
        <div
          onClick={this.diffPage(1)}
          className={styles['arrow-down']}
        />
      </div>
    )
  }
}

export default
@connect(({assetBrowser}) => ({ activeAssetId: assetBrowser.get('activeAssetId')}))
class Chart extends ImmutableComponent {
  shouldComponentUpdate() {
    return false
  }

  componentDidMount() {
    this.wheelIndicator = new WheelIndicator({
      elem: ReactDOM.findDOMNode(this),
      callback: e => {
        if (this.props.activeAssetId) {
          this.props.dispatch({
            type: 'assetBrowser/active/clear'
          })
          setTimeout(() => this.props.dispatch({
            type: 'assetBrowser/page/change',
            payload: e.direction === 'up' ? -1 : 1
          }), 500)
        } else {
          this.props.dispatch({
            type: 'assetBrowser/page/change',
            payload: e.direction === 'up' ? -1 : 1
          })
        }
      }
    })
  }

  componentWillUnmount() {
    this.wheelIndicator.destroy()
    this.WheelIndicator = null
  }

  render() {
    return (
      <div className={styles['chart']}>
        <ChartHeader />
        <ChartBody />
        <Pagination />
      </div>
    )
  }
}
