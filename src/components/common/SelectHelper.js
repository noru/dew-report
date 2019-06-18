import React from 'react'
import { find } from 'lodash-es'
import { Select } from 'antd'
import SID from 'shortid'

type Option = {
  key: any,
  label: string | number,
}

export default function selectHelper(defaultKey: string, options: Array<Option>, onChange: func) {
  // HACK: when i18n is not ready, label would fallback to the key
  // and defaultValue only rendered once
  // so do this trick at initial phrase
  let defaultValue = find(options, {key: String(defaultKey)}) || options[0]
  if (defaultValue === undefined || defaultValue.key === defaultValue.label) {
    return null
  }
  return (
    <Select
      key={SID.generate()}
      labelInValue
      style={{width: 120}}
      defaultValue={defaultValue}
      dropdownMatchSelectWidth={false}
      optionFilterProp="children"
      onChange={onChange}>
      {options.map(o => (
        <Select.Option key={o.key} value={o.key}>{o.label}</Select.Option>
      ))}
    </Select>
  )
}