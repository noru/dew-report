import React from 'react'
import { Select, Checkbox, Icon } from 'antd'
import { is } from 'immutable'
import { connect } from 'dva/mobile'
import Chart from './Chart'
import { formatKey } from '#/models/assetBrowser'
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
  filters: assetBrowser.get('filters'),
  assets: assetBrowser.get('assets'),
  rulers: assetBrowser.get('rulers'),
  compress: assetBrowser.get('compressMode'),
}))
class Header extends ImmutableComponent {
  onOrderByChange = e => {
    this.props.dispatch({
      type: 'assetBrowser/orderBy/set',
      payload: e
    })
  }
  removeLastFilter = () => {
    this.props.dispatch({
      type: 'assetBrowser/filters/removeLast'
    })
  }
  toggleCompressMode = e => {
    this.props.dispatch({ type: 'assetBrowser/set/compressMode', payload: !e.target.checked })
  }
  render() {
    let { filters, assets, rulers, compress } = this.props
    assets = assets.filter(asset => {
      return filters.every(filter => {
        const formattedKey = formatKey(asset, filter.get('dimension'), rulers.find(ruler => ruler.get('dimension') === filter.get('dimension')))
        return formattedKey === filter.get('key')
      })
    })
    return (
      <div className={styles['header']}>
        <div className={styles['breadcrumb']}>
          <span>全部设备</span>
          {
            filters.map((filter, index) => (
              [
                <span key={index} className={styles['arrow']}>></span>
                ,
                <span key={filter.get('key')} className={styles['filter']} data-is-last={index === filters.size - 1}>{filter.get('displayName')}</span>
              ]
            ))
          }
          {
            filters.size ? <span onClick={this.removeLastFilter} className={styles['remove']}><Icon type="close-circle-o"/></span> : null
          }
        </div>

        <div className={styles['right']}>
          <div className={styles['stats']}>
            <span className={styles['current']}>当前设备：</span>
            <span className={styles['number']}>{assets.size}</span>
            <span className={styles['unit']}>台</span>
          </div>
          <Select
            className={styles['select']}
            dropdownClassName={styles['dropdown']}
            defaultValue="price"
            onChange={this.onOrderByChange}>
            <Option value="price">按分类平均价值排序</Option>
            <Option value="devices">按分类设备数量排序</Option>
          </Select>
          <Checkbox
            checked={!compress}
            onChange={this.toggleCompressMode}
          >
            按设备显示
          </Checkbox>
        </div>
      </div>
    )
  }
}

export default
@connect(({assetBrowser}) => ({
  loading: assetBrowser.get('loading'),
  failed: assetBrowser.get('failed')
}))
class AssetBrowser extends ImmutableComponent {
  render() {
    if (this.props.loading) return (
      <div className={styles['asset-browser']}>
        <div className={styles['loading']}>
          加载中...
        </div>
      </div>
    )
    if (this.props.failed) return (
      <div className={styles['asset-browser']}>
        <div className={styles['failure']}>
          加载数据失败，请刷新重试
        </div>
      </div>
    )
    return (
      <div className={styles['asset-browser']}>
        <Header />
        <Chart />
      </div>
    )
  }
}
