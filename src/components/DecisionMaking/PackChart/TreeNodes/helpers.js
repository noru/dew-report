import type { cursorT, NodeT } from '#/types'

import styles from './styles.scss'

// todo: hard code field
export function getCircleStrokeCls (n: NodeT): string {
  const circleStrokeCls = [
    styles.strokeYellow,
    styles.strokeGray,
    styles.strokeOrange
  ]

  const { usage_predict, usage_threshold = [0.3, 1] } = n.data

  let colorIndex = 1
  if (usage_predict > usage_threshold[1]) colorIndex =  2
  else if (usage_predict < usage_threshold[0]) colorIndex = 0
  
  return circleStrokeCls[colorIndex]
}

export function getWaveFillCls (n: NodeT): string {
  const waveFillCls = [
    styles.fillYellow,
    styles.fillGray,
    styles.fillOrange
  ]

  const { usage_predict, usage_threshold = [0.3, 1] } = n.data

  let colorIndex = 1
  if (usage_predict > usage_threshold[1]) colorIndex =  2
  else if (usage_predict < usage_threshold[0]) colorIndex = 0
  
  return waveFillCls[colorIndex]
}